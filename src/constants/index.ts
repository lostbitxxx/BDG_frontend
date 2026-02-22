// ─── API Configuration ────────────────────────────────────────
export const API_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? '/api'
    : process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// ─── Routes ──────────────────────────────────────────────────
export const ROUTES = {
  HOME: '/',
  HOME_APP: '/home',
  CHAT: '/chat',
  CHOOSE_CHARACTER: '/choose-character',
  MOCK_TEST: '/mock-test',
  TAILORED_PRACTICE: '/tailored-practice',
  HISTORY: '/history',
  QUESTION: '/question',
  SIGNIN: '/signin',
  SIGNUP: '/signup'
} as const;

// ─── Theme ───────────────────────────────────────────────────
export const COLORS = {
  primary: '#2c3e50',
  secondary: '#3498db',
  success: '#27ae60',
  danger: '#e74c3c',
  warning: '#f39c12',
  light: '#f8f9fa',
  border: '#e0e0e0',
  muted: '#7f8c8d'
} as const;

// ─── Chat ────────────────────────────────────────────────────
export const CHAT = {
  MAX_MESSAGE_LENGTH: 1000
} as const;