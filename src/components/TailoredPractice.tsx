import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import AudioRecorder from "./AudioRecorder";
import FloatingChatButton from "./FloatingChatButton";
import { COLORS, ROUTES } from "../constants";
import { savePracticeRecord, updatePracticeRecord, TestRecord, PracticeQuestion, PracticeRecord } from "../services/testHistory";
import { tailoredPracticeService, GeneratedQuestion, audioService } from "../services/api";

interface LocationState {
  fromHistory?: boolean;
  testRecord?: TestRecord;
  weaknesses?: string[];
  strengths?: string[];
  testRecordId?: string;
  fromPracticeHistory?: boolean;
  practiceRecord?: PracticeRecord;
  focusAreas?: string[];
  practiceType?: string;
}

interface AnalysisResult {
  success: boolean;
  scores?: {
    overall: number;
    pronunciation: number;
    tone: number;
    fluency: number;
  };
  feedback?: {
    overall_assessment_en: string;
    overall_assessment_zh: string;
    key_issues?: string[];
    detailed_analysis?: string;
    improvement_tips?: string[];
  };
}

type PracticeMode = 'input' | 'generating' | 'practice' | 'complete';

const PRACTICE_CATEGORIES = [
  { id: 'tone_1', name: 'Tone 1 (High)', category: 'tone', value: 1 },
  { id: 'tone_2', name: 'Tone 2 (Rising)', category: 'tone', value: 2 },
  { id: 'tone_3', name: 'Tone 3 (Dip)', category: 'tone', value: 3 },
  { id: 'tone_4', name: 'Tone 4 (Falling)', category: 'tone', value: 4 },
  { id: 'retroflex', name: 'Retroflex (zh, ch, sh, r)', category: 'pronunciation' },
  { id: 'nasal', name: 'Nasal finals (n, ng)', category: 'pronunciation' },
  { id: 'u_vs_ü', name: 'u vs ü distinction', category: 'pronunciation' },
  { id: 'zcs_zhchsh', name: 'z/c/s vs zh/ch/sh', category: 'pronunciation' },
  { id: 'n_vs_l', name: 'n vs l distinction', category: 'pronunciation' },
  { id: 'f_vs_h', name: 'f vs h distinction', category: 'pronunciation' },
  { id: 'an_vs_ang', name: 'an vs ang', category: ' finals' },
  { id: 'en_vs_eng', name: 'en vs eng', category: ' finals' },
  { id: 'in_vs_ing', name: 'in vs ing', category: ' finals' },
  { id: 'third_tone', name: 'Third tone sandhi', category: 'tone_sandhi' },
  { id: 'neutral_tone', name: 'Neutral tone', category: 'tone_sandhi' },
  { id: 'passive_ba', name: 'Passive "ba" structure', category: 'grammar' },
  { id: 'le_structure', name: '"Le" (了) usage', category: 'grammar' },
  { id: 'classifier', name: 'Classifiers (量詞)', category: 'vocabulary' },
];

const FALLBACK_QUESTIONS: GeneratedQuestion[] = [
  { content: '中', pinyin: 'zhōng', type: 'tone', difficulty: 'easy', hint: 'Tone 1' },
  { content: '国', pinyin: 'guó', type: 'tone', difficulty: 'easy', hint: 'Tone 2' },
  { content: '人', pinyin: 'rén', type: 'tone', difficulty: 'medium', hint: 'Tone 2' },
  { content: '我', pinyin: 'wǒ', type: 'tone', difficulty: 'medium', hint: 'Tone 3' },
  { content: '是', pinyin: 'shì', type: 'tone', difficulty: 'easy', hint: 'Tone 4' },
  { content: '学', pinyin: 'xué', type: 'tone', difficulty: 'medium', hint: 'Tone 2' },
  { content: '习', pinyin: 'xí', type: 'tone', difficulty: 'medium', hint: 'Tone 2' },
  { content: '汉', pinyin: 'hàn', type: 'tone', difficulty: 'easy', hint: 'Tone 4' },
  { content: '语', pinyin: 'yǔ', type: 'tone', difficulty: 'medium', hint: 'Tone 3' },
  { content: '好', pinyin: 'hǎo', type: 'tone', difficulty: 'easy', hint: 'Tone 3' },
];

