from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from database import engine, Base, get_db
import models

from calculator import (
    calculate_dti,
    calculate_credit_utilization,
    assess_financial_health
)

from schemas import (
    FinancialDataInput,
    FinancialAnalysisResponse,
    UserRegister,
    UserLogin,
    LoanInput
)

from gemini_service import generate_financial_explanation


# --------------------------------------------------
# DATABASE INITIALIZATION
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# PASSWORD HASHING
# --------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# --------------------------------------------------
# FASTAPI APPLICATION
# --------------------------------------------------

app = FastAPI(
    title="Credit Assistant API",
    description="Backend service for AI-Powered Financial Health Advisor",
    version="1.0.0"
)


# --------------------------------------------------
# CORS CONFIGURATION
# --------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "https://credit-assistant.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Credit Assistant API",
        "health_check": "/health",
        "analyze_endpoint": "/analyze",
        "register_endpoint": "/register",
        "login_endpoint": "/login",
        "profile_endpoint": "/profile/{user_id}",
        "loans_endpoint": "/loans/{user_id}"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "ok"
    }


# --------------------------------------------------
# USER REGISTRATION
# --------------------------------------------------

@app.post("/register")
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )

    password_hash = pwd_context.hash(
        user.password
    )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=password_hash
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


# --------------------------------------------------
# USER LOGIN
# --------------------------------------------------

@app.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(models.User).filter(
        models.User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    password_valid = pwd_context.verify(
        user.password,
        existing_user.password_hash
    )

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    return {
        "message": "Login successful",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }


# --------------------------------------------------
# SAVE FINANCIAL PROFILE
# --------------------------------------------------

@app.post("/profile/{user_id}")
def save_financial_profile(
    user_id: int,
    data: FinancialDataInput,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # CHECK USER
    # --------------------------------------------------

    existing_user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    # --------------------------------------------------
    # VALIDATE INCOME
    # --------------------------------------------------

    if data.monthly_income <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly income must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE DEBT
    # --------------------------------------------------

    if data.monthly_debt < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly debt cannot be negative."
        )

    # --------------------------------------------------
    # VALIDATE CREDIT LIMIT
    # --------------------------------------------------

    if data.credit_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total credit limit must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE CREDIT USED
    # --------------------------------------------------

    if data.credit_used < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot be negative."
        )

    # --------------------------------------------------
    # CREDIT USED CANNOT EXCEED LIMIT
    # --------------------------------------------------

    if data.credit_used > data.credit_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot exceed total credit limit."
        )

    # --------------------------------------------------
    # VALIDATE CIBIL
    # --------------------------------------------------

    if (
        data.current_cibil_score < 300
        or data.current_cibil_score > 900
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current CIBIL score must be between 300 and 900."
        )

    # --------------------------------------------------
    # VALIDATE CIBIL HISTORY
    # --------------------------------------------------

    for score in data.credit_score_history:

        if score < 300 or score > 900:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Historical score {score} is invalid. "
                    "All scores must be between 300 and 900."
                )
            )

    # --------------------------------------------------
    # CHECK EXISTING PROFILE
    # --------------------------------------------------

    existing_profile = db.query(
        models.FinancialProfile
    ).filter(
        models.FinancialProfile.user_id == user_id
    ).first()

    # --------------------------------------------------
    # CREATE OR UPDATE PROFILE
    # --------------------------------------------------

    if existing_profile:

        existing_profile.monthly_income = data.monthly_income
        existing_profile.monthly_debt = data.monthly_debt
        existing_profile.credit_limit = data.credit_limit
        existing_profile.credit_used = data.credit_used
        existing_profile.current_cibil_score = (
            data.current_cibil_score
        )

        profile = existing_profile

        message = "Financial profile updated successfully"

    else:

        new_profile = models.FinancialProfile(
            user_id=user_id,
            monthly_income=data.monthly_income,
            monthly_debt=data.monthly_debt,
            credit_limit=data.credit_limit,
            credit_used=data.credit_used,
            current_cibil_score=data.current_cibil_score
        )

        db.add(new_profile)

        profile = new_profile

        message = "Financial profile saved successfully"

    # --------------------------------------------------
    # SAVE CIBIL SCORE HISTORY
    # --------------------------------------------------

    db.query(models.ScoreHistory).filter(
        models.ScoreHistory.user_id == user_id
    ).delete()

    for score in data.credit_score_history:

        history_record = models.ScoreHistory(
            user_id=user_id,
            score=score
        )

        db.add(history_record)

    # --------------------------------------------------
    # COMMIT
    # --------------------------------------------------

    db.commit()
    db.refresh(profile)

    return {
        "message": message,
        "profile_id": profile.id,
        "user_id": profile.user_id,
        "monthly_income": profile.monthly_income,
        "monthly_debt": profile.monthly_debt,
        "credit_limit": profile.credit_limit,
        "credit_used": profile.credit_used,
        "current_cibil_score": profile.current_cibil_score,
        "credit_score_history": data.credit_score_history
    }


