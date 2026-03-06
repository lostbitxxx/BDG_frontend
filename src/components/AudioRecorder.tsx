import React, { useEffect, useRef } from 'react';
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
  } = useAudioRecorder(onRecordingStart, maxDuration, onDurationChange);

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

      {/* Waveform Visualizer Placeholder */}
      <div
        style={{
          height: '60px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {isRecording ? (
          <div style={{ display: 'flex', gap: '4px' }}>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: `${Math.random() * 40 + 10}px`,
                  backgroundColor: '#e74c3c',
                  borderRadius: '2px',
                  animation: `pulse 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>
        ) : (
          <span style={{ color: '#999', fontSize: '14px' }}>
            {audioUrl ? 'Recording complete!' : 'Press record to start'}
          </span>
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

      {/* Styles for animation */}
      <style>{`
        @keyframes pulse {
          0% { transform: scaleY(0.5); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
