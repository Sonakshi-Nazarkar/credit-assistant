import { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function FinancialForm() {
  const [formData, setFormData] = useState({
    monthlyIncome: "",
    monthlyDebt: "",
    totalCreditLimit: "",
    currentCreditUsed: "",
    cibilScore: "",
    creditHistory: "",
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Backend API URL
  // Local development -> http://127.0.0.1:8000
  // Production -> VITE_API_URL environment variable
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  // --------------------------------------------------
  // FRONTEND VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const income = Number(formData.monthlyIncome);
    const debt = Number(formData.monthlyDebt);
    const creditLimit = Number(formData.totalCreditLimit);
    const creditUsed = Number(formData.currentCreditUsed);
    const cibil = Number(formData.cibilScore);

    if (!formData.monthlyIncome || income <= 0) {
      return "Monthly income must be greater than zero.";
    }

    if (formData.monthlyDebt === "" || debt < 0) {
      return "Monthly debt cannot be negative.";
    }

    if (!formData.totalCreditLimit || creditLimit <= 0) {
      return "Total credit limit must be greater than zero.";
    }

    if (formData.currentCreditUsed === "" || creditUsed < 0) {
      return "Current credit used cannot be negative.";
    }

    if (creditUsed > creditLimit) {
      return "Current credit used cannot exceed your total credit limit.";
    }

    if (!formData.cibilScore || cibil < 300 || cibil > 900) {
      return "CIBIL score must be between 300 and 900.";
    }

    if (!formData.creditHistory.trim()) {
      return "Please enter your credit score history.";
    }

    const historyArray = formData.creditHistory
      .split(",")
      .map((score) => score.trim());

    if (historyArray.some((score) => score === "")) {
      return "Please enter valid scores separated by commas.";
    }

    const numericHistory = historyArray.map((score) => Number(score));

    if (numericHistory.some((score) => isNaN(score))) {
      return "Credit score history must contain only numbers.";
    }

    if (
      numericHistory.some(
        (score) => score < 300 || score > 900
      )
    ) {
      return "Every historical CIBIL score must be between 300 and 900.";
    }

    return null;
  };

  // --------------------------------------------------
  // FORM SUBMIT
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setAnalysisResult(null);

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const historyArray = formData.creditHistory
        .split(",")
        .map((score) => Number(score.trim()));

      const requestData = {
        monthly_income: Number(formData.monthlyIncome),
        monthly_debt: Number(formData.monthlyDebt),
        credit_limit: Number(formData.totalCreditLimit),
        credit_used: Number(formData.currentCreditUsed),
        current_cibil_score: Number(formData.cibilScore),
        credit_score_history: historyArray,
      };

      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to analyze financial data."
        );
      }

      setAnalysisResult(data);
      setError("");
    } catch (error) {
      console.error("Analysis error:", error);

      if (
        error.name === "TypeError" &&
        error.message.includes("fetch")
      ) {
        setError(
          "Unable to connect to the server. Please make sure the FastAPI backend is running."
        );
      } else {
        setError(
          error.message ||
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CHART DATA
  // --------------------------------------------------

  const chartData =
    analysisResult?.metrics_summary?.score_trend?.map(
      (score, index) => ({
        period: `Period ${index + 1}`,
        score: score,
      })
    ) || [];

  // --------------------------------------------------
  // AI RESPONSE FORMATTER
  // --------------------------------------------------

  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) => {
      if (
        part.startsWith("**") &&
        part.endsWith("**")
      ) {
        return (
          <strong key={index}>
            {part.slice(2, -2)}
          </strong>
        );
      }

      return part;
    });
  };

  const renderAIExplanation = (text) => {
    if (!text) {
      return null;
    }

    const lines = text.split("\n");

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Remove empty lines
      if (!trimmedLine) {
        return (
          <div
            key={index}
            style={{ height: "8px" }}
          />
        );
      }

      // Remove horizontal separators
      if (/^-{3,}$/.test(trimmedLine)) {
        return null;
      }

      // Remove Gemini's duplicate disclaimer
      if (
        trimmedLine
          .toLowerCase()
          .includes("disclaimer")
      ) {
        return null;
      }

      // Markdown headings: ### Heading
      if (trimmedLine.startsWith("###")) {
        const heading = trimmedLine
          .replace(/^###\s*/, "")
          .replace(/\*\*/g, "");

        return (
          <h3
            key={index}
            style={styles.aiHeading}
          >
            {heading}
          </h3>
        );
      }

      // Markdown headings: ## Heading
      if (trimmedLine.startsWith("##")) {
        const heading = trimmedLine
          .replace(/^##\s*/, "")
          .replace(/\*\*/g, "");

        return (
          <h3
            key={index}
            style={styles.aiHeading}
          >
            {heading}
          </h3>
        );
      }

      // Numbered headings: 1. Something
      if (/^\d+\.\s/.test(trimmedLine)) {
        return (
          <h3
            key={index}
            style={styles.aiHeading}
          >
            {formatBoldText(trimmedLine)}
          </h3>
        );
      }

      // Bullet points
      if (
        trimmedLine.startsWith("- ") ||
        trimmedLine.startsWith("* ")
      ) {
        return (
          <div
            key={index}
            style={styles.aiBullet}
          >
            <span style={styles.bulletDot}>
              •
            </span>

            <span>
              {formatBoldText(
                trimmedLine.substring(2)
              )}
            </span>
          </div>
        );
      }

      // Normal paragraph
      return (
        <p
          key={index}
          style={styles.aiParagraph}
        >
          {formatBoldText(trimmedLine)}
        </p>
      );
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>
            Credit Assistant
          </h1>

          <p style={styles.subtitle}>
            AI-Powered Financial Health Advisor
          </p>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          style={styles.card}
        >
          <h2 style={styles.sectionTitle}>
            Enter Your Financial Information
          </h2>

          <div style={styles.grid}>

            {/* Monthly Income */}
            <div style={styles.field}>
              <label style={styles.label}>
                Monthly Income
              </label>

              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleChange}
                placeholder="e.g. 75000"
                min="1"
                required
                disabled={loading}
              />
            </div>

            {/* Monthly Debt */}
            <div style={styles.field}>
              <label style={styles.label}>
                Monthly Debt / EMI
              </label>

              <input
                type="number"
                name="monthlyDebt"
                value={formData.monthlyDebt}
                onChange={handleChange}
                placeholder="e.g. 15000"
                min="0"
                required
                disabled={loading}
              />
            </div>

            {/* Credit Limit */}
            <div style={styles.field}>
              <label style={styles.label}>
                Total Credit Limit
              </label>

              <input
                type="number"
                name="totalCreditLimit"
                value={formData.totalCreditLimit}
                onChange={handleChange}
                placeholder="e.g. 200000"
                min="1"
                required
                disabled={loading}
              />
            </div>

            {/* Credit Used */}
            <div style={styles.field}>
              <label style={styles.label}>
                Current Credit Used
              </label>

              <input
                type="number"
                name="currentCreditUsed"
                value={formData.currentCreditUsed}
                onChange={handleChange}
                placeholder="e.g. 45000"
                min="0"
                required
                disabled={loading}
              />
            </div>

            {/* CIBIL Score */}
            <div style={styles.field}>
              <label style={styles.label}>
                Current CIBIL Score
              </label>

              <input
                type="number"
                name="cibilScore"
                value={formData.cibilScore}
                onChange={handleChange}
                placeholder="e.g. 750"
                min="300"
                max="900"
                required
                disabled={loading}
              />
            </div>

            {/* Credit History */}
            <div style={styles.field}>
              <label style={styles.label}>
                Credit Score History
              </label>

              <input
                type="text"
                name="creditHistory"
                value={formData.creditHistory}
                onChange={handleChange}
                placeholder="e.g. 680, 710, 730, 750"
                required
                disabled={loading}
              />

              <small style={styles.helpText}>
                Enter scores separated by commas
              </small>
            </div>

          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div style={styles.errorBox}>
              <strong>
                Unable to analyze:
              </strong>

              <div style={styles.errorText}>
                {error}
              </div>
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
            disabled={loading}
          >
            {loading
              ? "Analyzing Your Financial Health..."
              : "Analyze My Financial Health"}
          </button>
        </form>

        {/* RESULTS */}
        {analysisResult && (
          <div style={styles.results}>

            {/* FINANCIAL HEALTH */}
            <div style={styles.healthCard}>
              <p style={styles.resultLabel}>
                Overall Financial Health
              </p>

              <h2 style={styles.healthValue}>
                {analysisResult.financial_health}
              </h2>

              <p style={styles.healthDescription}>
                Based on your DTI ratio, credit utilization
                and CIBIL score.
              </p>
            </div>

            {/* METRICS */}
            <div style={styles.metricsGrid}>

              <div style={styles.metricCard}>
                <p style={styles.resultLabel}>
                  DTI Ratio
                </p>

                <h3 style={styles.metricValue}>
                  {analysisResult.dti_ratio}%
                </h3>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.resultLabel}>
                  Credit Utilization
                </p>

                <h3 style={styles.metricValue}>
                  {analysisResult.credit_utilization}%
                </h3>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.resultLabel}>
                  CIBIL Score
                </p>

                <h3 style={styles.metricValue}>
                  {analysisResult.current_cibil_score}
                </h3>
              </div>

            </div>

            {/* CIBIL CHART */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>
                CIBIL Score Trend
              </h2>

              <p style={styles.chartSubtitle}>
                Your credit score history over time
              </p>

              <div style={styles.chartContainer}>
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="period"
                    />

                    <YAxis
                      domain={[300, 900]}
                    />

                    <Tooltip />

                    <Line
                      type="monotone"
                      dataKey="score"
                      strokeWidth={3}
                      dot={{
                        r: 5,
                      }}
                      activeDot={{
                        r: 7,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI INSIGHTS */}
            <div style={styles.aiCard}>

              <div style={styles.aiHeader}>
                <span style={styles.aiIcon}>
                  AI
                </span>

                <div>
                  <h2 style={styles.aiTitle}>
                    AI Financial Insights
                  </h2>

                  <p style={styles.aiSubtitle}>
                    Personalized explanation powered by Gemini
                  </p>
                </div>
              </div>

              <div style={styles.aiContent}>
                {renderAIExplanation(
                  analysisResult.ai_explanation
                )}
              </div>

            </div>

            {/* DISCLAIMER */}
            <div style={styles.disclaimer}>
              <strong>
                Disclaimer:
              </strong>{" "}

              This tool provides educational financial
              guidance for informational purposes only.
              It does not guarantee any specific CIBIL
              score increase or financial outcome.
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// --------------------------------------------------
// STYLES
// --------------------------------------------------

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "30px",
  },

  title: {
    fontSize: "38px",
    margin: "0",
    color: "#172033",
  },

  subtitle: {
    fontSize: "17px",
    color: "#667085",
    marginTop: "8px",
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  sectionTitle: {
    marginTop: "0",
    marginBottom: "25px",
    color: "#172033",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    color: "#172033",
    fontSize: "14px",
    fontWeight: "600",
  },

  helpText: {
    color: "#667085",
    fontSize: "12px",
  },

  button: {
    width: "100%",
    marginTop: "28px",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: "#172033",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
  },

  errorBox: {
    marginTop: "20px",
    padding: "16px",
    borderRadius: "10px",
    background: "#fff1f0",
    color: "#b42318",
    border: "1px solid #fecdca",
  },

  errorText: {
    marginTop: "6px",
  },

  results: {
    marginTop: "30px",
  },

  healthCard: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    textAlign: "center",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  resultLabel: {
    margin: "0",
    color: "#667085",
    fontSize: "14px",
    fontWeight: "600",
  },

  healthValue: {
    fontSize: "34px",
    margin: "10px 0",
    color: "#16803c",
  },

  healthDescription: {
    color: "#667085",
    margin: "0",
  },

  metricsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "20px",
  },

  metricCard: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
  },

  metricValue: {
    fontSize: "28px",
    margin: "10px 0 0",
    color: "#172033",
  },

  chartCard: {
    background: "#ffffff",
    marginTop: "20px",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  chartTitle: {
    margin: "0",
    color: "#172033",
  },

  chartSubtitle: {
    marginTop: "6px",
    color: "#667085",
    fontSize: "14px",
  },

  chartContainer: {
    width: "100%",
    height: "350px",
    marginTop: "20px",
  },

  aiCard: {
    background: "#ffffff",
    marginTop: "20px",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },

  aiHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  aiIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "12px",
    background: "#172033",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },

  aiTitle: {
    margin: "0",
    color: "#172033",
  },

  aiSubtitle: {
    margin: "5px 0 0",
    color: "#667085",
    fontSize: "14px",
  },

  aiContent: {
    lineHeight: "1.7",
    color: "#344054",
  },

  aiHeading: {
    margin: "22px 0 8px",
    color: "#172033",
    fontSize: "18px",
    fontWeight: "700",
  },

  aiParagraph: {
    margin: "8px 0",
    whiteSpace: "pre-wrap",
  },

  aiBullet: {
    display: "flex",
    gap: "10px",
    margin: "8px 0",
    paddingLeft: "5px",
  },

  bulletDot: {
    fontWeight: "bold",
    color: "#172033",
  },

  disclaimer: {
    marginTop: "20px",
    padding: "18px",
    borderRadius: "12px",
    background: "#fff8e7",
    color: "#7a5b00",
    fontSize: "13px",
    lineHeight: "1.6",
  },
};

export default FinancialForm;