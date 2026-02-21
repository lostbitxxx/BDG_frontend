const API_BASE_URL = 'http://localhost:3001/api';

export interface ChatMessage {
  message: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  timestamp: string;
}

class ApiService {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  async sendChatMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to connect to backend'
      );
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      if (!response.ok) throw new Error('Health check failed');
      return await response.json();
    } catch (error) {
      throw new Error('Backend unavailable');
    }
  }
}

export const apiService = new ApiService();

// Legacy export for backward compatibility
export const sendChatMessage = (message: string) => apiService.sendChatMessage(message);