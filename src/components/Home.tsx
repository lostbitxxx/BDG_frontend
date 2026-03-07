import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";
import { CHARACTERS } from "../context/CharacterContext";
import Header from "./Header";

const LANDING_PAGE_BODY_CLASS = "landing-page";
const LIGHT_BLUE = "#a8d4f0";
const FEATURE_CARD_GREY = "#374151";

const LANDING_BACKGROUNDS = [
  "linear-gradient(135deg, #7eb8e0 0%, #a8d4f0 50%, #c5e3f7 100%)",
  "linear-gradient(135deg, #94a3b8 0%, #b8c5d4 50%, #cbd5e1 100%)",
  "linear-gradient(135deg, #1c1917 0%, #7f1d1d 50%, #b91c1c 100%)",
];

function LandingBird({ characterIndex }: { characterIndex: number }) {
  const character = CHARACTERS[characterIndex];
  const riveParams = character.riveConfig
    ? {
        src: character.file,
        stateMachines: character.riveConfig.stateMachines,
        autoplay: true,
      }
    : { src: character.file, autoplay: true };
  const { RiveComponent, rive } = useRive(riveParams);
  const smName = character.riveConfig?.stateMachines?.[0];
  const idleInputName = character.riveConfig?.idleInput?.name;
  const idleInputValue = character.riveConfig?.idleInput?.value;
  const idleInput = useStateMachineInput(
    rive,
    smName ?? undefined,
    idleInputName ?? undefined,
    idleInputValue
  );
  useEffect(() => {
    if (idleInput != null && idleInputValue !== undefined) idleInput.value = idleInputValue;
  }, [idleInput, idleInputValue]);

  return (
    <RiveComponent
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    />
  );
}

const NUM_LANDING_BIRDS = 3;
const SHUFFLE_INTERVAL_MS = 7000;

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [landingCharacterIndex, setLandingCharacterIndex] = useState(0);

  useEffect(() => {
    document.body.classList.add(LANDING_PAGE_BODY_CLASS);
    return () => document.body.classList.remove(LANDING_PAGE_BODY_CLASS);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLandingCharacterIndex((i) => (i + 1) % NUM_LANDING_BIRDS);
    }, SHUFFLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: COLORS.light }}>
      <Header />

      <div style={{ display: "flex", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left: all 3 birds rendered; interval does hard switch */}
        <div
          style={{
            flex: "0 0 50%",
            position: "relative",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              width: "300%",
              height: "100%",
              transform: `translateX(-${landingCharacterIndex * (100 / 3)}%)`,
            }}
          >
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                style={{
                  flex: "0 0 33.333%",
                  position: "relative",
                  background: LANDING_BACKGROUNDS[index],
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "50%",
                    transform: "translateY(-50%) translateX(200px)",
                    width: "180vmin",
                    height: "180vmin",
                    maxWidth: "180%",
                    maxHeight: "180%",
                  }}
                >
                  <LandingBird key={index} characterIndex={index} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: White column — header + 3 feature cards (only this side scrolls) */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              minHeight: "min-content",
              padding: "48px 40px 56px",
            }}
          >
          {/* Header */}
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 700,
              color: COLORS.primary,
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            Putonghua practice that actually helps
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: COLORS.muted,
              marginBottom: "24px",
              lineHeight: 1.6,
            }}
          >
            The Putonghua Proficiency Test (PSC) is tough for Cantonese speakers—Grade 2B pass rates sit
            around 45%. BoDongGua gives you AI-driven mock tests, tailored practice, and a learning
            companion.
          </p>
          <div style={{ marginBottom: "40px" }}>
            {isAuthenticated ? (
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
                  Start PSC Mock Test
                </button>
              </Link>
            ) : (
              <Link to={ROUTES.SIGNUP}>
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
                  Get Started — It's Free
                </button>
              </Link>
            )}
          </div>

          {/* 3 rectangular feature cards stacked vertically */}
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: COLORS.primary,
              marginBottom: "20px",
            }}
          >
            How BoDongGua helps
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                padding: "20px 24px",
                borderRadius: "24px",
                backgroundColor: COLORS.light,
                display: "flex",
                alignItems: "flex-start",
                alignContent: "flex-start",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, alignSelf: "flex-start" }}>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 600,
                    color: COLORS.primary,
                    marginBottom: "8px",
                    marginTop: 0,
                  }}
                >
                  Interactive learning companions
                </h3>
                <p style={{ fontSize: "16px", color: FEATURE_CARD_GREY, lineHeight: 1.5, margin: 0 }}>
                  Choose a character that fits your style. Your companion stays with you during practice
                  and tracks your progress over time.
                </p>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  borderRadius: "14px",
                  backgroundColor: LIGHT_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>🎭</span>
              </div>
            </div>

            <div
              style={{
                padding: "20px 24px",
                borderRadius: "24px",
                backgroundColor: COLORS.light,
                display: "flex",
                alignItems: "flex-start",
                alignContent: "flex-start",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, alignSelf: "flex-start" }}>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 600,
                    color: COLORS.primary,
                    marginBottom: "8px",
                    marginTop: 0,
                  }}
                >
                  Mock test & tailored practice
                </h3>
                <p style={{ fontSize: "16px", color: FEATURE_CARD_GREY, lineHeight: 1.5, margin: 0 }}>
                  Take PSC-style mock tests. Get AI-generated tailored practice focused on your weak
                  areas so you improve faster.
                </p>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  borderRadius: "14px",
                  backgroundColor: LIGHT_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>📝</span>
              </div>
            </div>

            <div
              style={{
                padding: "20px 24px",
                borderRadius: "24px",
                backgroundColor: COLORS.light,
                display: "flex",
                alignItems: "flex-start",
                alignContent: "flex-start",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0, alignSelf: "flex-start" }}>
                <h3
                  style={{
                    fontSize: "19px",
                    fontWeight: 600,
                    color: COLORS.primary,
                    marginBottom: "8px",
                    marginTop: 0,
                  }}
                >
                  Real-time pronunciation feedback
                </h3>
                <p style={{ fontSize: "16px", color: FEATURE_CARD_GREY, lineHeight: 1.5, margin: 0 }}>
                  Record your answers and get section-by-section scores and feedback on tones and
                  pronunciation.
                </p>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  alignSelf: "flex-start",
                  borderRadius: "14px",
                  backgroundColor: LIGHT_BLUE,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "24px" }}>🎤</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ marginTop: "32px" }}>
            <p style={{ fontSize: "16px", color: COLORS.muted, marginBottom: "12px" }}>
              {isAuthenticated
                ? "Jump back into practice or chat with your companion."
                : "Create a free account to save progress and unlock your learning companion."}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {isAuthenticated ? (
                <Link to={ROUTES.CHAT}>
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
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