const TailoredPractice: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [mode, setMode] = useState<PracticeMode>('input');
  const [userInput, setUserInput] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [practiceScore, setPracticeScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [fromHistoryRecord, setFromHistoryRecord] = useState<TestRecord | null>(null);
  const [fromPracticeHistoryRecord, setFromPracticeHistoryRecord] = useState<PracticeRecord | null>(null);
  const [practiceType, setPracticeType] = useState<string>('custom');
  const [practiceRecordId, setPracticeRecordId] = useState<string | null>(null);

  // Audio analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [questionScores, setQuestionScores] = useState<{ score: number; feedbackEn: string; feedbackZh: string }[]>([]);

  useEffect(() => {
    if (state?.fromHistory && state.testRecord) {
      setFromHistoryRecord(state.testRecord);
      setUserInput(state.testRecord.feedbackEn || '');
      const weaknessCategories = mapWeaknessesToCategories(state.weaknesses || []);
      setSelectedCategories(weaknessCategories);
    } else if (state?.fromPracticeHistory && state.focusAreas) {
      // Handle practice from practice history - use the same focus areas
      setFromPracticeHistoryRecord(state.practiceRecord || null);
      setSelectedCategories(state.focusAreas);
      if (state.practiceType) {
        setPracticeType(`${state.practiceType.charAt(0).toUpperCase() + state.practiceType.slice(1)} Practice`);
      }
    }
  }, [state]);

  const mapWeaknessesToCategories = (weaknesses: string[]): string[] => {
    const categoryMap: Record<string, string[]> = {
      'Single Characters': ['tone_1', 'tone_2', 'tone_3', 'tone_4', 'retroflex', 'zcs_vs_zhchsh', 'nasal'],
      'Polysyllabic Words': ['tone_1', 'tone_2', 'tone_3', 'tone_4', 'third_tone', 'an_vs_ang'],
      'Vocabulary & Grammar': ['classifier', 'passive_ba', 'le_structure'],
      'Reading Passage': ['tone_1', 'tone_2', 'tone_3', 'tone_4', 'neutral_tone'],
      'Speaking': ['retroflex', 'nasal', 'n_vs_l', 'f_vs_h'],
    };

    const categories: string[] = [];
    weaknesses.forEach(w => {
      if (categoryMap[w]) {
        categories.push(...categoryMap[w]);
      }
    });
    return Array.from(new Set(categories));
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generatePractice = async () => {
    setMode('generating');

    try {
      console.log('Generating practice with params:', {
        fromHistoryRecord: !!fromHistoryRecord,
        userInput,
        selectedCategories
      });

      let result: { success: boolean; questions?: GeneratedQuestion[]; error?: string } | undefined;
      if (fromHistoryRecord) {
        result = await tailoredPracticeService.generatePractice({
          historyRecord: {
            feedbackEn: fromHistoryRecord.feedbackEn,
            feedbackZh: fromHistoryRecord.feedbackZh,
            weaknesses: fromHistoryRecord.weaknesses,
            strengths: fromHistoryRecord.strengths,
            overallScore: fromHistoryRecord.overallScore
          }
        });
        setPracticeType(`Practice from test (${fromHistoryRecord.overallScore}%)`);
      } else {
        result = await tailoredPracticeService.generatePractice({
          userInput: userInput,
          categories: selectedCategories.length > 0 ? selectedCategories : undefined
        });
        if (selectedCategories.length > 0) {
          const categoryNames = selectedCategories.map(id => {
            const cat = PRACTICE_CATEGORIES.find(c => c.id === id);
            return cat ? cat.name : id;
          }).join(', ');
          setPracticeType(categoryNames);
        } else {
          setPracticeType(userInput || 'General Practice');
        }
      }

      console.log('API result:', result);

      if (result.success && result.questions && result.questions.length > 0) {
        console.log('Using API questions:', result.questions);
        setGeneratedQuestions(result.questions);
      } else {
        console.error('API generation failed:', result.error);
        setGeneratedQuestions(FALLBACK_QUESTIONS);
        setPracticeType('General Practice (fallback)');
      }
    } catch (error) {
      console.error('Error generating practice:', error);
      setGeneratedQuestions(FALLBACK_QUESTIONS);
      setPracticeType('General Practice (fallback)');
    }

    setCurrentQuestionIndex(0);
    setPracticeScore(0);
    setQuestionsAnswered(0);
    setRecordedAudio(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setQuestionScores([]);
    setMode('practice');
  };

  const handleRecordingComplete = async (blob: Blob, duration: number) => {
    setRecordedAudio({ blob, duration });
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Upload audio to S3
      const uploadResult = await audioService.uploadAudio(blob, `practice-${Date.now()}.webm`);
      if (!uploadResult.success || !uploadResult.url) {
        setIsAnalyzing(false);
        return;
      }

      const currentQuestion = generatedQuestions[currentQuestionIndex];
      const expectedText = currentQuestion?.content || '';

      // Analyze audio
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const analyzeResponse = await fetch(`${API_URL}/api/audio/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: uploadResult.url, expectedText, section: 'practice' }),
      });
      const result = await analyzeResponse.json();
      setAnalysisResult(result);

      if (result.success && result.scores) {
        // Store the real score
        const realScore = result.scores.overall || 0;
        setQuestionScores(prev => [...prev, {
          score: realScore,
          feedbackEn: result.feedback?.overall_assessment_en || '',
          feedbackZh: result.feedback?.overall_assessment_zh || ''
        }]);
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReRecord = () => {
    setRecordedAudio(null);
    setAnalysisResult(null);
  };

  const handleNextQuestion = async () => {
    // Use real score if available, otherwise fallback to a default
    const currentQuestionScore = questionScores[questionScores.length - 1]?.score || 75;
    const newScore = practiceScore + currentQuestionScore;
    const newQuestionsAnswered = questionsAnswered + 1;

    setPracticeScore(newScore);
    setQuestionsAnswered(newQuestionsAnswered);

    // Save or update practice record after each question
    try {
      if (!practiceRecordId) {
        // First question - create the record with questions and practice type
        const practiceTypeMap: Record<string, 'tone' | 'pronunciation' | 'vocabulary' | 'fluency' | 'mixed'> = {
          'tone_1': 'tone', 'tone_2': 'tone', 'tone_3': 'tone', 'tone_4': 'tone',
          'third_tone': 'tone', 'neutral_tone': 'tone'
        };

        // Determine practice type from categories
        let determinedPracticeType: 'tone' | 'pronunciation' | 'vocabulary' | 'fluency' | 'mixed' = 'mixed';
        if (selectedCategories.length > 0) {
          const firstCat = selectedCategories[0];
          if (practiceTypeMap[firstCat]) {
            determinedPracticeType = practiceTypeMap[firstCat];
          } else if (firstCat.includes('retroflex') || firstCat.includes('nasal') || firstCat.includes('n_vs_l') || firstCat.includes('f_vs_h') || firstCat.includes('u_vs_ü') || firstCat.includes('zcs')) {
            determinedPracticeType = 'pronunciation';
          } else if (firstCat.includes('classifier') || firstCat.includes('ba') || firstCat.includes('le_structure')) {
            determinedPracticeType = 'vocabulary';
          }
        }

        const recordId = await savePracticeRecord({
          userId: '',
          practiceDate: new Date(),
          practiceType: determinedPracticeType,
          focusAreas: selectedCategories.length > 0 ? selectedCategories : ['General'],
          score: Math.round(newScore / newQuestionsAnswered),
          duration: newQuestionsAnswered * 30,
          questionsAttempted: newQuestionsAnswered,
          correctAnswers: Math.round((newScore / newQuestionsAnswered) * newQuestionsAnswered / 100),
          questions: generatedQuestions as PracticeQuestion[]
        });
        setPracticeRecordId(recordId);
      } else {
        // Subsequent questions - update the record
        const currentScore = Math.round(newScore / newQuestionsAnswered);
        await updatePracticeRecord(practiceRecordId, {
          score: currentScore,
          duration: newQuestionsAnswered * 30,
          questionsAttempted: newQuestionsAnswered,
          correctAnswers: Math.round(currentScore * newQuestionsAnswered / 100)
        });
      }
    } catch (error) {
      console.error('Error saving practice progress:', error);
    }

    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setRecordedAudio(null);
      setAnalysisResult(null);
    } else {
      setMode('complete');
    }
  };

  const handleStartOver = () => {
    setMode('input');
    setUserInput('');
    setSelectedCategories([]);
    setGeneratedQuestions([]);
    setCurrentQuestionIndex(0);
    setRecordedAudio(null);
    setPracticeScore(0);
    setQuestionsAnswered(0);
    setFromHistoryRecord(null);
    setFromPracticeHistoryRecord(null);
    setPracticeRecordId(null);
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setQuestionScores([]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    return '#e74c3c';
  };

  if (mode === 'complete') {
    // Use real scores from questionScores if available, otherwise fallback to calculated score
    const finalScore = questionScores.length > 0
      ? Math.round(questionScores.reduce((sum, q) => sum + q.score, 0) / questionScores.length)
      : Math.round(practiceScore / questionsAnswered);

    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <main style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ color: COLORS.primary, marginBottom: "8px" }}>Practice Complete!</h2>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: getScoreColor(finalScore), marginBottom: "16px" }}>
              {finalScore}%
            </div>
            <p style={{ color: COLORS.muted, marginBottom: "24px" }}>
              You completed {questionsAnswered} questions in this session
            </p>

            {/* Show summary of all question scores if available */}
            {questionScores.length > 0 && (
              <div style={{ textAlign: "left", marginBottom: "24px", backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
                <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "12px" }}>Question Summary</div>
                {questionScores.map((q, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < questionScores.length - 1 ? "1px solid #eee" : "none" }}>
                    <span style={{ fontSize: "14px", color: "#555" }}>Q{idx + 1}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: getScoreColor(q.score) }}>{q.score}%</span>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "32px", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px" }}>
              Focus: {practiceType}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={handleStartOver}
                style={{ padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: COLORS.secondary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
              >
                Practice Again
              </button>
              <button
                onClick={() => navigate(ROUTES.HISTORY)}
                style={{ padding: "12px 24px", fontSize: "14px", fontWeight: "600", backgroundColor: "white", color: COLORS.primary, border: `2px solid ${COLORS.primary}`, borderRadius: "8px", cursor: "pointer" }}
              >
                View History
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (mode === 'practice' && generatedQuestions.length > 0) {
    const currentQuestion = generatedQuestions[currentQuestionIndex];

    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <FloatingChatButton />
        <main style={{ padding: "24px 20px", maxWidth: "700px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <button
              onClick={() => setMode('input')}
              style={{ padding: "8px 16px", fontSize: "14px", backgroundColor: "white", border: "1px solid #e0e0e0", borderRadius: "8px", cursor: "pointer" }}
            >
              ← Exit
            </button>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "600", color: COLORS.primary }}>Tailored Practice</div>
              <div style={{ fontSize: "14px", color: COLORS.muted }}>Question {currentQuestionIndex + 1} of {generatedQuestions.length}</div>
            </div>
            <div style={{ width: "70px" }}></div>
          </div>

          <div style={{ height: "4px", backgroundColor: "#e0e0e0", borderRadius: "2px", marginBottom: "24px" }}>
            <div style={{ height: "100%", backgroundColor: COLORS.secondary, borderRadius: "2px", width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%`, transition: "width 0.3s ease" }} />
          </div>

          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px", textAlign: "center", marginBottom: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>🎤</div>
            <div style={{ fontSize: "48px", fontWeight: "bold", color: COLORS.primary, marginBottom: "16px" }}>
              {currentQuestion?.content || '字'}
            </div>
            {currentQuestion?.pinyin && (
              <div style={{ fontSize: "18px", color: COLORS.muted, marginBottom: "8px" }}>
                {currentQuestion.pinyin}
              </div>
            )}
            {currentQuestion?.hint && (
              <div style={{ fontSize: "14px", color: COLORS.muted, marginTop: "8px", backgroundColor: "#f8f9fa", padding: "8px 16px", borderRadius: "8px", display: "inline-block" }}>
                💡 {currentQuestion.hint}
              </div>
            )}
            <div style={{ fontSize: "14px", color: COLORS.muted, marginTop: "16px", backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px", display: "inline-block" }}>
              Focus: {practiceType}
            </div>
          </div>

          {!recordedAudio ? (
            <div style={{ textAlign: "center" }}>
              <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={30} />
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              {isAnalyzing ? (
                <div style={{ padding: "32px", backgroundColor: "#fff3e0", borderRadius: "12px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔄</div>
                  <div style={{ color: "#e65100", fontWeight: "600", marginBottom: "8px" }}>Analyzing your pronunciation...</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>This may take a few seconds</div>
                </div>
              ) : analysisResult?.success && analysisResult.scores ? (
                <div style={{ textAlign: "left", maxWidth: "500px", margin: "0 auto" }}>
                  {/* Score Display */}
                  <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: `2px solid ${getScoreColor(analysisResult.scores.overall)}` }}>
                    <div style={{ textAlign: "center", marginBottom: "16px" }}>
                      <div style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "4px" }}>Your Score</div>
                      <div style={{ fontSize: "48px", fontWeight: "bold", color: getScoreColor(analysisResult.scores.overall) }}>
                        {analysisResult.scores.overall}%
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-around", borderTop: "1px solid #eee", paddingTop: "16px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: COLORS.muted }}>Pronunciation</div>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: getScoreColor(analysisResult.scores.pronunciation) }}>{analysisResult.scores.pronunciation}%</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: COLORS.muted }}>Tone</div>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: getScoreColor(analysisResult.scores.tone) }}>{analysisResult.scores.tone}%</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "12px", color: COLORS.muted }}>Fluency</div>
                        <div style={{ fontSize: "18px", fontWeight: "600", color: getScoreColor(analysisResult.scores.fluency) }}>{analysisResult.scores.fluency}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback */}
                  {analysisResult.feedback && (
                    <div style={{ backgroundColor: "#e3f2fd", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
                      <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "12px" }}>Feedback / 反馈</div>
                      {analysisResult.feedback.overall_assessment_en && (
                        <div style={{ fontSize: "14px", color: "#1565c0", marginBottom: "8px", whiteSpace: "pre-wrap" }}>{analysisResult.feedback.overall_assessment_en}</div>
                      )}
                      {analysisResult.feedback.overall_assessment_zh && (
                        <div style={{ fontSize: "14px", color: "#1565c0", whiteSpace: "pre-wrap" }}>{analysisResult.feedback.overall_assessment_zh}</div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleReRecord}
                    style={{ padding: "10px 20px", fontSize: "14px", fontWeight: "600", backgroundColor: "white", color: COLORS.primary, border: `2px solid ${COLORS.primary}`, borderRadius: "8px", cursor: "pointer", marginRight: "12px" }}
                  >
                    🔄 Re-record
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    style={{ padding: "14px 32px", fontSize: "16px", fontWeight: "600", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    {currentQuestionIndex < generatedQuestions.length - 1 ? "Next Question →" : "Complete Practice"}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ padding: "16px", backgroundColor: "#e8f5e9", borderRadius: "8px", marginBottom: "16px", display: "inline-block" }}>
                    <span style={{ color: "#2e7d32", fontWeight: "600" }}>✓ Recording captured!</span>
                  </div>
                  <br />
                  <button
                    onClick={handleNextQuestion}
                    style={{ padding: "14px 32px", fontSize: "16px", fontWeight: "600", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}
                  >
                    {currentQuestionIndex < generatedQuestions.length - 1 ? "Next Question →" : "Complete Practice"}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (mode === 'generating') {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>⚙️</div>
            <h2 style={{ color: COLORS.primary, marginBottom: "8px" }}>Generating Your Practice...</h2>
            <p style={{ color: COLORS.muted }}>Analyzing your requirements and preparing questions</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: COLORS.primary, marginBottom: "8px", fontSize: "28px" }}>🎯 Tailored Practice</h1>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "32px" }}>Describe what you want to practice, or select categories below</p>

        {fromHistoryRecord && (
          <div style={{ backgroundColor: "#e3f2fd", borderRadius: "12px", padding: "16px", marginBottom: "24px", borderLeft: `4px solid ${COLORS.secondary}` }}>
            <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>Based on your previous test:</div>
            <div style={{ fontSize: "14px", color: "#555", marginBottom: "8px" }}>{fromHistoryRecord.feedbackEn}</div>
            <div style={{ fontSize: "13px", color: COLORS.muted }}>
              Weak areas: {fromHistoryRecord.weaknesses.join(', ')}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <label style={{ display: "block", fontWeight: "600", color: COLORS.primary, marginBottom: "12px" }}>
            What would you like to practice?
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., I want to practice third tone sandhi, or I need to improve my retroflex sounds..."
            style={{
              width: "100%",
              minHeight: "120px",
              padding: "12px",
              fontSize: "14px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", marginBottom: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <label style={{ display: "block", fontWeight: "600", color: COLORS.primary, marginBottom: "12px" }}>
            Or select specific areas to focus on:
          </label>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: COLORS.secondary, marginBottom: "8px" }}>Tones</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PRACTICE_CATEGORIES.filter(c => c.category === 'tone').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "13px",
                    backgroundColor: selectedCategories.includes(cat.id) ? COLORS.secondary : "#f8f9fa",
                    color: selectedCategories.includes(cat.id) ? "white" : COLORS.primary,
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: COLORS.secondary, marginBottom: "8px" }}>Pronunciation</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PRACTICE_CATEGORIES.filter(c => c.category === 'pronunciation').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "13px",
                    backgroundColor: selectedCategories.includes(cat.id) ? COLORS.secondary : "#f8f9fa",
                    color: selectedCategories.includes(cat.id) ? "white" : COLORS.primary,
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: COLORS.secondary, marginBottom: "8px" }}>Grammar & Vocabulary</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {PRACTICE_CATEGORIES.filter(c => c.category === 'grammar' || c.category === 'vocabulary').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    padding: "8px 14px",
                    fontSize: "13px",
                    backgroundColor: selectedCategories.includes(cat.id) ? COLORS.secondary : "#f8f9fa",
                    color: selectedCategories.includes(cat.id) ? "white" : COLORS.primary,
                    border: "none",
                    borderRadius: "20px",
                    cursor: "pointer",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={generatePractice}
            disabled={!userInput && selectedCategories.length === 0}
            style={{
              padding: "16px 48px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: (userInput || selectedCategories.length > 0) ? COLORS.secondary : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: (userInput || selectedCategories.length > 0) ? "pointer" : "not-allowed",
              boxShadow: (userInput || selectedCategories.length > 0) ? "0 4px 12px rgba(231,76,60,0.3)" : "none",
            }}
          >
            🚀 Generate Practice Set
          </button>
          <p style={{ fontSize: "13px", color: COLORS.muted, marginTop: "12px" }}>
            {userInput || selectedCategories.length > 0
              ? "Click to generate a personalized practice set"
              : "Enter what you want to practice or select categories above"}
          </p>
        </div>
      </main>
    </div>
  );
};

export default TailoredPractice;
