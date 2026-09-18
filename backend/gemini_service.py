import os
import time

from google import genai
from dotenv import load_dotenv


# --------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# --------------------------------------------------

load_dotenv()


# --------------------------------------------------
# GEMINI CLIENT
# --------------------------------------------------

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# --------------------------------------------------
# GENERATE FINANCIAL EXPLANATION
# --------------------------------------------------

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

    # --------------------------------------------------
    # CREDIT SCORE HISTORY
    # --------------------------------------------------

    history_text = ", ".join(
        map(str, credit_score_history or [])
    )


    # --------------------------------------------------
    # AI PROMPT
    # --------------------------------------------------

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

Analyze ONLY the information provided above.

Provide the response using exactly these sections:

FINANCIAL SUMMARY

Give a short personalized explanation of the user's current
financial health using their actual numbers.

KEY OBSERVATIONS

Give 3-5 important observations based strictly on the provided data.

Mention relevant values such as:
- DTI
- Credit utilization
- CIBIL score
- CIBIL score trend
- Loan EMI
- Missed payments

5-STEP ACTION PLAN

Give exactly 5 practical and personalized steps the user can take
to improve their financial health and credit profile.

For each step provide:

1. A short action title.
2. What the user should do.
3. Why that action matters.

Make the recommendations specific to the user's provided
financial information.

Do not guarantee a specific CIBIL score increase.

Do not claim that following the plan will definitely improve
the user's score.

Keep the advice educational, practical and easy to understand.

IMPORTANT:

- Do not invent financial information.
- Do not assume information that was not provided.
- Do not recommend taking a new loan unnecessarily.
- Do not provide investment advice.
- Use simple language.
- Keep the response concise but useful.
"""


    # --------------------------------------------------
    # PRIMARY MODEL WITH RETRIES
    # --------------------------------------------------

    primary_model = "gemini-3.6-flash"

    for attempt in range(3):

        try:

            print(
                f"Gemini attempt {attempt + 1}/3 using {primary_model}"
            )

            response = client.models.generate_content(
                model=primary_model,
                contents=prompt
            )

            # --------------------------------------------------
            # CHECK RESPONSE
            # --------------------------------------------------

            if response and response.text:

                print("Gemini response received successfully.")

                return response.text.strip()

            print("Gemini returned an empty response.")

        except Exception as e:

            print(
                f"Gemini attempt {attempt + 1} failed:",
                e
            )

            # Wait before retrying
            if attempt < 2:
                time.sleep(2)


    # --------------------------------------------------
    # BACKUP MODEL
    # --------------------------------------------------

    backup_model = "gemini-3.5-flash-lite"

    try:

        print(
            f"Trying backup Gemini model: {backup_model}"
        )

        response = client.models.generate_content(
            model=backup_model,
            contents=prompt
        )

        if response and response.text:

            print(
                "Backup Gemini model response received successfully."
            )

            return response.text.strip()

    except Exception as e:

        print(
            "Backup Gemini model failed:",
            e
        )


    # --------------------------------------------------
    # FINAL FALLBACK
    # --------------------------------------------------

    print(
        "Both Gemini models failed. Returning fallback response."
    )

    return """
FINANCIAL SUMMARY

Your financial information was received successfully, but the AI
advisor is temporarily unavailable. Please try the analysis again
in a moment.

KEY OBSERVATIONS

Your DTI, credit utilization, CIBIL score, loan information and
payment history have been calculated by the application.

5-STEP ACTION PLAN

1. Monitor Credit Utilization

Keep your credit utilization under control because high utilization
can negatively affect your credit profile.

2. Pay EMIs On Time

Make loan and credit payments before their due dates to maintain
a consistent payment history.

3. Reduce Outstanding Debt

Gradually reduce unnecessary outstanding debt to improve overall
financial stability.

4. Avoid Unnecessary Credit Applications

Apply for new credit only when genuinely required.

5. Monitor Your Credit Progress

Regularly review your CIBIL score and financial health metrics.

This information is educational and should not be treated as
guaranteed financial advice.
"""