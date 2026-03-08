import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import { auth, signInWithCustomToken } from "../lib/firebase";
import { COLORS, ROUTES } from "../constants";
import Header from "./Header";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { setCharacter, setAffinityFromAuth } = useCharacter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const welcomeMessage = (location.state as { welcome?: string } | null)
    ?.welcome;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const result = await authService.login({
        email: formData.email.trim(),
        password: formData.password,
      });
      if (result.success && result.user && result.token) {
        login(result.user, result.token);
        setCharacter((result.user.character ?? "red-birdie") as "red-birdie" | "foggy-birdie" | "final-birdie");
        try {
          await signInWithCustomToken(auth, result.token);
        } catch (e) {
          console.warn("Firebase sign-in with custom token failed:", e);
        }
        const authRes = result as { affinityXp?: number; affinityLevel?: number };
        if (authRes.affinityXp !== undefined || authRes.affinityLevel !== undefined) {
          setAffinityFromAuth({
            affinityXp: Math.max(0, Number(authRes.affinityXp ?? 0)),
            affinityLevel: Math.max(1, Math.min(5, Number(authRes.affinityLevel ?? 1))),
          });
        }
        navigate(ROUTES.CHAT, {
          state: { welcome: `Welcome back, ${result.user.username}! 👋` },
        });
      } else {
        setErrors({
          general: result.error || "Sign in failed. Please try again.",
        });
      }
    } catch {
      setErrors({ general: "Network error. Please check your connection." });
    } finally {
      setLoading(false);
    }
  };

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
            Welcome Back
          </h2>
          <p
            style={{
              textAlign: "center",
              color: COLORS.muted,
              marginBottom: "30px",
              fontSize: "14px",
            }}
          >
            Sign in to continue to BoDongGua
          </p>

          {/* Welcome banner */}
          {welcomeMessage && (
            <div
              style={{
                backgroundColor: "#eafaf1",
                border: `1px solid ${COLORS.success}`,
                color: COLORS.success,
                padding: "12px 16px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {welcomeMessage}
            </div>
          )}

          {/* General error */}
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

          <form onSubmit={handleSubmit} method="post" noValidate>
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
                autoFocus
              />
              {errors.email && <p style={errorStyle}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "28px" }}>
              <label style={labelStyle}>Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
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
              {errors.password && <p style={errorStyle}>{errors.password}</p>}
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
                backgroundColor: loading ? "#bdc3c7" : COLORS.secondary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
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
            Don't have an account?{" "}
            <Link
              to={ROUTES.SIGNUP}
              style={{
                color: COLORS.success,
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignIn;
