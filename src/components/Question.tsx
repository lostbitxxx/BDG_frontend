import React from "react";
import { Link } from "react-router-dom";

const Question: React.FC = () => {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
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
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2c3e50",
              fontFamily: "'Arial', sans-serif",
              cursor: "pointer",
            }}
          >
            BoDongGua
          </div>
        </Link>

        <div style={{ display: "flex", gap: "15px" }}>
          <Link to="/signin">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "transparent",
                color: "#2c3e50",
                border: "2px solid #2c3e50",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
            >
              Sign In
            </button>
          </Link>

          <Link to="/signup">
            <button
              style={{
                padding: "12px 24px",
                fontSize: "16px",
                backgroundColor: "#3498db",
                color: "white",
                border: "2px solid #3498db",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                fontWeight: "500",
              }}
            >
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 100px)",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "48px",
            marginBottom: "20px",
            color: "#2c3e50",
          }}
        >
          Features & Capabilities
        </h1>

        <p
          style={{
            fontSize: "18px",
            textAlign: "center",
            maxWidth: "600px",
            color: "#7f8c8d",
            marginBottom: "40px",
          }}
        >
          Discover what BoDongGua can do for you
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "30px",
            maxWidth: "1000px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>💬</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              AI Conversations
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Natural, intelligent conversations powered by advanced AI models
            </p>
          </div>

          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎨</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              Interactive Characters
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Engaging animated characters that respond to your interactions
            </p>
          </div>

          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>🔒</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              Privacy First
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Your data stays private with local AI processing
            </p>
          </div>
        </div>

        <Link to="/">
          <button
            style={{
              padding: "15px 30px",
              fontSize: "18px",
              backgroundColor: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontWeight: "600",
            }}
          >
            ← Back to Home
          </button>
        </Link>
      </main>
    </div>
  );
};

export default Question;