# --------------------------------------------------
# FINANCIAL HEALTH ANALYSIS
# --------------------------------------------------

@app.post(
    "/analyze",
    response_model=FinancialAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Financial Health",
    description=(
        "Validates financial parameters, calculates financial "
        "health, and generates an AI explanation."
    )
)
def analyze_financial_health(
    data: FinancialDataInput,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # VALIDATE INCOME
    # --------------------------------------------------

    if data.monthly_income <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly income must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE DEBT
    # --------------------------------------------------

    if data.monthly_debt < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly debt cannot be negative."
        )

    # --------------------------------------------------
    # VALIDATE CREDIT LIMIT
    # --------------------------------------------------

    if data.credit_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total credit limit must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE CREDIT USED
    # --------------------------------------------------

    if data.credit_used < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot be negative."
        )

    # --------------------------------------------------
    # CREDIT LIMIT CHECK
    # --------------------------------------------------

    if data.credit_used > data.credit_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot exceed total credit limit."
        )

    # --------------------------------------------------
    # VALIDATE CIBIL
    # --------------------------------------------------

    if (
        data.current_cibil_score < 300
        or data.current_cibil_score > 900
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current CIBIL score must be between 300 and 900."
        )

    # --------------------------------------------------
    # VALIDATE CIBIL HISTORY
    # --------------------------------------------------

    for score in data.credit_score_history:

        if score < 300 or score > 900:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Historical score {score} is invalid. "
                    "All scores must be between 300 and 900."
                )
            )

    # --------------------------------------------------
    # CORE CALCULATIONS
    # --------------------------------------------------

    dti_ratio = calculate_dti(
        data.monthly_debt,
        data.monthly_income
    )

    credit_utilization = calculate_credit_utilization(
        data.credit_used,
        data.credit_limit
    )

    # --------------------------------------------------
    # FINANCIAL HEALTH
    # --------------------------------------------------

    financial_health = assess_financial_health(
        dti_ratio,
        credit_utilization,
        data.current_cibil_score
    )

    # --------------------------------------------------
    # FIND USER LOAN INFORMATION
    # --------------------------------------------------

    loan_type = None
    loan_amount = None
    monthly_emi = None
    missed_payments = None

    if data.user_id:

        loan = db.query(
            models.Loan
        ).filter(
            models.Loan.user_id == data.user_id
        ).order_by(
            models.Loan.id.desc()
        ).first()

        if loan:

            loan_type = loan.loan_type
            loan_amount = loan.loan_amount
            monthly_emi = loan.monthly_emi
            missed_payments = loan.missed_payments

    # --------------------------------------------------
    # GEMINI AI EXPLANATION
    # --------------------------------------------------

    try:

        ai_explanation = generate_financial_explanation(

            monthly_income=data.monthly_income,

            monthly_debt=data.monthly_debt,

            dti=dti_ratio,

            credit_utilization=credit_utilization,

            cibil_score=data.current_cibil_score,

            health_status=financial_health,

            credit_score_history=data.credit_score_history,

            loan_type=loan_type,

            loan_amount=loan_amount,

            monthly_emi=monthly_emi,

            missed_payments=missed_payments
        )

    except Exception as e:

        print("AI service error:", e)

        ai_explanation = """
FINANCIAL SUMMARY

Your financial information has been analyzed using the calculated financial metrics.

KEY OBSERVATIONS

- Your Debt-to-Income Ratio has been calculated.
- Your credit utilization has been calculated.
- Your current CIBIL score has been considered.
- Your entered credit score history has been reviewed.
- Your loan and missed payment information has been considered.

5-STEP ACTION PLAN

1. Monitor Credit Utilization
Keep your credit utilization under control and avoid unnecessary credit usage.

2. Pay EMIs On Time
Make all loan and credit payments before their due dates.

3. Reduce Outstanding Debt
Gradually reduce unnecessary outstanding debt where possible.

4. Avoid Unnecessary Credit Applications
Apply for new credit only when genuinely required.

5. Monitor Your Credit Progress
Regularly review your credit score and financial health.

This information is educational and does not guarantee a specific credit score increase or financial outcome.
"""

    # --------------------------------------------------
    # RETURN FINAL ANALYSIS
    # --------------------------------------------------

    return FinancialAnalysisResponse(

        # IMPORTANT:
        # schemas.py expects "dti", NOT "dti_ratio"
        dti=dti_ratio,

        credit_utilization=credit_utilization,

        current_cibil_score=data.current_cibil_score,

        financial_health=financial_health,

        ai_explanation=ai_explanation,

        metrics_summary={

            "monthly_income":
                data.monthly_income,

            "monthly_debt":
                data.monthly_debt,

            "credit_limit":
                data.credit_limit,

            "credit_used":
                data.credit_used,

            "history_count":
                len(data.credit_score_history),

            "score_trend":
                data.credit_score_history
        },

        # Frontend needs this for CIBIL trend
        credit_score_history=data.credit_score_history
    )


