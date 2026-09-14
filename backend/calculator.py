"""
Core financial calculation logic for Credit Assistant.
"""


def calculate_dti(monthly_debt: float, monthly_income: float) -> float:
    """
    Calculate Debt-to-Income (DTI) ratio.
    Formula: (monthly_debt / monthly_income) * 100
    """
    if monthly_income <= 0:
        raise ValueError("Monthly income must be greater than zero.")

    return round((monthly_debt / monthly_income) * 100, 2)


def calculate_credit_utilization(
    credit_used: float,
    credit_limit: float
) -> float:
    """
    Calculate Credit Utilization Ratio.
    Formula: (credit_used / credit_limit) * 100
    """
    if credit_limit <= 0:
        raise ValueError("Credit limit must be greater than zero.")

    return round((credit_used / credit_limit) * 100, 2)


def assess_financial_health(
    dti_ratio: float,
    credit_utilization: float,
    cibil_score: float
) -> str:
    """
    Assess overall financial health using DTI,
    credit utilization, and CIBIL score.
    """

    score = 0

    # DTI assessment
    if dti_ratio <= 20:
        score += 2
    elif dti_ratio <= 35:
        score += 1

    # Credit utilization assessment
    if credit_utilization <= 30:
        score += 2
    elif credit_utilization <= 50:
        score += 1

    # CIBIL score assessment
    if cibil_score >= 750:
        score += 2
    elif cibil_score >= 700:
        score += 1

    # Overall classification
    if score >= 5:
        return "Good"
    elif score >= 3:
        return "Moderate"
    else:
        return "Needs Attention"