import React, { useState } from "react";
import Header from "./Header";
import AudioRecorder from "./AudioRecorder";
import { audioService } from "../services/api";
import { getQuestionsBySection, getSampleTest, Question } from "../data/questions";
import { COLORS } from "../constants";

// PSC Scoring Levels
// Reference: https://cle.hkust.edu.hk/tests/psc/psc
// Level 1-A: 97%, Level 1-B: 92%
// Level 2-A: 87%, Level 2-B: 80%  
// Level 3-A: 70%, Level 3-B: 60%

export interface PSCScore {
  overall: number;
  grade: string;
  level: string;
  pass: boolean;
}

export function calculatePSCScore(overall: number): PSCScore {
  let grade = '';
  let level = '';
  let pass = false;

  if (overall >= 97) {
    grade = 'A';
    level = 'Level 1';
    pass = true;
  } else if (overall >= 92) {
    grade = 'B';
    level = 'Level 1';
    pass = true;
  } else if (overall >= 87) {
    grade = 'A';
    level = 'Level 2';
    pass = true;
  } else if (overall >= 80) {
    grade = 'B';
    level = 'Level 2';
    pass = true;
  } else if (overall >= 70) {
    grade = 'A';
    level = 'Level 3';
    pass = true;
  } else if (overall >= 60) {
    grade = 'B';
    level = 'Level 3';
    pass = true;
  } else {
    grade = 'C';
    level = 'Below Level 3';
    pass = false;
  }

  return { overall, grade, level, pass };
}

export function getScoreDescription(grade: string, level: string): string {
  const descriptions: Record<string, string> = {
    'Level 1-A': '🌟 Excellent! You have near-native pronunciation.',
    'Level 1-B': '⭐ Great! You can work in broadcast/media.',
    'Level 2-A': '📗 Good! You can teach Mandarin in southern China.',
    'Level 2-B': '📘 Good! Suitable for teaching Chinese.',
    'Level 3-A': '📙 Fair - Pass for civil service jobs.',
    'Level 3-B': '📕 Basic - Keep practicing.',
    'Below Level 3': '📖 Needs more practice.',
  };
  return descriptions[`${level}${grade ? '-' + grade : ''}`] || 'Keep practicing!';
}

