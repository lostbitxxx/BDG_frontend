import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/api";
import { COLORS, ROUTES } from "../constants";
import Header from "./Header";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import { auth, signInWithCustomToken } from "../lib/firebase";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { setCharacter, setAffinityFromAuth } = useCharacter();
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── Validation ──────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase and lowercase letters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Handlers ────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await authService.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (result.success && result.user && result.token) {
        login(result.user, result.token);
        setCharacter((result.user.character ?? "red-birdie") as "red-birdie" | "foggy-birdie" | "final-birdie");
        setAffinityFromAuth({ affinityXp: 0, affinityLevel: 1 });
        try {
          await signInWithCustomToken(auth, result.token);
        } catch (e) {
          console.warn("Firebase sign-in with custom token failed:", e);
        }
        navigate(ROUTES.CHAT, {
          state: { welcome: `Welcome, ${result.user.username}! 🎉` },
        });
      } else {
        setErrors({
          general: result.error || "Registration failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ──────────────────────────────────────────────
  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    border: `2px solid ${hasError ? COLORS.danger : COLORS.border}`,
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "6px",
    color: COLORS.primary,
    fontWeight: "500",
    fontSize: "14px",
  };

  const errorStyle: React.CSSProperties = {
    color: COLORS.danger,
    fontSize: "12px",
    margin: "4px 0 0 0",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      {/* Form */}
      <main
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "calc(100vh - 120px)",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "8px",
              color: COLORS.primary,
              fontSize: "26px",
            }}
          >
            Create Account
          </h2>
          <p
            style={{
              textAlign: "center",
              color: COLORS.muted,
              marginBottom: "30px",
              fontSize: "14px",
            }}
          >
            Join BoDongGua and start chatting
          </p>

          {/* General Error */}
          {errors.general && (
            <div
              style={{
                backgroundColor: "#fde8e8",
                border: `1px solid ${COLORS.danger}`,
                color: COLORS.danger,
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. cooluser123"
                style={inputStyle(!!errors.username)}
                disabled={loading}
                autoFocus
              />
              {errors.username && <p style={errorStyle}>{errors.username}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                style={inputStyle(!!errors.email)}
                disabled={loading}
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "18px" }}>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  style={{
                    ...inputStyle(!!errors.password),
                    paddingRight: "60px",
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: COLORS.muted,
                    fontSize: "13px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password ? (
                <p style={errorStyle}>{errors.password}</p>
              ) : (
                <p
                  style={{
                    fontSize: "12px",
                    color: COLORS.muted,
                    margin: "4px 0 0 0",
                  }}
                >
                  Must be 6+ characters with uppercase and lowercase
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Confirm Password *</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                style={inputStyle(!!errors.confirmPassword)}
                disabled={loading}
              />
              {errors.confirmPassword && (
                <p style={errorStyle}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: loading ? "#bdc3c7" : COLORS.success,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: COLORS.muted,
              fontSize: "14px",
            }}
          >
            Already have an account?{" "}
            <Link
              to={ROUTES.SIGNIN}
              style={{
                color: COLORS.secondary,
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign in here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUp;
