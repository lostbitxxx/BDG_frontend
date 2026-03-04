import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";

const Settings: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 120px)",
          color: COLORS.muted,
          gap: "16px",
        }}
      >
        <span style={{ fontSize: "48px" }}>⚙️</span>
        <h2 style={{ color: COLORS.primary, margin: 0 }}>Settings</h2>
        <p style={{ fontSize: "15px", margin: 0 }}>
          Account and app preferences will appear here.
        </p>

        {isAuthenticated && (
          <button
            onClick={handleSignOut}
            style={{
              marginTop: "16px",
              padding: "12px 24px",
              fontSize: "14px",
              backgroundColor: COLORS.danger,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        )}
      </main>
    </div>
  );
};

export default Settings;
