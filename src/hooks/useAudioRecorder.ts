import { useState, useRef, useCallback, useEffect } from 'react';
// @ts-ignore - polyfill for Safari
import AudioRecorderPolyfill from 'audio-recorder-polyfill';

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

// Use polyfill for Safari and guard for non-browser environments
const getMediaRecorder = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  // @ts-ignore
  if (window.MediaRecorder === undefined) {
    // @ts-ignore
    window.MediaRecorder = AudioRecorderPolyfill;
  }
  return window.MediaRecorder as typeof MediaRecorder;
};

export function useAudioRecorder(onRecordingStart?: () => void, maxDuration?: number, onDurationChange?: (duration: number) => void, onStream?: (stream: MediaStream) => void) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize polyfill on mount
  useEffect(() => {
    getMediaRecorder();
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const MediaRecorderClass = getMediaRecorder();
      if (!MediaRecorderClass) {
        throw new Error('MediaRecorder is not supported in this environment.');
      }

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error('Audio recording is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorderClass(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Create blob with a more compatible MIME type
        let mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/wav';
          }
        }
        
        const blob = new Blob(chunksRef.current, { type: mimeType });
        // Use a timestamp-based URL to avoid caching issues
        const url = URL.createObjectURL(blob);
        
        setState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob: blob,
          audioUrl: url,
        }));

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (e: Event) => {
        console.error('Recording error:', e);
        setState(prev => ({ 
          ...prev, 
          error: 'Recording failed',
          isRecording: false 
        }));
      };

      mediaRecorder.start(100);
      setState(prev => ({ ...prev, isRecording: true, duration: 0 }));

      // Pass the stream to parent for visualization
      if (onStream) onStream(stream);

      // Notify parent that recording started
      if (onRecordingStart) onRecordingStart();

      // Start timer
      timerRef.current = setInterval(() => {
        setState(prev => {
          // Auto-stop if maxDuration reached
          if (maxDuration && prev.duration >= maxDuration) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
            return prev;
          }
          const newDuration = prev.duration + 1;
          if (onDurationChange) onDurationChange(newDuration);
          return { ...prev, duration: newDuration };
        });
      }, 1000);

    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to start recording';
      setState(prev => ({ ...prev, error, isRecording: false }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setState(prev => ({ ...prev, isRecording: false, isPaused: false }));
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      
      timerRef.current = setInterval(() => {
        setState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
      
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, []);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: null,
    });
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
