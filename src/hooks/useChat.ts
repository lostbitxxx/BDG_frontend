import { useState, useCallback } from 'react';
import { chatService } from '../services/api';
import type { ChatMessage } from '../types';
import { CHAT } from '../constants';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addMessage = useCallback((type: 'user' | 'ai', content: string, audioBase64?: string) => {
    setMessages(prev => [
      ...prev,
      { 
        id: `${Date.now()}-${type}`, 
        type, 
        content, 
        audioBase64,
        timestamp: new Date() 
      }
    ]);
  }, []);

  const playAudio = useCallback((base64: string) => {
    try {
      // Convert base64 to audio blob
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio(url);
      audio.play().catch(err => console.error('Audio play error:', err));
      
      // Cleanup after playing
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Audio decode error:', err);
    }
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
        addMessage('ai', res.response, res.audioBase64);
        
        // Auto-play TTS if available
        if (res.audioBase64) {
          setTimeout(() => playAudio(res.audioBase64!), 500);
        }
      } else {
        addMessage('ai', res.error || 'Something went wrong.');
      }
    } catch {
      addMessage('ai', 'Unable to connect. Please try again.');
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage, playAudio]);

  const clearMessages = useCallback(() => setMessages([]), []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
