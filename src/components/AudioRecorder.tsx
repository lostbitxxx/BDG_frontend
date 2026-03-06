import React, { useEffect, useRef, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { COLORS } from '../constants';

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onRecordingStart?: () => void;
  onDurationChange?: (duration: number) => void;
  maxDuration?: number; // Maximum recording duration in seconds
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onRecordingStart, onDurationChange, maxDuration }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isVisualizingRef = useRef(false);

  // Handle audio stream for visualization
  const handleStream = useCallback((stream: MediaStream) => {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioContext;

    // Create analyser node
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyserRef.current = analyser;

    // Connect stream to analyser
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    isVisualizingRef.current = true;

    // Start visualization loop
    const draw = () => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Only draw bars if we're actually visualizing
      if (!isVisualizingRef.current || !analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Draw waveform bars
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        // Gradient from red to orange
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#e74c3c');
        gradient.addColorStop(1, '#f39c12');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, []);

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useAudioRecorder(onRecordingStart, maxDuration, onDurationChange, handleStream);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop visualization when not recording
  useEffect(() => {
    if (!isRecording) {
      isVisualizingRef.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Clear canvas when not recording
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f5f5f5';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [isRecording]);

  // Notify parent when recording is complete - only when recording stops and we have audio
  const prevBlobRef = useRef<Blob | null>(null);
  
  useEffect(() => {
    // Only trigger when audioBlob changes from null to a value (recording stopped)
    if (audioBlob && !prevBlobRef.current && onRecordingComplete) {
      prevBlobRef.current = audioBlob;
      onRecordingComplete(audioBlob, duration);
    }
    // Reset when audioBlob is cleared (re-record)
    if (!audioBlob) {
      prevBlobRef.current = null;
    }
  }, [audioBlob, duration, onRecordingComplete]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      {/* Title */}
      <h3
        style={{
          margin: '0 0 20px 0',
          color: COLORS.primary,
          textAlign: 'center',
        }}
      >
        🎤 Audio Recorder
      </h3>

      {/* Error Message */}
      {error && (
        <div
          style={{
            backgroundColor: '#fee',
            border: '1px solid #f88',
            color: '#c00',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Timer Display */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '48px',
          fontWeight: 'bold',
          color: isRecording ? '#e74c3c' : COLORS.primary,
          marginBottom: '20px',
          fontFamily: 'monospace',
        }}
      >
        {formatTime(duration)}
        {isRecording && <span style={{ fontSize: '16px' }}> ⏺</span>}
      </div>

      {/* Waveform Visualizer */}
      <div
        style={{
          height: '60px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '20px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={60}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
        {!isRecording && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ color: '#999', fontSize: '14px' }}>
              {audioUrl ? 'Recording complete!' : 'Press record to start'}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '30px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 8px rgba(231,76,60,0.3)',
            }}
          >
            ⏺ Record
          </button>
        )}

        {isRecording && !isPaused && (
          <>
            <button
              onClick={pauseRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#f39c12',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
              }}
            >
              ⏸ Pause
            </button>
            <button
              onClick={stopRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
              }}
            >
              ⏹ Stop
            </button>
          </>
        )}

        {isRecording && isPaused && (
          <>
            <button
              onClick={resumeRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
              }}
            >
              ▶ Resume
            </button>
            <button
              onClick={stopRecording}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
              }}
            >
              ⏹ Stop
            </button>
          </>
        )}
      </div>

      {/* Playback */}
      {audioUrl && (
        <div style={{ marginTop: '24px' }}>
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            controlsList="nodownload"
            style={{ width: '100%', marginBottom: '12px' }}
            preload="auto"
          />
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={resetRecording}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              🔄 Re-record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AudioRecorder;
