import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Website Name - Top Left */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: COLORS.primary,
            fontFamily: "'Arial', sans-serif",
          }}
        >
          BoDongGua
        </div>

        {/* Sign In / Sign Up Buttons - Top Right */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to={ROUTES.SIGNIN}>
            <button
              style={{
                padding: "10px 20px",
                fontSize: "15px",
                backgroundColor: "transparent",
                color: COLORS.primary,
                border: `2px solid ${COLORS.primary}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Sign In
            </button>
          </Link>

          <Link to={ROUTES.SIGNUP}>
            <button
              style={{
                padding: "10px 20px",
                fontSize: "15px",
                backgroundColor: COLORS.secondary,
                color: "white",
                border: `2px solid ${COLORS.secondary}`,
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 80px)",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: COLORS.primary,
            marginBottom: "16px",
          }}
        >
          Welcome to BoDongGua 🎃
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: COLORS.muted,
            maxWidth: "560px",
            marginBottom: "36px",
            lineHeight: "1.6",
          }}
        >
          Your AI-powered language learning companion. Practice conversations,
          take mock tests, and improve at your own pace.
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Only show Start Chatting if logged in */}
          {isAuthenticated && (
            <Link to={ROUTES.CHAT}>
              <button
                style={{
                  padding: "14px 32px",
                  fontSize: "17px",
                  fontWeight: "600",
                  backgroundColor: COLORS.success,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                💬 Start Chatting
              </button>
            </Link>
          )}

          {/* Always show Sign Up CTA when not logged in */}
          {!isAuthenticated && (
            <Link to={ROUTES.SIGNUP}>
              <button
                style={{
                  padding: "14px 32px",
                  fontSize: "17px",
                  fontWeight: "600",
                  backgroundColor: COLORS.success,
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                🚀 Get Started — It's Free
              </button>
            </Link>
          )}

          {/* Mock Test Link */}
          <Link to={ROUTES.MOCK_TEST}>
            <button
              style={{
                padding: "14px 32px",
                fontSize: "17px",
                fontWeight: "600",
                backgroundColor: "#9b59b6",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            >
              📝 Try Mock Test
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
