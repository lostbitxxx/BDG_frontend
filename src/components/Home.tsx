import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
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
        {/* Website Name - Top Left */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#2c3e50",
            fontFamily: "'Arial', sans-serif",
          }}
        >
          BoDongGua
        </div>

        {/* Sign In / Sign Up Buttons - Top Right */}
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

      {/* Main Content - Center */}
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
        {/* Short Intro */}
        <div style={{ maxWidth: "800px" }}>
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#2c3e50",
              marginBottom: "20px",
              lineHeight: "1.2",
            }}
          >
            Welcome to BoDongGua
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#7f8c8d",
              lineHeight: "1.6",
              marginBottom: "40px",
            }}
          >
            Your intelligent conversation companion powered by advanced AI
            technology. Experience natural, engaging conversations that adapt to
            your needs and interests.
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link to="/chat">
              <button
                style={{
                  padding: "16px 32px",
                  fontSize: "18px",
                  backgroundColor: "#27ae60",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontWeight: "600",
                  boxShadow: "0 4px 12px rgba(39, 174, 96, 0.3)",
                }}
              >
                Start Chatting
              </button>
            </Link>

            <Link to="/question">
              <button
                style={{
                  padding: "16px 32px",
                  fontSize: "18px",
                  backgroundColor: "transparent",
                  color: "#3498db",
                  border: "2px solid #3498db",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontWeight: "600",
                }}
              >
                Explore Features
              </button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "30px",
            maxWidth: "900px",
            marginTop: "60px",
          }}
        >
          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🤖</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              AI Powered
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Advanced AI technology for natural conversations
            </p>
          </div>

          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>🔒</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              Private & Secure
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Your conversations are private and secure
            </p>
          </div>

          <div
            style={{
              padding: "30px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "15px" }}>⚡</div>
            <h3 style={{ color: "#2c3e50", marginBottom: "10px" }}>
              Fast Response
            </h3>
            <p style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Instant responses for seamless conversations
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
