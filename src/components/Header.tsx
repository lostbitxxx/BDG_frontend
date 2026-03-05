import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { COLORS, ROUTES } from "../constants";

const EMERALD = {
  fifty: "#ecfdf5",
  hundred: "#d1fae5",
  twoHundred: "#a7f3d0",
  five: "#059669",
  six: "#047857",
};

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnimating, setMenuAnimating] = useState<"none" | "in" | "out">(
    "none",
  );
  const menuRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  const handleMobileToggle = () => {
    if (!mobileOpen) {
      setMobileOpen(true);
      setMenuAnimating("in");
    } else {
      setMenuAnimating("out");
      setTimeout(() => {
        setMenuAnimating("none");
        setMobileOpen(false);
      }, 180);
    }
  };

  useEffect(() => {
    if (!mobileOpen && menuAnimating !== "out") return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[aria-label="Open navigation menu"]') &&
        !target.closest("[data-mobile-menu]")
      ) {
        setMenuAnimating("out");
        setTimeout(() => {
          setMenuAnimating("none");
          setMobileOpen(false);
        }, 180);
      }
    };
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [mobileOpen, menuAnimating]);

  useEffect(() => {
    const updateScrolled = () => setIsScrolled(window.scrollY > 0);
    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });
    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const logoTo = ROUTES.HOME;

  const navLinks = isAuthenticated
    ? [
        { to: ROUTES.SETTINGS, label: "Settings" },
        { to: ROUTES.CHAT, label: "Chat" },
        { to: ROUTES.MOCK_TEST, label: "Mock Test" },
      ]
    : [];

  const linkStyle = (path: string): React.CSSProperties => ({
    color: isActive(path) ? COLORS.secondary : "#4b5563",
    backgroundColor: isActive(path) ? "rgba(52, 152, 219, 0.2)" : "transparent",
    border: "none",
    fontWeight: 500,
    padding: "12px 20px",
    borderRadius: "9999px",
    transition: "color 0.2s, background 0.2s",
  });

  const startTestBtnStyle: React.CSSProperties = {
    backgroundColor: COLORS.secondary,
    color: "white",
    padding: "12px 28px",
    fontSize: "16px",
    borderRadius: "9999px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "none",
    transition: "opacity 0.2s",
  };

  const secondaryBtnStyle: React.CSSProperties = {
    border: "2px solid #a7f3d0",
    color: EMERALD.six,
    padding: "8px 24px",
    borderRadius: "9999px",
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    transition: "border-color 0.3s, background 0.3s",
  };

  return (
    <>
      <header
        className={`header-bar ${isScrolled ? "scrolled" : ""}`}
        style={{ width: "100%" }}
      >
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            height: "64px",
            maxWidth: "1280px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              position: "relative",
              zIndex: 50,
            }}
          >
            <Link to={logoTo}>
              <button
                type="button"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: "#a8d4f0",
                  borderRadius: "50%",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Go to home"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1e5a8a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3l-3 6 2 2 1-2 1 5 1-5 1 2 2-2-3-6z" />
                </svg>
              </button>
            </Link>
            <Link
              to={logoTo}
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              BoDongGua
            </Link>
          </div>

          {/* Desktop: nav links + auth */}
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "12px",
            }}
            className="header-desktop"
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="header-nav-link"
                style={linkStyle(to)}
                data-active={isActive(to)}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && user ? (
              <>
                <Link
                  to={ROUTES.SETTINGS}
                  aria-label="Settings"
                  className="header-settings-link"
                  data-active={isActive(ROUTES.SETTINGS)}
                >
                  <button
                    type="button"
                    className="header-settings-btn"
                    style={{
                      width: 44,
                      height: 44,
                      padding: 0,
                      border: "none",
                      borderRadius: "50%",
                      backgroundColor: "transparent",
                      color: "#4b5563",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </button>
                </Link>
                <Link to={ROUTES.MOCK_TEST}>
                  <button
                    type="button"
                    className="header-start-test-btn"
                    style={startTestBtnStyle}
                  >
                    Start a Test
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to={ROUTES.SIGNIN}>
                  <button style={secondaryBtnStyle}>Sign In</button>
                </Link>
                <Link to={ROUTES.MOCK_TEST}>
                  <button
                    type="button"
                    className="header-start-test-btn"
                    style={startTestBtnStyle}
                  >
                    Start a Test
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile: hamburger + auth icons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              position: "relative",
              zIndex: 50,
            }}
            className="header-mobile"
          >
            {isAuthenticated && user ? (
              <Link
                to={ROUTES.SETTINGS}
                aria-label="Settings"
                className="header-settings-link header-mobile-settings"
                data-active={isActive(ROUTES.SETTINGS)}
              >
                <button
                  type="button"
                  className="header-settings-btn"
                  style={{
                    width: 44,
                    height: 44,
                    padding: 0,
                    border: "none",
                    borderRadius: "50%",
                    backgroundColor: "transparent",
                    color: "#4b5563",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </Link>
            ) : null}
            <button
              type="button"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                width: 40,
                height: 40,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              onClick={handleMobileToggle}
              aria-label="Open navigation menu"
            >
              <span
                style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  backgroundColor: "#111",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  marginBottom: 6,
                  transform: mobileOpen
                    ? "rotate(45deg) translate(4px, 4px)"
                    : "none",
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  backgroundColor: "#111",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  marginBottom: 6,
                  opacity: mobileOpen ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: "block",
                  width: 24,
                  height: 2,
                  backgroundColor: "#111",
                  borderRadius: 2,
                  transition: "all 0.3s",
                  transform: mobileOpen
                    ? "rotate(-45deg) translate(4px, -4px)"
                    : "none",
                }}
              />
            </button>
          </div>
        </nav>

        {/* Mobile menu dropdown */}
        {(mobileOpen || menuAnimating === "out") && (
          <div
            ref={menuRef}
            data-mobile-menu
            className={`header-mobile-menu ${menuAnimating === "out" ? "out" : ""}`}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "white",
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              borderBottomLeftRadius: "24px",
              borderBottomRightRadius: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "24px 16px",
              gap: "16px",
              zIndex: 40,
            }}
            onAnimationEnd={() => {
              if (menuAnimating === "out") {
                setMenuAnimating("none");
                setMobileOpen(false);
              }
            }}
          >
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="header-nav-link"
                data-active={isActive(to)}
                onClick={() => handleMobileToggle()}
                style={{
                  ...linkStyle(to),
                  width: "100%",
                  textAlign: "center",
                  padding: "12px 20px",
                }}
              >
                {label}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to={ROUTES.SIGNIN} onClick={() => handleMobileToggle()}>
                  <button style={secondaryBtnStyle}>Sign In</button>
                </Link>
                <Link
                  to={ROUTES.MOCK_TEST}
                  onClick={() => handleMobileToggle()}
                >
                  <button
                    type="button"
                    className="header-start-test-btn"
                    style={startTestBtnStyle}
                  >
                    Start a Test
                  </button>
                </Link>
              </>
            )}
          </div>
        )}

        <style>{`
        .header-nav-link, .header-nav-link:hover, .header-nav-link:focus, .header-nav-link:focus-visible,
        .header-settings-btn, .header-settings-btn:hover, .header-settings-btn:focus, .header-settings-btn:focus-visible,
        .header-start-test-btn, .header-start-test-btn:hover, .header-start-test-btn:focus, .header-start-test-btn:focus-visible,
        .header-desktop a, .header-desktop a:hover, .header-desktop a:focus, .header-desktop a:focus-visible,
        .header-desktop button {
          outline: none !important;
          box-shadow: none !important;
        }
        .header-nav-link:hover {
          background-color: rgba(52, 152, 219, 0.15) !important;
          color: ${COLORS.secondary} !important;
        }
        .header-nav-link[data-active="true"], .header-nav-link[data-active="true"]:hover {
          background-color: rgba(52, 152, 219, 0.2) !important;
          color: ${COLORS.secondary} !important;
        }
        .header-settings-btn:hover {
          background-color: rgba(52, 152, 219, 0.15) !important;
          color: ${COLORS.secondary} !important;
        }
        .header-settings-link[data-active="true"] .header-settings-btn {
          background-color: rgba(52, 152, 219, 0.2) !important;
          color: ${COLORS.secondary} !important;
        }
        .header-start-test-btn:hover {
          opacity: 0.9;
        }
        @media (min-width: 768px) {
          .header-mobile { display: none !important; }
          .header-desktop { display: flex !important; }
        }
        .header-logout-btn:hover { opacity: 0.9; }
        .header-logout-btn:focus { outline: none !important; }
        @media (max-width: 767px) {
          .header-desktop { display: none !important; }
        }
      `}</style>
      </header>
      {/* Spacer so content is not hidden under fixed header */}
      <div style={{ height: 64 }} aria-hidden="true" />
    </>
  );
};

export default Header;
