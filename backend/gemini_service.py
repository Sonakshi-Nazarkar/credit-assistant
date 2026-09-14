import os

from dotenv import load_dotenv
from google import genai


# Load environment variables from .env
load_dotenv()

# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the .env file")


# Create Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)


def generate_financial_explanation(
    dti_ratio: float,
    credit_utilization: float,
    cibil_score: int,
    financial_health: str
) -> str:
    """
    Generate a personalized financial explanation using Gemini.
    """

    prompt = f"""
You are a responsible financial education assistant.

Analyze the following user's financial health metrics:

DTI Ratio: {dti_ratio}%
Credit Utilization: {credit_utilization}%
CIBIL Score: {cibil_score}
Overall Financial Health: {financial_health}

Provide a concise and easy-to-understand explanation.

Include:
1. What the current financial health means.
2. What is going well.
3. What could be improved.
4. 2 or 3 practical financial habits the user can follow.

Important rules:
- Give educational guidance only.
- Do not guarantee any specific CIBIL score increase.
- Do not claim to be a financial advisor.
- Do not invent missing financial information.
- Keep the response clear and beginner-friendly.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt
    )

    return response.text