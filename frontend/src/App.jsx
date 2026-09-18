import { useState } from "react";

import FinancialForm from "./components/FinancialForm";
import Dashboard from "./components/Dashboard";

import "./App.css";

function App() {
  // --------------------------------------------------
  // CURRENT VIEW
  // --------------------------------------------------
  const [currentView, setCurrentView] = useState("home");

  // --------------------------------------------------
  // USER
  // --------------------------------------------------
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("creditAssistantUser");

    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Invalid saved user data:", error);
      localStorage.removeItem("creditAssistantUser");
      return null;
    }
  });

  // --------------------------------------------------
  // LOGIN STATES
  // --------------------------------------------------
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // --------------------------------------------------
  // BACKEND URL
  // --------------------------------------------------
  const API_BASE_URL = import.meta.env.DEV
    ? "http://127.0.0.1:8000"
    : "https://credit-assistant-backend-w8yo.onrender.com";

  // --------------------------------------------------
  // GET USER ID
  // --------------------------------------------------
  const getUserId = () => {
    return user?.user_id ?? user?.userId ?? user?.id ?? null;
  };

  // --------------------------------------------------
  // OPEN FINANCIAL HEALTH
  // --------------------------------------------------
  const handleFinancialHealthClick = () => {
    const userId = getUserId();

    if (user && userId) {
      setCurrentView("form");
    } else {
      setShowLogin(true);
      setLoginError("");
    }
  };

  // --------------------------------------------------
  // OPEN DASHBOARD
  // --------------------------------------------------
  const handleDashboardClick = () => {
    const userId = getUserId();

    if (user && userId) {
      setCurrentView("dashboard");
    } else {
      setShowLogin(true);
      setLoginError("");
    }
  };

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginError("");

    if (!email.trim() || !password) {
      setLoginError(
        "Please enter both email and password."
      );
      return;
    }

    try {
      setLoginLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Login failed. Please check your credentials."
        );
      }

      // --------------------------------------------------
      // VERIFY USER ID
      // --------------------------------------------------
      const loggedInUserId =
        data?.user_id ??
        data?.userId ??
        data?.id ??
        null;

      if (!loggedInUserId) {
        throw new Error(
          "Login successful, but user ID was not received from the server."
        );
      }

      // --------------------------------------------------
      // SAVE USER
      // --------------------------------------------------
      const userData = {
        ...data,
        user_id: loggedInUserId,
      };

      localStorage.setItem(
        "creditAssistantUser",
        JSON.stringify(userData)
      );

      setUser(userData);

      setEmail("");
      setPassword("");
      setLoginError("");
      setShowLogin(false);

      // --------------------------------------------------
      // OPEN DASHBOARD AFTER LOGIN
      // --------------------------------------------------
      setCurrentView("dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(
        error.message ||
        "Something went wrong during login."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  const handleLogout = () => {
    localStorage.removeItem(
      "creditAssistantUser"
    );

    setUser(null);
    setCurrentView("home");
    setShowLogin(false);

    setEmail("");
    setPassword("");
    setLoginError("");
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------
  return (
    <div className="app-container">

      {/* ==================================================
          NAVBAR
      ================================================== */}

      <header className="navbar">

        {/* BRAND */}

        <div
          className="brand"
          onClick={() => {
            setCurrentView("home");
            setShowLogin(false);
          }}
          style={{
            cursor: "pointer",
          }}
        >
          <div className="brand-icon">
            💳
          </div>

          <span className="brand-title">
            Credit Assistant
          </span>
        </div>

        {/* NAVIGATION */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <span className="ai-badge">
            AI Powered
          </span>

          {user && getUserId() && (
            <>
              {/* DASHBOARD BUTTON */}

              <button
                className="btn-secondary"
                onClick={handleDashboardClick}
              >
                Dashboard
              </button>

              {/* FINANCIAL HEALTH BUTTON */}

              <button
                className="btn-secondary"
                onClick={handleFinancialHealthClick}
              >
                Financial Health
              </button>

              {/* USER NAME */}

              <span
                style={{
                  fontWeight: "700",
                  color: "#ffffff",
                  fontSize: "15px",
                  whiteSpace: "nowrap",
                }}
              >
                Hi, {user.name}
              </span>

              {/* LOGOUT */}

              <button
                className="btn-secondary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="main-content">

        {/* ==================================================
            LOGIN PAGE
        ================================================== */}

        {showLogin ? (
          <section
            className="hero-section"
            style={{
              maxWidth: "500px",
              margin: "40px auto",
            }}
          >
            <div className="hero-subtitle-badge">
              Secure Login
            </div>

            <h1 className="hero-title">
              Welcome Back
            </h1>

            <h2 className="hero-subtitle">
              Login to Credit Assistant
            </h2>

            <p className="hero-description">
              Access your financial health dashboard
              and personalized insights.
            </p>

            {/* LOGIN FORM */}

            <form
              onSubmit={handleLogin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                marginTop: "30px",
              }}
            >

              {/* EMAIL */}

              <div
                style={{
                  textAlign: "left",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* PASSWORD */}

              <div
                style={{
                  textAlign: "left",
                }}
              >
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "600",
                  }}
                >
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* ERROR */}

              {loginError && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: "#ffe5e5",
                    color: "#c62828",
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                >
                  {loginError}
                </div>
              )}

              {/* LOGIN */}

              <button
                type="submit"
                className="btn-primary"
                disabled={loginLoading}
              >
                {loginLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

              {/* BACK */}

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowLogin(false);
                  setLoginError("");
                }}
              >
                Back to Home
              </button>
            </form>
          </section>
        ) : currentView === "home" ? (

          /* ==================================================
             HOME PAGE
          ================================================== */

          <>
            <section className="hero-section">

              <div className="hero-subtitle-badge">
                Smart Financial Wellness
              </div>

              <h1 className="hero-title">
                Credit Assistant
              </h1>

              <h2 className="hero-subtitle">
                AI-Powered Financial Health Advisor
              </h2>

              <p className="hero-description">
                Take control of your financial future.
                Credit Assistant helps you analyze your
                credit score factors, assess debt utilization,
                and receive personalized AI insights to build
                lasting financial health.
              </p>

              <button
                className="btn-primary"
                onClick={handleFinancialHealthClick}
              >
                Check My Financial Health
              </button>
            </section>

            {/* FEATURE CARDS */}

            <section className="features-grid">

              <div className="feature-card">

                <div className="feature-icon">
                  📊
                </div>

                <h3 className="feature-title">
                  Credit Health Score
                </h3>

                <p className="feature-text">
                  Understand the key factors influencing
                  your credit rating with clear,
                  easy-to-read metrics.
                </p>

              </div>

              <div className="feature-card">

                <div className="feature-icon">
                  🤖
                </div>

                <h3 className="feature-title">
                  AI Action Plan
                </h3>

                <p className="feature-text">
                  Receive automated recommendations
                  tailored to your goals to optimize
                  balances and build credit.
                </p>

              </div>

              <div className="feature-card">

                <div className="feature-icon">
                  🛡️
                </div>

                <h3 className="feature-title">
                  Private & Secure
                </h3>

                <p className="feature-text">
                  Your financial privacy is paramount.
                  Explore simulations safely without
                  impacting your actual credit file.
                </p>

              </div>

            </section>
          </>

        ) : currentView === "dashboard" ? (

          /* ==================================================
             DASHBOARD
          ================================================== */

          <Dashboard
            user={user}
          />

        ) : (

          /* ==================================================
             FINANCIAL FORM
          ================================================== */

          <FinancialForm
            userId={getUserId()}
            user={user}
            onBackToHome={() =>
              setCurrentView("home")
            }
          />

        )}

      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">
        <p>
          &copy; {new Date().getFullYear()}{" "}
          Credit Assistant – AI-Powered Financial
          Health Advisor
        </p>
      </footer>

    </div>
  );
}

export default App;