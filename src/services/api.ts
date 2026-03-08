// ─── API Configuration ────────────────────────────────────────
import type { AuthResponse, ChatResponse } from '../types';
import { auth } from '../lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ─── Helpers ─────────────────────────────────────────────────
/** Decode JWT payload to check token type (without verification) */
function decodeTokenPayload(token: string): { sub?: string; uid?: string; iss?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

/** Check if token is a service account token (should never be used for user requests) */
function isServiceAccountToken(token: string): boolean {
  const payload = decodeTokenPayload(token);
  if (!payload) return false;

  // Check if issuer or subject contains firebase-adminsdk (service account)
  if (payload.iss?.includes('firebase-adminsdk') ||
      payload.sub?.includes('firebase-adminsdk') ||
      payload.uid?.includes('firebase-adminsdk')) {
    return true;
  }
  return false;
}

/** Use current Firebase user's ID token. Falls back to stored token if Firebase session not available. */
async function getAuthHeaders(): Promise<Record<string, string>> {
  console.log('getAuthHeaders: auth.currentUser:', auth.currentUser?.uid);

  // First try to get fresh token from Firebase (force refresh to ensure valid)
  if (auth.currentUser) {
    try {
      // Reload user to ensure we have latest valid state
      await auth.currentUser.reload();

      // Check if user is still valid after reload
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.uid) {
        console.warn('User not valid after reload');
      } else {
        // Force refresh to get a fresh token (true parameter)
        const token = await currentUser.getIdToken(true);
        console.log('Got fresh token from Firebase, length:', token?.length);

        // Defense: reject service account tokens (should never happen with correct Firebase setup)
        if (isServiceAccountToken(token)) {
          console.error('SECURITY: Service account token detected! Using stored token instead.');
        } else {
          // Update stored token with fresh one
          localStorage.setItem('token', token);
          return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
        }
      }
    } catch (error) {
      console.warn('Failed to get ID token from Firebase:', error);
    }
  } else {
    console.warn('No auth.currentUser - using stored token');
  }

  // Fallback: use token from localStorage if Firebase session not available
  const storedToken = localStorage.getItem('token');
  console.log('Stored token exists:', !!storedToken, 'length:', storedToken?.length);

  if (storedToken) {
    // Check if it's a service account token
    if (isServiceAccountToken(storedToken)) {
      console.error('SECURITY: Stored token is service account! Clearing it.');
      localStorage.removeItem('token');
      return { 'Content-Type': 'application/json' };
    }
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${storedToken}` };
  }

  // No auth available
  console.warn('No auth token available');
  return { 'Content-Type': 'application/json' };
}

async function post<T>(path: string, body: unknown, useAuth = false): Promise<T> {
  const headers = useAuth ? await getAuthHeaders() : { 'Content-Type': 'application/json' };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body)
  });
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers
  });
  return res.json();
}

// ─── Test history (backend: GET /api/test/history) ────────────────────────────────────────
export interface BackendTestHistoryItem {
  id: string;
  sessionId: string;
  type: 'full' | 'partial';
  partialSection?: number | null;
  completedAt: string;
  totalScore: number;
  testGPA: number;
  level: string;
  grade: string;
  pass: boolean;
  sectionGrades?: Record<string, string>;
  sectionGPAs?: Record<string, number>;
  completedSections?: number[];
}

export async function getTestHistory(limit = 50): Promise<{ success: boolean; history?: BackendTestHistoryItem[]; error?: string }> {
  try {
    const path = `/api/test/history?limit=${Math.min(Math.max(1, limit), 100)}`;
    const out = await get<{ success: boolean; history?: BackendTestHistoryItem[]; error?: string }>(path);
    return out ?? { success: false, history: [] };
  } catch (e) {
    console.error('getTestHistory failed:', e);
    return { success: false, history: [], error: 'Could not load history.' };
  }
}

/** Start a test session. Returns sessionId for use with complete. */
export async function startTest(body: { type: 'full' | 'partial'; section?: number }): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const out = await post<{ success: boolean; sessionId?: string; error?: string }>('/api/test/start', body, true);
    return out ?? { success: false };
  } catch (e) {
    console.error('startTest failed:', e);
    return { success: false, error: 'Could not start test.' };
  }
}

/** Complete payload for POST /api/test/:sessionId/complete. Optional auth; if sent, backend records to user history. */
export interface CompleteTestPayload {
  type: 'full' | 'partial';
  partialSection?: number;
  totalScore?: number;
  testGPA?: number;
  level?: string;
  grade?: string;
  pass?: boolean;
  sectionGrades?: Record<string, string>;
  sectionGPAs?: Record<string, number>;
  completedSections?: number[];
}

export async function completeTest(sessionId: string, payload: CompleteTestPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE_URL}/api/test/${encodeURIComponent(sessionId)}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({ success: false }));
    return out ?? { success: false };
  } catch (e) {
    console.error('completeTest failed:', e);
    return { success: false, error: 'Could not complete test.' };
  }
}

// ─── Auth ────────────────────────────────────────────────────
export const authService = {
  async register(data: {
    email: string;
    password: string;
    username: string;
  }): Promise<AuthResponse> {
    try {
      const result = await post<AuthResponse>('/api/auth/register', data);
      if (result.success && result.token && result.user) {
        // Sign in with Firebase custom token to establish Firebase session
        try {
          await signInWithCustomToken(auth, result.token);
          console.log('Firebase auth signed in successfully');

          // Get the ID token after Firebase sign-in and store it for backend auth
          const idToken = await auth.currentUser?.getIdToken();
          if (idToken) {
            localStorage.setItem('token', idToken);
          }
        } catch (firebaseError) {
          // Fallback: use custom token if Firebase sign-in fails
          console.warn('Firebase sign-in failed, using custom token:', firebaseError);
          localStorage.setItem('token', result.token);
        }

        localStorage.setItem('user', JSON.stringify(result.user));
      }
      return result;
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    try {
      const result = await post<AuthResponse>('/api/auth/login', data);
      if (result.success && result.token && result.user) {
        // Sign in with Firebase custom token to establish Firebase session
        try {
          await signInWithCustomToken(auth, result.token);
          console.log('Firebase auth signed in successfully');

          // Get the ID token after Firebase sign-in and store it for backend auth
          const idToken = await auth.currentUser?.getIdToken();
          if (idToken) {
            localStorage.setItem('token', idToken);
          }
        } catch (firebaseError) {
          // Fallback: use custom token if Firebase sign-in fails
          console.warn('Firebase sign-in failed, using custom token:', firebaseError);
          localStorage.setItem('token', result.token);
        }

        localStorage.setItem('user', JSON.stringify(result.user));
      }
      return result;
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: (): string | null => localStorage.getItem('token'),

  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated: (): boolean => !!localStorage.getItem('token'),

  async updateUsername(username: string): Promise<{ success: boolean; username?: string; error?: string }> {
    try {
      const result = await put<{ success: boolean; username?: string; error?: string }>('/api/auth/username', { username });
      if (result.success && result.username) {
        const user = authService.getUser();
        if (user) {
          user.username = result.username;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
      return result;
    } catch {
      return { success: false, error: 'Failed to update username.' };
    }
  },

  async updateCharacter(character: 'red-birdie' | 'foggy-birdie' | 'final-birdie'): Promise<AuthResponse> {
    try {
      const result = await put<AuthResponse>('/api/auth/character', { character });
      if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      return result;
    } catch {
      return { success: false, error: 'Failed to update character.' };
    }
  },

  /** Fetch current user's affinity (XP, level) from backend. */
  async getAffinity(): Promise<{ success: boolean; affinityXp?: number; affinityLevel?: number; affinityStage?: string; error?: string }> {
    try {
      const result = await get<{ success: boolean; affinityXp?: number; affinityLevel?: number; affinityStage?: string; error?: string }>('/api/auth/affinity');
      return result;
    } catch {
      return { success: false, error: 'Failed to load affinity.' };
    }
  },

  /** Verify token and get current user + affinity (fallback when getAffinity is not available). */
  async verify(): Promise<{ success: boolean; user?: { _id: string; email?: string; username?: string; character?: string }; affinityXp?: number; affinityLevel?: number; error?: string }> {
    try {
      const result = await get<{ success: boolean; user?: { _id: string; email?: string; username?: string; character?: string }; affinityXp?: number; affinityLevel?: number; error?: string }>('/api/auth/verify');
      return result;
    } catch {
      return { success: false, error: 'Verify failed.' };
    }
  }
};

// ─── Chat ────────────────────────────────────────────────────
export const chatService = {
  async sendMessage(message: string, character?: string, gender?: 'male' | 'female'): Promise<ChatResponse> {
    return post<ChatResponse>('/api/chat', { message, character, gender }, true);
  }
};

// ─── Tailored Practice ────────────────────────────────────
export interface GeneratedQuestion {
  content: string;
  pinyin: string;
  type: 'tone' | 'pronunciation' | 'vocabulary' | 'grammar' | 'reading';
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}

export interface TailoredPracticeResponse {
  success: boolean;
  questions?: GeneratedQuestion[];
  error?: string;
  generatedFor?: string;
}

export const tailoredPracticeService = {
  async generatePractice(params: {
    userInput?: string;
    categories?: string[];
    weaknesses?: string[];
    historyRecord?: {
      feedbackEn: string;
      feedbackZh: string;
      weaknesses: string[];
      strengths: string[];
      overallScore: number;
    };
  }): Promise<TailoredPracticeResponse> {
    return post<TailoredPracticeResponse>('/api/tailored-practice', params);
  }
};

// ─── Audio ──────────────────────────────────────────────────
export interface AudioUploadResponse {
  success: boolean;
  url?: string;
  key?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

export const audioService = {
  async uploadAudio(audioBlob: Blob, filename: string): Promise<AudioUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);

      // Get only the authorization token, NOT Content-Type (browser sets it for FormData)
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/audio/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `Upload failed with status ${res.status}`
        };
      }

      return res.json();
    } catch (err) {
      console.error('Upload error:', err);
      return { success: false, error: 'Failed to upload audio. Please try again.' };
    }
  }
};