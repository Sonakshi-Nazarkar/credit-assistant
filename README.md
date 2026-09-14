# Credit Assistant – AI-Powered Financial Health Advisor

Credit Assistant is an AI-powered financial health analysis web application that helps users understand their basic financial health using income, debt, credit utilization, and CIBIL score data.

The application combines rule-based financial calculations with Google Gemini to provide personalized, easy-to-understand financial insights.

## Features

- Calculate Debt-to-Income (DTI) ratio
- Calculate Credit Utilization ratio
- Analyze CIBIL score
- Track CIBIL score history
- Classify overall financial health
- Generate personalized AI-powered financial insights using Gemini
- Visualize CIBIL score trends using Recharts
- Frontend and backend validation
- Loading and error handling
- Responsible AI disclaimer
- API key protected on the backend

## Screenshots

### Home Page

![Home Page](Screenshot%202026-09-14%20153720.png)

### Financial Information Form

![Financial Form](Screenshot%202026-09-14%20153744.png)

### Financial Health Dashboard

![Dashboard](Screenshot%202026-09-14%20153906.png)

### CIBIL Score Trend

![CIBIL Score Trend](Screenshot%202026-09-14%20154005.png)

### AI Financial Insights

![AI Insights](Screenshot%202026-09-14%20154037.png)

## Financial Health Logic

The application evaluates financial health using three major indicators:

### 1. Debt-to-Income Ratio

DTI measures monthly debt obligations compared with monthly income.

**Formula:**

`DTI = (Monthly Debt / Monthly Income) × 100`

### 2. Credit Utilization

Credit utilization measures how much of the available credit limit is currently being used.

**Formula:**

`Credit Utilization = (Credit Used / Credit Limit) × 100`

### 3. CIBIL Score

The application considers the current CIBIL score along with the user's historical score trend.

## Technology Stack

### Frontend

- React.js
- Vite
- Recharts
- JavaScript
- HTML
- CSS

### Backend

- Python
- FastAPI
- Pydantic
- Google Gemini API

### AI

- Google Gemini Flash
- AI-generated financial explanations and personalized guidance

## Project Architecture

```text
credit-assistant/
│
├── backend/
│   ├── calculator.py
│   ├── gemini_service.py
│   ├── main.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
