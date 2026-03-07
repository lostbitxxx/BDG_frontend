// ─── API Configuration ────────────────────────────────────────
import type { AuthResponse, ChatResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// ─── Helpers ─────────────────────────────────────────────────
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function post<T>(path: string, body: unknown, auth = false): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: auth ? getAuthHeaders() : { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body)
  });
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: getAuthHeaders()
  });
  return res.json();
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
        localStorage.setItem('token', result.token);
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
        localStorage.setItem('token', result.token);
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

  async updateCharacter(character: 'bunny' | 'cat' | 'owl'): Promise<AuthResponse> {
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
      const result = await get<{ success: boolean; user?: unknown; affinityXp?: number; affinityLevel?: number; error?: string }>('/api/auth/verify');
      return result;
    } catch {
      return { success: false, error: 'Verify failed.' };
    }
  }
};

// ─── Chat ────────────────────────────────────────────────────
export const chatService = {
  async sendMessage(message: string): Promise<ChatResponse> {
    return post<ChatResponse>('/api/chat', { message });
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