import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";
import Header from "./Header";

const LIGHT_BLUE = "#a8d4f0";
const SECTION_STYLE: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "48px 24px",
  textAlign: "center",
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />

      {/* Hero */}
      <section
        style={{
          ...SECTION_STYLE,
          paddingTop: "56px",
          paddingBottom: "64px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 44px)",
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          Putonghua practice that actually helps
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: COLORS.muted,
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.6,
          }}
        >
          The Putonghua Proficiency Test (PSC) is tough for Cantonese speakers—Grade 2B pass rates sit around 45%. 
          BoDongGua gives you AI-driven mock tests, tailored practice for your weak spots, and a learning companion so you can improve systematically.
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to={ROUTES.MOCK_TEST}>
            <button
              style={{
                padding: "14px 28px",
                fontSize: "16px",
                fontWeight: 600,
                backgroundColor: COLORS.secondary,
                color: "white",
                border: "none",
                borderRadius: "9999px",
                cursor: "pointer",
              }}
            >
              Start a Test
            </button>
          </Link>
          {!isAuthenticated && (
            <Link to={ROUTES.SIGNUP}>
              <button
                style={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  fontWeight: 600,
                  backgroundColor: "white",
                  color: COLORS.secondary,
                  border: `2px solid ${COLORS.secondary}`,
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Get Started — It's Free
              </button>
            </Link>
          )}
          {isAuthenticated && (
            <Link to={ROUTES.CHAT}>
              <button
                style={{
                  padding: "14px 28px",
                  fontSize: "16px",
                  fontWeight: 600,
                  backgroundColor: "white",
                  color: COLORS.secondary,
                  border: `2px solid ${COLORS.secondary}`,
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Chat with Companion
              </button>
            </Link>
          )}
        </div>
      </section>

      {/* Key features from PSC doc */}
      <section
        style={{
          backgroundColor: "white",
          padding: "56px 24px",
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: COLORS.primary,
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          How BoDongGua helps
        </h2>
        <p style={{ textAlign: "center", color: COLORS.muted, maxWidth: 560, margin: "0 auto 40px" }}>
          Built for PSC-style practice with real-time feedback and progress you can track.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "24px",
            maxWidth: 900,
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: COLORS.light,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: LIGHT_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🎭</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: COLORS.primary, marginBottom: "8px" }}>
              Interactive learning companions
            </h3>
            <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.5, margin: 0 }}>
              Choose a character that fits your style. Your companion stays with you during practice, gives feedback after each session, and tracks your progress over time.
            </p>
            <Link to={ROUTES.CHOOSE_CHARACTER} style={{ display: "inline-block", marginTop: "12px", fontSize: "14px", fontWeight: 600, color: COLORS.secondary }}>
              Choose your character →
            </Link>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: COLORS.light,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: LIGHT_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>📝</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: COLORS.primary, marginBottom: "8px" }}>
              Mock test & tailored practice
            </h3>
            <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.5, margin: 0 }}>
              Take PSC-style mock tests by section. After each session, get AI-generated tailored practice focused on your weak areas—syllables, tones, vocabulary—so you improve faster.
            </p>
            <Link to={ROUTES.MOCK_TEST} style={{ display: "inline-block", marginTop: "12px", fontSize: "14px", fontWeight: 600, color: COLORS.secondary }}>
              Start a test →
            </Link>
          </div>

          <div
            style={{
              padding: "24px",
              borderRadius: "12px",
              backgroundColor: COLORS.light,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                backgroundColor: LIGHT_BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <span style={{ fontSize: "24px" }}>🎤</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: COLORS.primary, marginBottom: "8px" }}>
              Real-time pronunciation feedback
            </h3>
            <p style={{ fontSize: "14px", color: COLORS.muted, lineHeight: 1.5, margin: 0 }}>
              Record your answers and get section-by-section scores and feedback. Focus on tones, retroflex initials, and nasal finals without expensive tutoring.
            </p>
            <Link to={ROUTES.MOCK_TEST} style={{ display: "inline-block", marginTop: "12px", fontSize: "14px", fontWeight: 600, color: COLORS.secondary }}>
              Try mock test →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ ...SECTION_STYLE, paddingTop: "48px", paddingBottom: "64px" }}>
        <p style={{ fontSize: "18px", color: COLORS.muted, marginBottom: "20px" }}>
          {isAuthenticated ? "Jump back into practice or chat with your companion." : "Create a free account to save progress and unlock your learning companion."}
        </p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link to={ROUTES.MOCK_TEST}>
            <button
              style={{
                padding: "12px 24px",
                fontSize: "15px",
                fontWeight: 600,
                backgroundColor: COLORS.secondary,
                color: "white",
                border: "none",
                borderRadius: "9999px",
                cursor: "pointer",
              }}
            >
              Start a Test
            </button>
          </Link>
          {isAuthenticated ? (
            <Link to={ROUTES.CHAT}>
              <button
                style={{
                  padding: "12px 24px",
                  fontSize: "15px",
                  fontWeight: 600,
                  backgroundColor: "white",
                  color: COLORS.secondary,
                  border: `2px solid ${COLORS.secondary}`,
                  borderRadius: "9999px",
                  cursor: "pointer",
                }}
              >
                Chat
              </button>
            </Link>
          ) : (
            <>
              <Link to={ROUTES.SIGNIN}>
                <button
                  style={{
                    padding: "12px 24px",
                    fontSize: "15px",
                    fontWeight: 500,
                    backgroundColor: "transparent",
                    color: COLORS.primary,
                    border: `2px solid ${COLORS.border}`,
                    borderRadius: "9999px",
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
              </Link>
              <Link to={ROUTES.SIGNUP}>
                <button
                  style={{
                    padding: "12px 24px",
                    fontSize: "15px",
                    fontWeight: 600,
                    backgroundColor: COLORS.secondary,
                    color: "white",
                    border: "none",
                    borderRadius: "9999px",
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
