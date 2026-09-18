import { useEffect, useState } from "react";

function Dashboard({ user }) {
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // --------------------------------------------------
    // BACKEND API URL
    // --------------------------------------------------

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://127.0.0.1:8000";

    // --------------------------------------------------
    // GET USER LOANS
    // --------------------------------------------------

    useEffect(() => {
        const fetchLoans = async () => {
            if (!user?.user_id) {
                setError("User information is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    `${API_URL}/loans/${user.user_id}`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.detail || "Unable to load loan details."
                    );
                }

                setLoans(data);
            } catch (error) {
                console.error("Dashboard loan error:", error);

                setError(
                    error.message ||
                    "Unable to load your loan details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchLoans();
    }, [user, API_URL]);

    // --------------------------------------------------
    // CALCULATIONS
    // --------------------------------------------------

    const totalLoanAmount = loans.reduce(
        (total, loan) => total + Number(loan.loan_amount || 0),
        0
    );

    const totalMonthlyEmi = loans.reduce(
        (total, loan) => total + Number(loan.monthly_emi || 0),
        0
    );

    const totalMissedPayments = loans.reduce(
        (total, loan) =>
            total + Number(loan.missed_payments || 0),
        0
    );

    // --------------------------------------------------
    // FORMAT CURRENCY
    // --------------------------------------------------

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* HEADER */}

                <div style={styles.header}>
                    <div>
                        <p style={styles.smallLabel}>
                            FINANCIAL DASHBOARD
                        </p>

                        <h1 style={styles.title}>
                            Welcome, {user?.name || "User"}
                        </h1>

                        <p style={styles.subtitle}>
                            Track your active loans and financial commitments.
                        </p>
                    </div>

                    <div style={styles.aiBadge}>
                        AI Powered
                    </div>
                </div>

                {/* LOADING */}

                {loading && (
                    <div style={styles.messageCard}>
                        <div style={styles.loadingText}>
                            Loading your financial dashboard...
                        </div>
                    </div>
                )}

                {/* ERROR */}

                {error && !loading && (
                    <div style={styles.errorCard}>
                        <strong>
                            Unable to load dashboard
                        </strong>

                        <p style={styles.errorText}>
                            {error}
                        </p>
                    </div>
                )}

                {/* DASHBOARD */}

                {!loading && !error && (
                    <>
                        {/* SUMMARY CARDS */}

                        <div style={styles.summaryGrid}>

                            <div style={styles.summaryCard}>
                                <p style={styles.cardLabel}>
                                    Active Loans
                                </p>

                                <h2 style={styles.cardValue}>
                                    {loans.length}
                                </h2>

                                <p style={styles.cardHint}>
                                    Current loan accounts
                                </p>
                            </div>

                            <div style={styles.summaryCard}>
                                <p style={styles.cardLabel}>
                                    Total Loan Amount
                                </p>

                                <h2 style={styles.cardValue}>
                                    {formatCurrency(totalLoanAmount)}
                                </h2>

                                <p style={styles.cardHint}>
                                    Outstanding loan amounts
                                </p>
                            </div>

                            <div style={styles.summaryCard}>
                                <p style={styles.cardLabel}>
                                    Monthly EMI
                                </p>

                                <h2 style={styles.cardValue}>
                                    {formatCurrency(totalMonthlyEmi)}
                                </h2>

                                <p style={styles.cardHint}>
                                    Combined monthly EMI
                                </p>
                            </div>

                            <div style={styles.summaryCard}>
                                <p style={styles.cardLabel}>
                                    Missed Payments
                                </p>

                                <h2
                                    style={{
                                        ...styles.cardValue,
                                        color:
                                            totalMissedPayments > 0
                                                ? "#d92d20"
                                                : "#16803c",
                                    }}
                                >
                                    {totalMissedPayments}
                                </h2>

                                <p style={styles.cardHint}>
                                    Across all active loans
                                </p>
                            </div>

                        </div>

                        {/* LOANS SECTION */}

                        <div style={styles.loanSection}>

                            <div style={styles.sectionHeader}>
                                <div>
                                    <h2 style={styles.sectionTitle}>
                                        Your Active Loans
                                    </h2>

                                    <p style={styles.sectionSubtitle}>
                                        Saved loan details from your financial profile
                                    </p>
                                </div>

                                <div style={styles.loanCount}>
                                    {loans.length}{" "}
                                    {loans.length === 1
                                        ? "Loan"
                                        : "Loans"}
                                </div>
                            </div>

                            {/* NO LOANS */}

                            {loans.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <h3>
                                        No active loans found
                                    </h3>

                                    <p>
                                        Your saved loan information will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div style={styles.loanList}>

                                    {loans.map((loan) => (
                                        <div
                                            key={loan.id}
                                            style={styles.loanCard}
                                        >

                                            {/* LOAN HEADER */}

                                            <div style={styles.loanHeader}>

                                                <div>
                                                    <h3 style={styles.loanTitle}>
                                                        {loan.loan_type}
                                                    </h3>

                                                    <p style={styles.loanId}>
                                                        Loan ID: {loan.id}
                                                    </p>
                                                </div>

                                                <div style={styles.activeBadge}>
                                                    Active
                                                </div>

                                            </div>

                                            {/* LOAN DETAILS */}

                                            <div style={styles.loanDetails}>

                                                <div style={styles.detailRow}>
                                                    <span style={styles.detailLabel}>
                                                        Loan Amount
                                                    </span>

                                                    <strong style={styles.detailValue}>
                                                        {formatCurrency(
                                                            loan.loan_amount
                                                        )}
                                                    </strong>
                                                </div>

                                                <div style={styles.detailRow}>
                                                    <span style={styles.detailLabel}>
                                                        Monthly EMI
                                                    </span>

                                                    <strong style={styles.detailValue}>
                                                        {formatCurrency(
                                                            loan.monthly_emi
                                                        )}
                                                    </strong>
                                                </div>

                                                <div style={styles.detailRow}>
                                                    <span style={styles.detailLabel}>
                                                        Missed Payments
                                                    </span>

                                                    <strong
                                                        style={{
                                                            ...styles.detailValue,
                                                            color:
                                                                Number(
                                                                    loan.missed_payments
                                                                ) > 0
                                                                    ? "#d92d20"
                                                                    : "#16803c",
                                                        }}
                                                    >
                                                        {loan.missed_payments}
                                                    </strong>
                                                </div>

                                            </div>

                                        </div>
                                    ))}

                                </div>
                            )}

                        </div>

                        {/* INFORMATION CARD */}

                        <div style={styles.infoCard}>

                            <div style={styles.infoIcon}>
                                AI
                            </div>

                            <div>
                                <h3 style={styles.infoTitle}>
                                    Keep your payments consistent
                                </h3>

                                <p style={styles.infoText}>
                                    Regular and timely loan payments can help
                                    maintain a healthy credit profile.
                                </p>
                            </div>

                        </div>

                    </>
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
        maxWidth: "1100px",
        margin: "0 auto",
    },

    header: {
        background: "#172033",
        borderRadius: "20px",
        padding: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "25px",
        color: "#ffffff",
    },

    smallLabel: {
        margin: "0 0 8px",
        fontSize: "12px",
        fontWeight: "700",
        letterSpacing: "1.5px",
        color: "#b8c5dc",
    },

    title: {
        margin: "0",
        fontSize: "32px",
    },

    subtitle: {
        margin: "8px 0 0",
        color: "#c8d0df",
        fontSize: "15px",
    },

    aiBadge: {
        background: "#ffffff",
        color: "#172033",
        padding: "10px 16px",
        borderRadius: "30px",
        fontWeight: "700",
        fontSize: "13px",
        whiteSpace: "nowrap",
    },

    summaryGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginBottom: "25px",
    },

    summaryCard: {
        background: "#ffffff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow:
            "0 6px 20px rgba(0,0,0,0.06)",
    },

    cardLabel: {
        margin: "0",
        color: "#667085",
        fontSize: "14px",
        fontWeight: "600",
    },

    cardValue: {
        margin: "10px 0 5px",
        fontSize: "28px",
        color: "#172033",
    },

    cardHint: {
        margin: "0",
        color: "#98a2b3",
        fontSize: "12px",
    },

    loanSection: {
        background: "#ffffff",
        padding: "30px",
        borderRadius: "20px",
        boxShadow:
            "0 8px 30px rgba(0,0,0,0.07)",
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "25px",
    },

    sectionTitle: {
        margin: "0",
        color: "#172033",
        fontSize: "24px",
    },

    sectionSubtitle: {
        margin: "7px 0 0",
        color: "#667085",
        fontSize: "14px",
    },

    loanCount: {
        background: "#eef2ff",
        color: "#172033",
        padding: "10px 18px",
        borderRadius: "25px",
        fontWeight: "700",
        whiteSpace: "nowrap",
    },

    loanList: {
        display: "grid",
        gap: "20px",
    },

    loanCard: {
        border: "1px solid #dfe4ec",
        borderRadius: "16px",
        padding: "24px",
        background: "#fbfcfe",
    },

    loanHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "15px",
        marginBottom: "20px",
    },

    loanTitle: {
        margin: "0",
        color: "#172033",
        fontSize: "20px",
    },

    loanId: {
        margin: "7px 0 0",
        color: "#98a2b3",
        fontSize: "13px",
    },

    activeBadge: {
        background: "#ecfdf3",
        color: "#16803c",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "700",
    },

    loanDetails: {
        borderTop: "1px solid #eaecf0",
    },

    detailRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        borderBottom: "1px solid #eaecf0",
        gap: "20px",
    },

    detailLabel: {
        color: "#667085",
        fontSize: "14px",
    },

    detailValue: {
        color: "#172033",
        fontSize: "15px",
    },

    infoCard: {
        marginTop: "25px",
        padding: "22px",
        borderRadius: "16px",
        background: "#eef4ff",
        display: "flex",
        alignItems: "center",
        gap: "15px",
    },

    infoIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        background: "#172033",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
    },

    infoTitle: {
        margin: "0 0 5px",
        color: "#172033",
        fontSize: "16px",
    },

    infoText: {
        margin: "0",
        color: "#667085",
        fontSize: "13px",
        lineHeight: "1.5",
    },

    messageCard: {
        background: "#ffffff",
        padding: "40px",
        borderRadius: "18px",
        textAlign: "center",
    },

    loadingText: {
        color: "#667085",
        fontSize: "15px",
    },

    errorCard: {
        background: "#fff1f0",
        border: "1px solid #fecdca",
        padding: "20px",
        borderRadius: "15px",
        color: "#b42318",
    },

    errorText: {
        margin: "7px 0 0",
    },

    emptyState: {
        textAlign: "center",
        padding: "50px 20px",
        border: "1px dashed #d0d5dd",
        borderRadius: "15px",
        color: "#667085",
    },
};

export default Dashboard;