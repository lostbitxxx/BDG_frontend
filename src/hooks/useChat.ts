import { useState, useCallback } from 'react';
import { chatService } from '../services/api';
import type { ChatMessage } from '../types';
import { CHAT } from '../constants';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((type: 'user' | 'ai', content: string) => {
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${type}`, type, content, timestamp: new Date() }
    ]);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const message = text.trim();
    if (!message || isLoading) return;
    if (message.length > CHAT.MAX_MESSAGE_LENGTH) {
      setError(`Message too long (max ${CHAT.MAX_MESSAGE_LENGTH} characters)`);
      return;
    }

    setError(null);
    addMessage('user', message);
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage(message);
      if (res.success) {
        addMessage('ai', res.response);
      } else {
        addMessage('ai', res.error || 'Something went wrong.');
      }
    } catch {
      addMessage('ai', 'Unable to connect. Please try again.');
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}