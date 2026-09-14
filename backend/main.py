from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from calculator import (
    calculate_dti,
    calculate_credit_utilization,
    assess_financial_health
)

from schemas import FinancialDataInput, FinancialAnalysisResponse

from gemini_service import generate_financial_explanation


# Initialize FastAPI application
app = FastAPI(
    title="Credit Assistant API",
    description="Backend service for AI-Powered Financial Health Advisor",
    version="1.0.0"
)


# Configure CORS for React frontend communication
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


@app.get("/")
def read_root():
    return {
        "message": "Welcome to Credit Assistant API",
        "health_check": "/health",
        "analyze_endpoint": "/analyze"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/analyze",
    response_model=FinancialAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Financial Health",
    description="Validates financial parameters, calculates financial health, and generates an AI explanation."
)
def analyze_financial_health(data: FinancialDataInput):

    # 1. Income validation
    if data.monthly_income <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly income must be greater than zero."
        )

    # 2. Debt validation
    if data.monthly_debt < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monthly debt cannot be negative."
        )

    # 3. Credit limit validation
    if data.credit_limit <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Total credit limit must be greater than zero."
        )

    # 4. Credit used validation
    if data.credit_used < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot be negative."
        )

    # 5. Credit limit vs used check
    if data.credit_used > data.credit_limit:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current credit used cannot exceed total credit limit."
        )

    # 6. CIBIL score validation
    if data.current_cibil_score < 300 or data.current_cibil_score > 900:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current CIBIL score must be between 300 and 900."
        )

    # 7. CIBIL score history validation
    for score in data.credit_score_history:
        if score < 300 or score > 900:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Historical score {score} is invalid. "
                       "All scores must be between 300 and 900."
            )

    # --------------------------------------------------
    # CORE FINANCIAL CALCULATIONS
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
    # OVERALL FINANCIAL HEALTH
    # --------------------------------------------------

    financial_health = assess_financial_health(
        dti_ratio,
        credit_utilization,
        data.current_cibil_score
    )

    # --------------------------------------------------
    # GEMINI AI EXPLANATION
    # --------------------------------------------------

    ai_explanation = generate_financial_explanation(
        dti_ratio,
        credit_utilization,
        data.current_cibil_score,
        financial_health
    )

    # --------------------------------------------------
    # RETURN FINAL ANALYSIS
    # --------------------------------------------------

    return FinancialAnalysisResponse(
        dti_ratio=dti_ratio,
        credit_utilization=credit_utilization,
        current_cibil_score=data.current_cibil_score,
        financial_health=financial_health,
        ai_explanation=ai_explanation,
        metrics_summary={
            "monthly_income": data.monthly_income,
            "monthly_debt": data.monthly_debt,
            "credit_limit": data.credit_limit,
            "credit_used": data.credit_used,
            "history_count": len(data.credit_score_history),
            "score_trend": data.credit_score_history
        }
    )