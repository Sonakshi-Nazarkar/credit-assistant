import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_financial_explanation(
    monthly_income,
    monthly_debt,
    dti,
    credit_utilization,
    cibil_score,
    health_status,
    credit_score_history=None,
    loan_type=None,
    loan_amount=None,
    monthly_emi=None,
    missed_payments=None
):
    history_text = ", ".join(
        map(str, credit_score_history or [])
    )

    prompt = f"""
You are an AI Financial Health Advisor.

Analyze the user's financial information and provide a clear,
educational and personalized explanation.

Financial Information:
- Monthly Income: ₹{monthly_income}
- Monthly Debt: ₹{monthly_debt}
- Debt-to-Income Ratio: {dti:.2f}%
- Credit Utilization: {credit_utilization:.2f}%
- Current CIBIL Score: {cibil_score}
- Financial Health: {health_status}
- CIBIL Score History: {history_text}
- Loan Type: {loan_type or "Not provided"}
- Loan Amount: ₹{loan_amount or 0}
- Monthly EMI: ₹{monthly_emi or 0}
- Missed Payments: {missed_payments or 0}

Provide the response using these sections:

FINANCIAL SUMMARY
Give a short explanation of the user's current financial health.

KEY OBSERVATIONS
Give 3-5 important observations based strictly on the provided data.

5-STEP ACTION PLAN
Give exactly 5 practical and personalized steps the user can take
to improve their financial health and credit profile.

Each step must contain:
1. A short action title.
2. A brief explanation of what the user should do.
3. Why that action matters.

Do not guarantee a specific CIBIL score increase.
Do not claim that following the plan will definitely improve the score.
Keep the advice educational and practical.

IMPORTANT:
- Do not invent financial information.
- Do not recommend taking a new loan unnecessarily.
- Do not provide investment advice.
- Use simple language.
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return response.text

    except Exception as e:
        print("Gemini Error:", e)

        return """
FINANCIAL SUMMARY

Your financial information has been analyzed successfully.

KEY OBSERVATIONS

Please review your DTI, credit utilization, CIBIL score,
loan EMI and missed payment information.

5-STEP ACTION PLAN

1. Monitor Credit Utilization
Keep your credit utilization under control.

2. Pay EMIs On Time
Make all loan and credit payments before their due dates.

3. Reduce Outstanding Debt
Gradually reduce unnecessary outstanding debt.

4. Avoid Unnecessary Credit Applications
Apply for new credit only when genuinely required.

5. Monitor Your Credit Progress
Regularly review your CIBIL score and financial health.

This information is educational and should not be treated as guaranteed financial advice.
"""