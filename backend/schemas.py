from pydantic import BaseModel, Field
from typing import List


# ============================================================
# FINANCIAL DATA INPUT
# ============================================================

class FinancialDataInput(BaseModel):
    user_id: int | None = None

    monthly_income: float
    monthly_debt: float

    credit_limit: float
    credit_used: float

    current_cibil_score: int

    credit_score_history: List[int]


# ============================================================
# FINANCIAL ANALYSIS RESPONSE
# ============================================================

class FinancialAnalysisResponse(BaseModel):
    dti: float
    credit_utilization: float
    current_cibil_score: int
    financial_health: str

    ai_explanation: str

    metrics_summary: dict | None = None

    credit_score_history: List[int] | None = None


# ============================================================
# USER REGISTRATION
# ============================================================

class UserRegister(BaseModel):
    name: str
    email: str
    password: str


# ============================================================
# USER LOGIN
# ============================================================

class UserLogin(BaseModel):
    email: str
    password: str


# ============================================================
# LOAN INPUT
# ============================================================

class LoanInput(BaseModel):
    loan_type: str
    loan_amount: float
    monthly_emi: float
    missed_payments: int = 0