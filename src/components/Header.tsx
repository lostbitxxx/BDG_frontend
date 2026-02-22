import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinkStyle = (path: string): React.CSSProperties => ({
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "15px",
    fontWeight: "500",
    textDecoration: "none",
    color: isActive(path) ? "white" : COLORS.primary,
    backgroundColor: isActive(path) ? COLORS.secondary : "transparent",
    border: `2px solid ${isActive(path) ? COLORS.secondary : "transparent"}`,
    transition: "all 0.2s",
    cursor: "pointer",
  });

  const logoDestination = isAuthenticated ? ROUTES.HOME_APP : ROUTES.HOME;

  return (
    <header
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {/* Top bar: logo + auth */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 40px",
          borderBottom: isAuthenticated ? `1px solid ${COLORS.border}` : "none",
        }}
      >
        <Link to={logoDestination} style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: "26px",
              fontWeight: "bold",
              color: COLORS.primary,
              letterSpacing: "-0.5px",
            }}
          >
            BoDongGua
          </span>
        </Link>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {isAuthenticated && user ? (
            <>
              <span
                style={{
                  color: COLORS.muted,
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                👤 {user.username}
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate(ROUTES.HOME);
                }}
                style={{
                  padding: "8px 18px",
                  fontSize: "14px",
                  backgroundColor: "transparent",
                  color: COLORS.danger,
                  border: `2px solid ${COLORS.danger}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.SIGNIN}>
                <button
                  style={{
                    padding: "8px 18px",
                    fontSize: "14px",
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
                    padding: "8px 18px",
                    fontSize: "14px",
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
            </>
          )}
        </div>
      </div>

      {/* Nav bar — only shown when logged in */}
      {isAuthenticated && (
        <nav
          style={{
            display: "flex",
            gap: "8px",
            padding: "10px 40px",
            alignItems: "center",
          }}
        >
          <Link to={ROUTES.HOME_APP} style={navLinkStyle(ROUTES.HOME_APP)}>
            🏠 Homepage
          </Link>
          <Link
            to={ROUTES.CHOOSE_CHARACTER}
            style={navLinkStyle(ROUTES.CHOOSE_CHARACTER)}
          >
            🎭 Choose Your Character
          </Link>
          <Link to={ROUTES.CHAT} style={navLinkStyle(ROUTES.CHAT)}>
            💬 Chat
          </Link>
          <Link to={ROUTES.MOCK_TEST} style={navLinkStyle(ROUTES.MOCK_TEST)}>
            📝 Mock Test
          </Link>
          <Link
            to={ROUTES.TAILORED_PRACTICE}
            style={navLinkStyle(ROUTES.TAILORED_PRACTICE)}
          >
            🎯 Tailored Practice
          </Link>
          <Link to={ROUTES.HISTORY} style={navLinkStyle(ROUTES.HISTORY)}>
            📖 History
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