# --------------------------------------------------
# SAVE LOAN DETAILS
# --------------------------------------------------

@app.post("/loans/{user_id}")
def add_loan(
    user_id: int,
    data: LoanInput,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # CHECK USER
    # --------------------------------------------------

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # --------------------------------------------------
    # VALIDATE LOAN TYPE
    # --------------------------------------------------

    if not data.loan_type.strip():

        raise HTTPException(
            status_code=400,
            detail="Loan type cannot be empty."
        )

    # --------------------------------------------------
    # VALIDATE LOAN AMOUNT
    # --------------------------------------------------

    if data.loan_amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Loan amount must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE EMI
    # --------------------------------------------------

    if data.monthly_emi <= 0:

        raise HTTPException(
            status_code=400,
            detail="Monthly EMI must be greater than zero."
        )

    # --------------------------------------------------
    # VALIDATE MISSED PAYMENTS
    # --------------------------------------------------

    if data.missed_payments < 0:

        raise HTTPException(
            status_code=400,
            detail="Missed payments cannot be negative."
        )

    # --------------------------------------------------
    # CREATE LOAN
    # --------------------------------------------------

    loan = models.Loan(

        user_id=user_id,

        loan_type=data.loan_type,

        loan_amount=data.loan_amount,

        monthly_emi=data.monthly_emi,

        missed_payments=data.missed_payments
    )

    db.add(loan)

    db.commit()

    db.refresh(loan)

    return {

        "message":
            "Loan details saved successfully",

        "loan_id":
            loan.id,

        "user_id":
            user_id,

        "loan_type":
            loan.loan_type,

        "loan_amount":
            loan.loan_amount,

        "monthly_emi":
            loan.monthly_emi,

        "missed_payments":
            loan.missed_payments
    }


# --------------------------------------------------
# GET USER LOANS
# --------------------------------------------------

@app.get("/loans/{user_id}")
def get_user_loans(
    user_id: int,
    db: Session = Depends(get_db)
):

    # --------------------------------------------------
    # CHECK USER
    # --------------------------------------------------

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # --------------------------------------------------
    # GET LOANS
    # --------------------------------------------------

    loans = db.query(
        models.Loan
    ).filter(
        models.Loan.user_id == user_id
    ).all()

    # --------------------------------------------------
    # RETURN LOANS
    # --------------------------------------------------

    return [

        {
            "id": loan.id,

            "loan_type":
                loan.loan_type,

            "loan_amount":
                loan.loan_amount,

            "monthly_emi":
                loan.monthly_emi,

            "missed_payments":
                loan.missed_payments
        }

        for loan in loans
    ]