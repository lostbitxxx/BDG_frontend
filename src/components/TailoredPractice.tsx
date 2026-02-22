import React from "react";
import Header from "./Header";
import { COLORS } from "../constants";

const TailoredPractice: React.FC = () => {
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
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "48px" }}>🎯</span>
        <h2 style={{ color: COLORS.primary, margin: 0 }}>Tailored Practice</h2>
        <p style={{ fontSize: "15px", margin: 0 }}>
          Coming soon — further development in progress.
        </p>
      </main>
    </div>
  );
};

export default TailoredPractice;
