// Shared TypeScript types for frontend

export interface User {
  _id: string;
  email: string;
  username: string;
  character: 'bunny' | 'cat' | 'owl';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}

export interface ChatResponse {
  audioBase64?: string;
  success: boolean;
  response: string;
  timestamp: string;
  error?: string;
}