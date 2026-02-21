import React from "react";
import { Link } from "react-router-dom";

const SignUp: React.FC = () => {
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

        {/* Navigation */}
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
        </div>
      </header>

      {/* Main Content */}
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 100px)",
          padding: "40px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "400px",
          }}
        >
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#2c3e50",
              textAlign: "center",
              marginBottom: "30px",
            }}
          >
            Join BoDongGua
          </h2>

          <form
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontWeight: "500",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontWeight: "500",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontWeight: "500",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#2c3e50",
                  fontWeight: "500",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "2px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "16px",
                  transition: "border-color 0.3s ease",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.3s ease",
                fontWeight: "600",
                marginTop: "10px",
              }}
            >
              Create Account
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#7f8c8d",
            }}
          >
            Already have an account?{" "}
            <Link
              to="/signin"
              style={{
                color: "#3498db",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign in here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
