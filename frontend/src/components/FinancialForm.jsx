import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function FinancialForm({ userId, user, onBackToHome }) {
  // --------------------------------------------------
  // FORM DATA
  // --------------------------------------------------

  const [formData, setFormData] = useState({
    monthlyIncome: "",
    monthlyDebt: "",
    totalCreditLimit: "",
    currentCreditUsed: "",
    cibilScore: "",
    creditHistory: "",
    loanType: "",
    loanAmount: "",
    monthlyEmi: "",
    missedPayments: "0",
  });

  // --------------------------------------------------
  // RESULT / UI STATES
  // --------------------------------------------------

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // --------------------------------------------------
  // API URL
  // --------------------------------------------------

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  // --------------------------------------------------
  // HANDLE INPUT
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // --------------------------------------------------
  // FORMAT AI MARKDOWN
  // --------------------------------------------------

  const formatBoldText = (text) => {
    const parts = text.split("**");

    return parts.map((part, index) =>
      index % 2 === 1 ? (
        <strong key={index}>{part}</strong>
      ) : (
        part
      )
    );
  };

  // --------------------------------------------------
  // AI INSIGHTS COMPONENT
  // --------------------------------------------------

  const AIInsights = ({ text }) => {
    if (!text) return null;

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const sections = [];
    let currentSection = null;

    lines.forEach((line) => {
      const cleanLine = line
        .replace(/\*\*/g, "")
        .trim();

      const isHeading =
        cleanLine === "FINANCIAL SUMMARY" ||
        cleanLine === "KEY OBSERVATIONS" ||
        cleanLine === "5-STEP ACTION PLAN";

      if (isHeading) {
        currentSection = {
          title: cleanLine,
          content: [],
        };

        sections.push(currentSection);
        return;
      }

      if (
        cleanLine.toLowerCase().includes("this information is educational") ||
        cleanLine.toLowerCase().includes("should not be treated as guaranteed")
      ) {
        return;
      }

      if (currentSection) {
        currentSection.content.push(line);
      }
    });

    return (
      <div
        style={{
          marginTop: "25px",
          padding: "25px",
          borderRadius: "14px",
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#172033",
          }}
        >
          AI Financial Insights
        </h2>

        {sections.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            style={{
              marginBottom:
                sectionIndex === sections.length - 1
                  ? 0
                  : "25px",
            }}
          >
            <h3
              style={{
                color: "#172033",
                marginBottom: "12px",
                fontSize: "18px",
              }}
            >
              {section.title}
            </h3>

            <div
              style={{
                color: "#475467",
                lineHeight: "1.7",
                fontSize: "15px",
              }}
            >
              {section.content.map((line, index) => {
                const numbered = line.match(
                  /^(\d+)[.)]\s*(.*)$/
                );

                const bullet = line.match(
                  /^[-•]\s*(.*)$/
                );

                if (numbered) {
                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "12px",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        borderLeft:
                          "4px solid #2a9d8f",
                      }}
                    >
                      <strong>
                        {numbered[1]}.{" "}
                      </strong>

                      {formatBoldText(numbered[2])}
                    </div>
                  );
                }

                if (bullet) {
                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "8px",
                        paddingLeft: "8px",
                      }}
                    >
                      • {formatBoldText(bullet[1])}
                    </div>
                  );
                }

                return (
                  <p
                    key={index}
                    style={{
                      margin: "0 0 10px 0",
                    }}
                  >
                    {formatBoldText(line)}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --------------------------------------------------
  // VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const income = Number(formData.monthlyIncome);
    const debt = Number(formData.monthlyDebt);
    const creditLimit = Number(
      formData.totalCreditLimit
    );
    const creditUsed = Number(
      formData.currentCreditUsed
    );
    const cibil = Number(formData.cibilScore);
    const loanAmount = Number(formData.loanAmount);
    const emi = Number(formData.monthlyEmi);
    const missedPayments = Number(
      formData.missedPayments
    );

    if (!income || income <= 0) {
      return "Please enter a valid monthly income.";
    }

    if (debt < 0) {
      return "Monthly debt cannot be negative.";
    }

    if (!creditLimit || creditLimit <= 0) {
      return "Please enter a valid credit limit.";
    }

    if (
      creditUsed < 0 ||
      creditUsed > creditLimit
    ) {
      return "Credit used must be between 0 and your credit limit.";
    }

    if (
      !cibil ||
      cibil < 300 ||
      cibil > 900
    ) {
      return "CIBIL score must be between 300 and 900.";
    }

    if (!formData.creditHistory.trim()) {
      return "Please enter your CIBIL score history.";
    }

    const historyArray =
      formData.creditHistory
        .split(",")
        .map((value) => Number(value.trim()));

    if (
      historyArray.some(
        (value) =>
          !Number.isInteger(value) ||
          value < 300 ||
          value > 900
      )
    ) {
      return "CIBIL history must contain valid scores between 300 and 900.";
    }

    if (!formData.loanType.trim()) {
      return "Please enter your loan type.";
    }

    if (!loanAmount || loanAmount <= 0) {
      return "Please enter a valid loan amount.";
    }

    if (!emi || emi <= 0) {
      return "Please enter a valid monthly EMI.";
    }

    if (
      missedPayments < 0 ||
      !Number.isInteger(missedPayments)
    ) {
      return "Missed payments must be a valid whole number.";
    }

    return null;
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    // --------------------------------------------------
    // GET USER ID
    // --------------------------------------------------

    const currentUserId =
      userId ??
      user?.user_id ??
      user?.userId ??
      user?.id ??
      null;

    if (!currentUserId) {
      setError(
        "Please login before submitting your financial information."
      );
      return;
    }

    // --------------------------------------------------
    // VALIDATE
    // --------------------------------------------------

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    // --------------------------------------------------
    // PREPARE DATA
    // --------------------------------------------------

    const historyArray =
      formData.creditHistory
        .split(",")
        .map((value) => Number(value.trim()));

    const requestData = {
      user_id: Number(currentUserId),
      monthly_income: Number(
        formData.monthlyIncome
      ),
      monthly_debt: Number(
        formData.monthlyDebt
      ),
      credit_limit: Number(
        formData.totalCreditLimit
      ),
      credit_used: Number(
        formData.currentCreditUsed
      ),
      current_cibil_score: Number(
        formData.cibilScore
      ),
      credit_score_history: historyArray,
    };

    const loanData = {
      loan_type: formData.loanType.trim(),
      loan_amount: Number(
        formData.loanAmount
      ),
      monthly_emi: Number(
        formData.monthlyEmi
      ),
      missed_payments: Number(
        formData.missedPayments
      ),
    };

    // --------------------------------------------------
    // SUBMIT
    // --------------------------------------------------

    try {
      setLoading(true);

      // ------------------------------------------------
      // SAVE FINANCIAL PROFILE
      // ------------------------------------------------

      const profileResponse = await fetch(
        `${API_URL}/profile/${currentUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!profileResponse.ok) {
        let profileError =
          "Failed to save financial profile.";

        try {
          const errorData =
            await profileResponse.json();

          if (errorData?.detail) {
            if (Array.isArray(errorData.detail)) {
              profileError =
                errorData.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid financial information."
                  )
                  .join(", ");
            } else {
              profileError =
                errorData.detail;
            }
          }
        } catch {
          // Keep default error message
        }

        throw new Error(profileError);
      }

      // ------------------------------------------------
      // SAVE LOAN
      // ------------------------------------------------

      const loanResponse = await fetch(
        `${API_URL}/loans/${currentUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loanData),
        }
      );

      if (!loanResponse.ok) {
        let loanError =
          "Failed to save loan details.";

        try {
          const errorData =
            await loanResponse.json();

          if (errorData?.detail) {
            loanError =
              Array.isArray(errorData.detail)
                ? errorData.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid loan information."
                  )
                  .join(", ")
                : errorData.detail;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(loanError);
      }

      // ------------------------------------------------
      // ANALYZE FINANCIAL HEALTH
      // ------------------------------------------------

      const analyzeResponse = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!analyzeResponse.ok) {
        let analyzeError =
          "Failed to analyze financial health.";

        try {
          const errorData =
            await analyzeResponse.json();

          if (errorData?.detail) {
            analyzeError =
              Array.isArray(errorData.detail)
                ? errorData.detail
                  .map(
                    (item) =>
                      item.msg ||
                      "Invalid analysis data."
                  )
                  .join(", ")
                : errorData.detail;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(analyzeError);
      }

      const analysisData =
        await analyzeResponse.json();

      setResult(analysisData);

    } catch (submitError) {
      console.error(
        "Financial form error:",
        submitError
      );

      setError(
        submitError.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // RESULT DATA
  // --------------------------------------------------

  const historyValues =
    result?.credit_score_history || [];

  const cibilTrendData = historyValues.map(
    (score, index) => ({
      month: `Month ${index + 1}`,
      score,
    })
  );

  // --------------------------------------------------
  // IMPROVEMENT DELTA
  // --------------------------------------------------

  const cibilDelta =
    historyValues.length >= 2
      ? historyValues[
      historyValues.length - 1
      ] - historyValues[0]
      : 0;

  // --------------------------------------------------
  // PIE CHART
  // --------------------------------------------------

  const creditLimit = Number(
    formData.totalCreditLimit || 0
  );

  const creditUsed = Number(
    formData.currentCreditUsed || 0
  );

  const availableCredit = Math.max(
    creditLimit - creditUsed,
    0
  );

  const utilizationPieData = [
    {
      name: "Credit Used",
      value: creditUsed,
    },
    {
      name: "Available Credit",
      value: availableCredit,
    },
  ];

  // --------------------------------------------------
  // HEALTH COLOR
  // --------------------------------------------------

  const getHealthColor = (health) => {
    if (health === "Good") {
      return "#2a9d8f";
    }

    if (health === "Moderate") {
      return "#f4a261";
    }

    return "#e76f51";
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px 20px 60px",
      }}
    >

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",

            // FIXED: white heading on dark background
            color: "#ffffff",

            fontSize: "32px",
          }}
        >
          Financial Health Analysis
        </h1>

        <p
          style={{
            color: "#667085",
            margin: 0,
          }}
        >
          Enter your financial information to
          receive personalized AI-powered insights.
        </p>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 16px",
            borderRadius: "10px",
            background: "#fff1f0",
            border: "1px solid #ffccc7",
            color: "#c62828",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================
          FORM
      ================================================== */}

      <form onSubmit={handleSubmit}>

        {/* ==================================================
            INCOME & DEBT
        ================================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "25px",
            marginBottom: "20px",
            border: "1px solid #eaecf0",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#172033",
              fontSize: "20px",
            }}
          >
            Income & Debt
          </h2>

          <div
            className="financial-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label>
                Monthly Income
              </label>

              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="e.g. 50000"
                min="0"
              />
            </div>

            <div>
              <label>
                Monthly Debt
              </label>

              <input
                type="number"
                name="monthlyDebt"
                value={formData.monthlyDebt}
                onChange={handleChange}
                placeholder="e.g. 15000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            CREDIT PROFILE
        ================================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "25px",
            marginBottom: "20px",
            border: "1px solid #eaecf0",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#172033",
              fontSize: "20px",
            }}
          >
            Credit Profile
          </h2>

          <div
            className="financial-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label>
                Total Credit Limit
              </label>

              <input
                type="number"
                name="totalCreditLimit"
                value={
                  formData.totalCreditLimit
                }
                onChange={handleChange}
                placeholder="e.g. 100000"
                min="0"
              />
            </div>

            <div>
              <label>
                Current Credit Used
              </label>

              <input
                type="number"
                name="currentCreditUsed"
                value={
                  formData.currentCreditUsed
                }
                onChange={handleChange}
                placeholder="e.g. 30000"
                min="0"
              />
            </div>

            <div>
              <label>
                Current CIBIL Score
              </label>

              <input
                type="number"
                name="cibilScore"
                value={formData.cibilScore}
                onChange={handleChange}
                placeholder="300 - 900"
                min="300"
                max="900"
              />
            </div>

            <div>
              <label>
                CIBIL Score History
              </label>

              <input
                type="text"
                name="creditHistory"
                value={formData.creditHistory}
                onChange={handleChange}
                placeholder="e.g. 680, 690, 705, 720"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            LOAN DETAILS
        ================================================== */}

        <div
          style={{
            background: "#ffffff",
            borderRadius: "14px",
            padding: "25px",
            marginBottom: "20px",
            border: "1px solid #eaecf0",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.04)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#172033",
              fontSize: "20px",
            }}
          >
            Loan Details
          </h2>

          <div
            className="financial-form-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "18px",
            }}
          >
            <div>
              <label>
                Loan Type
              </label>

              <input
                type="text"
                name="loanType"
                value={formData.loanType}
                onChange={handleChange}
                placeholder="e.g. Personal Loan"
              />
            </div>

            <div>
              <label>
                Loan Amount
              </label>

              <input
                type="number"
                name="loanAmount"
                value={formData.loanAmount}
                onChange={handleChange}
                placeholder="e.g. 200000"
                min="0"
              />
            </div>

            <div>
              <label>
                Monthly EMI
              </label>

              <input
                type="number"
                name="monthlyEmi"
                value={formData.monthlyEmi}
                onChange={handleChange}
                placeholder="e.g. 8000"
                min="0"
              />
            </div>

            <div>
              <label>
                Missed Payments
              </label>

              <input
                type="number"
                name="missedPayments"
                value={
                  formData.missedPayments
                }
                onChange={handleChange}
                placeholder="e.g. 0"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze My Financial Health"}
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onBackToHome}
            disabled={loading}
          >
            Back to Home
          </button>
        </div>
      </form>

      {/* ==================================================
          RESULTS
      ================================================== */}

      {result && (
        <div>

          {/* ==================================================
              HEALTH SUMMARY
          ================================================== */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "25px",
              marginBottom: "20px",
              border: "1px solid #eaecf0",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#172033",
              }}
            >
              Financial Health
            </h2>

            <div
              style={{
                fontSize: "30px",
                fontWeight: "800",
                color: getHealthColor(
                  result.financial_health
                ),
                marginBottom: "20px",
              }}
            >
              {result.financial_health}
            </div>

            <div
              className="financial-metrics-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(0, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  Debt-to-Income Ratio
                </div>

                <strong
                  style={{
                    fontSize: "24px",
                    color: "#172033",
                  }}
                >
                  {Number(result.dti).toFixed(2)}%
                </strong>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  Credit Utilization
                </div>

                <strong
                  style={{
                    fontSize: "24px",
                    color: "#172033",
                  }}
                >
                  {Number(
                    result.credit_utilization
                  ).toFixed(2)}
                  %
                </strong>
              </div>

              <div
                style={{
                  padding: "18px",
                  borderRadius: "12px",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    color: "#667085",
                    fontSize: "13px",
                  }}
                >
                  Current CIBIL Score
                </div>

                <strong
                  style={{
                    fontSize: "24px",
                    color: "#172033",
                  }}
                >
                  {result.current_cibil_score}
                </strong>
              </div>
            </div>
          </div>

          {/* ==================================================
              CREDIT UTILIZATION PIE CHART
          ================================================== */}

          <div
            style={{
              background: "#ffffff",
              borderRadius: "14px",
              padding: "25px",
              marginBottom: "20px",
              border: "1px solid #eaecf0",
              boxShadow:
                "0 8px 25px rgba(0,0,0,0.04)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                color: "#172033",
              }}
            >
              Credit Utilization
            </h2>

            <div
              style={{
                width: "100%",
                height: "320px",
              }}
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={utilizationPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    dataKey="value"
                    label
                  >
                    <Cell fill="#e76f51" />
                    <Cell fill="#2a9d8f" />
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ==================================================
              CIBIL TREND
          ================================================== */}

          {historyValues.length > 0 && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "25px",
                marginBottom: "20px",
                border: "1px solid #eaecf0",
                boxShadow:
                  "0 8px 25px rgba(0,0,0,0.04)",
              }}
            >
              <h2
                style={{
                  marginTop: 0,
                  color: "#172033",
                }}
              >
                CIBIL Score Trend
              </h2>

              <div
                style={{
                  width: "100%",
                  height: "320px",
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={cibilTrendData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis dataKey="month" />

                    <YAxis
                      domain={[
                        300,
                        900,
                      ]}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2a9d8f"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ==================================================
              IMPROVEMENT DELTA
          ================================================== */}

          {historyValues.length >= 2 && (
            <div
              style={{
                marginBottom: "20px",
                padding: "20px",
                borderRadius: "12px",
                background: "#f8fafc",
                border: "1px solid #eaecf0",
              }}
            >
              <div
                style={{
                  color: "#667085",
                  fontSize: "14px",
                  marginBottom: "8px",
                }}
              >
                CIBIL Score Improvement
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: "28px",
                    fontWeight: "800",
                    color:
                      cibilDelta > 0
                        ? "#2a9d8f"
                        : cibilDelta < 0
                          ? "#e76f51"
                          : "#667085",
                  }}
                >
                  {cibilDelta > 0
                    ? "+"
                    : ""}
                  {cibilDelta} points
                </span>

                <span
                  style={{
                    color: "#667085",
                    fontSize: "14px",
                  }}
                >
                  {historyValues[0]} →{" "}
                  {
                    historyValues[
                    historyValues.length - 1
                    ]
                  }
                </span>
              </div>

              <p
                style={{
                  marginBottom: 0,
                  marginTop: "10px",
                  color: "#667085",
                  fontSize: "13px",
                }}
              >
                Change based on your entered
                credit score history.
              </p>
            </div>
          )}

          {/* ==================================================
              AI INSIGHTS
          ================================================== */}

          <AIInsights
            text={result.ai_explanation}
          />

          {/* ==================================================
              DISCLAIMER
          ================================================== */}

          <div
            style={{
              marginTop: "20px",
              padding: "15px 18px",
              borderRadius: "10px",
              background: "#fffbeb",
              border: "1px solid #f5d97b",
              color: "#795548",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <strong>Disclaimer:</strong>{" "}
            This analysis is educational and
            based on the information you entered.
            It does not guarantee a specific
            CIBIL score increase or financial
            outcome.
          </div>

        </div>
      )}

      {/* ==================================================
          RESPONSIVE STYLE
      ================================================== */}

      <style>
        {`
          .financial-form-grid label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #344054;
            font-size: 14px;
          }

          .financial-form-grid input {
            width: 100%;
            box-sizing: border-box;
            padding: 12px 14px;
            border-radius: 8px;
            border: 1px solid #d0d5dd;
            font-size: 15px;
            outline: none;
            background: #ffffff;
          }

          .financial-form-grid input:focus {
            border-color: #2a9d8f;
            box-shadow: 0 0 0 3px rgba(42, 157, 143, 0.12);
          }

          @media (max-width: 700px) {
            .financial-form-grid {
              grid-template-columns: 1fr !important;
            }

            .financial-metrics-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default FinancialForm;