const MockTest: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [testSection, setTestSection] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [questions, setQuestions] = useState<Question[]>(getQuestionsBySection(4));
  const [showSectionSelect, setShowSectionSelect] = useState(true);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSectionSelect = (section: 1 | 2 | 3 | 4 | 5) => {
    setTestSection(section);
    setQuestions(getQuestionsBySection(section));
    setCurrentQuestionIndex(0);
    setShowSectionSelect(false);
    setAnalysisResult(null);
    setRecordedAudio(null);
    setUploadResult(null);
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    console.log('Recording complete!', duration, 'seconds');
    setRecordedAudio({ blob, duration });
    setUploadResult(null);
    setAnalysisResult(null);
  };

  const handleUpload = async () => {
    if (!recordedAudio) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setUploadResult(null);
    setAnalysisResult(null);

    try {
      // Step 1: Upload audio
      const uploadResult = await audioService.uploadAudio(
        recordedAudio.blob,
        `recording-${Date.now()}.webm`
      );

      setUploadResult(uploadResult);

      if (!uploadResult.success || !uploadResult.url) {
        setIsAnalyzing(false);
        return;
      }

      // Step 2: Analyze audio
      console.log('Calling analyze endpoint with:', uploadResult.url, currentQuestion.content);
      
      const analyzeResponse = await fetch('http://localhost:3001/api/audio/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: uploadResult.url,
          expectedText: currentQuestion.content,
          section: testSection
        }),
      });

      const result = await analyzeResponse.json();
      console.log('Analysis result:', result);
      setAnalysisResult(result);

    } catch (error) {
      console.error('Error:', error);
      setUploadResult({ success: false, error: 'Upload or analysis failed' });
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleReRecord = () => {
    setRecordedAudio(null);
    setUploadResult(null);
    setAnalysisResult(null);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      handleReRecord();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      handleReRecord();
    }
  };

  const handleRestart = () => {
    setShowSectionSelect(true);
    setCurrentQuestionIndex(0);
    setRecordedAudio(null);
    setUploadResult(null);
    setAnalysisResult(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    return '#e74c3c';
  };

  if (showSectionSelect) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ textAlign: "center", color: COLORS.primary, marginBottom: "8px" }}>
            📝 Mock Test - Select Section
          </h1>
          <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "32px" }}>
            Choose a section to practice
          </p>

          <div style={{ display: "grid", gap: "16px" }}>
            <button
              onClick={() => handleSectionSelect(1)}
              style={{
                padding: "24px",
                fontSize: "18px",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: "bold", color: COLORS.primary }}>Section 1: Read Single Characters (读单音节字词)</div>
              <div style={{ color: COLORS.muted, marginTop: "4px" }}>📊 10% - 100 characters (tone + pronunciation)</div>
            </button>

            <button
              onClick={() => handleSectionSelect(2)}
              style={{
                padding: "24px",
                fontSize: "18px",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: "bold", color: COLORS.primary }}>Section 2: Read Words (读多音节词语)</div>
              <div style={{ color: COLORS.muted, marginTop: "4px" }}>📊 20% - 100 polysyllabic words</div>
            </button>

            <button
              onClick={() => handleSectionSelect(3)}
              style={{
                padding: "24px",
                fontSize: "18px",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: "bold", color: COLORS.primary }}>Section 3: Vocabulary & Grammar (选择判断)</div>
              <div style={{ color: COLORS.muted, marginTop: "4px" }}>📊 10% - Multiple choice</div>
            </button>

            <button
              onClick={() => handleSectionSelect(4)}
              style={{
                padding: "24px",
                fontSize: "18px",
                backgroundColor: COLORS.primary,
                border: "2px solid " + COLORS.primary,
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
                color: "white",
              }}
            >
              <div style={{ fontWeight: "bold" }}>Section 4: Reading Passage (朗读作品) ⭐</div>
              <div style={{ opacity: 0.9, marginTop: "4px" }}>📊 30% - Read 400-character passage</div>
            </button>

            <button
              onClick={() => handleSectionSelect(5)}
              style={{
                padding: "24px",
                fontSize: "18px",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: "bold", color: COLORS.primary }}>Section 5: Speaking (命题说话) 🎤</div>
              <div style={{ color: COLORS.muted, marginTop: "4px" }}>📊 30% - 3-minute speech on topic</div>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ color: COLORS.primary, marginBottom: "8px" }}>
            📝 Section {testSection} - Practice
          </h1>
          <div style={{ color: COLORS.muted }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>

        {/* Question Card */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
          <div style={{ 
            display: "inline-block", 
            padding: "4px 12px", 
            backgroundColor: "#e3f2fd", 
            borderRadius: "20px",
            color: "#1565c0",
            fontSize: "12px",
            marginBottom: "16px"
          }}>
            {currentQuestion.type === 'reading' ? '📖 Reading' : 
             currentQuestion.type === 'choice' ? '❓ Choice' : '🎤 Speaking'}
          </div>

          <div style={{
            fontSize: "28px",
            textAlign: "center",
            padding: "24px",
            backgroundColor: "#f8f9fa",
            borderRadius: "12px",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}>
            "{currentQuestion.content}"
          </div>

          {currentQuestion.pinyin && (
            <div style={{ 
              textAlign: "center", 
              color: COLORS.muted, 
              fontSize: "14px",
              marginBottom: "8px" 
            }}>
              {currentQuestion.pinyin}
            </div>
          )}

          {currentQuestion.options && (
            <div style={{ marginTop: "16px" }}>
              {currentQuestion.options.map((option, idx) => (
                <div key={idx} style={{
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}>
                  {option}
                </div>
              ))}
            </div>
          )}

          <p style={{ color: COLORS.muted, fontSize: "14px", textAlign: "center", marginTop: "16px" }}>
            {testSection === 4 ? '🎤 Read this passage aloud and record your voice' : 
             '🎤 Read this aloud and record your voice'}
          </p>
        </div>

        {/* Audio Recorder */}
        <div style={{ marginBottom: "32px" }}>
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
        </div>

        {/* Recording Result & Upload */}
        {recordedAudio && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px",
          }}>
            <h3 style={{ margin: "0 0 16px 0", color: COLORS.success }}>
              ✅ Recording Complete!
            </h3>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
              <div style={{ padding: "12px 16px", backgroundColor: "#e8f5e9", borderRadius: "8px", color: "#2e7d32" }}>
                ⏱ Duration: {recordedAudio.duration}s
              </div>
              <div style={{ padding: "12px 16px", backgroundColor: "#e3f2fd", borderRadius: "8px", color: "#1565c0" }}>
                📦 Size: {(recordedAudio.blob.size / 1024).toFixed(1)} KB
              </div>
            </div>

            {!analysisResult && (
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleUpload}
                  disabled={isUploading || isAnalyzing}
                  style={{
                    padding: "14px 28px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: isUploading || isAnalyzing ? "#95a5a6" : COLORS.success,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isUploading || isAnalyzing ? "not-allowed" : "pointer",
                  }}
                >
                  {isUploading ? "⏳ Uploading..." : isAnalyzing ? "🔄 Analyzing..." : "☁️ Upload & Analyze"}
                </button>
                <button
                  onClick={handleReRecord}
                  disabled={isUploading || isAnalyzing}
                  style={{
                    padding: "14px 28px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#95a5a6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  🔄 Re-record
                </button>
              </div>
            )}

            {uploadResult && !uploadResult.success && (
              <div style={{ marginTop: "16px", padding: "16px", borderRadius: "8px", backgroundColor: "#ffebee" }}>
                <p style={{ color: "#c62828", margin: 0 }}>
                  ❌ Upload Failed: {uploadResult.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginBottom: "24px",
          }}>
            <h3 style={{ margin: "0 0 20px 0", color: COLORS.primary }}>📊 Analysis Results</h3>

            {analysisResult.success ? (
              <>
                {/* Overall Score - PSC Style */}
                <div style={{ textAlign: "center", padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "8px" }}>PSC Score</div>
                  <div style={{ fontSize: "64px", fontWeight: "bold", color: getScoreColor(analysisResult.scores?.overall || 0) }}>
                    {Math.round(analysisResult.scores?.overall || 0)}%
                  </div>
                  <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: analysisResult.scores?.pass ? "#e8f5e9" : "#ffebee", borderRadius: "20px", color: analysisResult.scores?.pass ? "#2e7d32" : "#c62828", fontWeight: "600", marginBottom: "8px" }}>
                    {calculatePSCScore(analysisResult.scores?.overall || 0).level} - {calculatePSCScore(analysisResult.scores?.overall || 0).grade}
                  </div>
                  <div style={{ display: "block", marginTop: "8px", fontSize: "14px", color: COLORS.muted }}>
                    {getScoreDescription(
                      calculatePSCScore(analysisResult.scores?.overall || 0).grade,
                      calculatePSCScore(analysisResult.scores?.overall || 0).level
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: COLORS.muted }}>Pronunciation</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores?.pronunciation || 0) }}>
                      {Math.round(analysisResult.scores?.pronunciation || 0)}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: COLORS.muted }}>Tone</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores?.tone || 0) }}>
                      {Math.round(analysisResult.scores?.tone || 0)}
                    </div>
                  </div>
                  <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: COLORS.muted }}>Fluency</div>
                    <div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores?.fluency || 0) }}>
                      {Math.round(analysisResult.scores?.fluency || 0)}
                    </div>
                  </div>
                </div>

                {/* Transcription */}
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ margin: "0 0 8px 0", color: COLORS.primary }}>📝 Transcription</h4>
                  <div style={{ padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: COLORS.muted, fontSize: "14px" }}>Expected: </span>
                      <span>{analysisResult.expected}</span>
                    </div>
                    <div>
                      <span style={{ color: COLORS.muted, fontSize: "14px" }}>Heard: </span>
                      <span style={{ fontWeight: "bold" }}>{analysisResult.transcription || "(No transcription)"}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback */}
                {analysisResult.feedback && (
                  <div>
                    <h4 style={{ margin: "0 0 8px 0", color: COLORS.primary }}>💡 Feedback</h4>
                    <div style={{ padding: "16px", backgroundColor: "#e3f2fd", borderRadius: "8px", color: "#1565c0" }}>
                      {analysisResult.feedback}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "12px" }}>
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      backgroundColor: currentQuestionIndex === 0 ? "#e0e0e0" : COLORS.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex >= questions.length - 1}
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      backgroundColor: currentQuestionIndex >= questions.length - 1 ? "#e0e0e0" : COLORS.primary,
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: currentQuestionIndex >= questions.length - 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: "16px", backgroundColor: "#ffebee", borderRadius: "8px" }}>
                <p style={{ color: "#c62828", margin: 0 }}>
                  ❌ Analysis Failed: {analysisResult.error || "Unknown error"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={handleRestart}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              backgroundColor: "#95a5a6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            🔄 Change Section
          </button>
        </div>
      </main>
    </div>
  );
};

export default MockTest;
