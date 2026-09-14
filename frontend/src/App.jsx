import { useState } from 'react'
import FinancialForm from './components/FinancialForm'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('home')

  return (
    <div className="app-container">
      {/* Header / Navbar */}
      <header className="navbar">
        <div className="brand" onClick={() => setCurrentView('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">💳</div>
          <span className="brand-title">Credit Assistant</span>
        </div>
        <span className="ai-badge">AI Powered</span>
      </header>

      {/* Main Content View */}
      <main className="main-content">
        {currentView === 'home' ? (
          <>
            {/* Main Hero Content */}
            <section className="hero-section">
              <div className="hero-subtitle-badge">Smart Financial Wellness</div>
              <h1 className="hero-title">Credit Assistant</h1>
              <h2 className="hero-subtitle">AI-Powered Financial Health Advisor</h2>
              <p className="hero-description">
                Take control of your financial future. Credit Assistant helps you analyze your credit score factors, assess debt utilization, and receive personalized AI insights to build lasting financial health.
              </p>
              <button className="btn-primary" onClick={() => setCurrentView('form')}>
                Check My Financial Health
              </button>
            </section>

            {/* Feature Cards Grid */}
            <section className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📊</div>
                <h3 className="feature-title">Credit Health Score</h3>
                <p className="feature-text">
                  Understand the key factors influencing your credit rating with clear, easy-to-read metrics.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h3 className="feature-title">AI Action Plan</h3>
                <p className="feature-text">
                  Receive automated recommendations tailored to your goals to optimize balances and build credit.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3 className="feature-title">Private & Secure</h3>
                <p className="feature-text">
                  Your financial privacy is paramount. Explore simulations safely without impacting your actual credit file.
                </p>
              </div>
            </section>
          </>
        ) : (
          <FinancialForm onBackToHome={() => setCurrentView('home')} />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Credit Assistant – AI-Powered Financial Health Advisor</p>
      </footer>
    </div>
  )
}

export default App
