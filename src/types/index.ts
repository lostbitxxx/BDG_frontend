// Shared TypeScript types for frontend

export interface User {
  _id: string;
  email: string;
  username: string;
  character: 'red-birdie' | 'foggy-birdie' | 'final-birdie';
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
  /** Affinity from backend (login/verify may return these) */
  affinityXp?: number;
  affinityLevel?: number;
}

export interface ChatResponse {
  audioBase64?: string;
  success: boolean;
  response: string;
  timestamp: string;
  error?: string;
}

// ============================================================================
// PRONUNCIATION ANALYSIS TYPES
// ============================================================================

export type ErrorCategory =
  | 'initial_error'
  | 'final_error'
  | 'tone_error'
  | 'neutral_tone_error'
  | 'tone_sandhi_error'
  | 'stress_error'
  | 'rhythm_error'
  | 'pause_error'
  | 'omission'
  | 'addition'
  | 'none';

export type ErrorSeverity = 'error' | 'defect' | 'minor_defect';

export interface PronunciationError {
  character: string;
  position: number;
  category: ErrorCategory;
  expected_pinyin: string;
  expected_tone: number;
  expected_initial: string;
  expected_final: string;
  actual_pinyin: string;
  actual_tone: number;
  actual_initial: string;
  actual_final: string;
  severity: ErrorSeverity;
  psc_impact: number;
  detection_method: string;
  confidence: number;
  error_code: string;
  description_en: string;
  description_zh: string;
  fix_tip_en: string;
  fix_tip_zh: string;
  practice_words: string[];
}

export interface CharacterResult {
  position: number;
  character: string;
  expected_pinyin: string;
  actual_pinyin: string;
  expected_tone: number;
  actual_tone: number;
  expected_initial: string;
  actual_initial: string;
  expected_final: string;
  actual_final: string;
  status: 'pending' | 'correct' | 'error' | 'defect';
  errors: PronunciationError[];
}

export interface ErrorSummary {
  total_errors: number;
  total_defects: number;
  by_category: Record<ErrorCategory, number>;
  by_initial: Record<string, number>;
  by_final: Record<string, number>;
  by_tone: Record<string, number>;
  total_psc_impact: number;
}

export interface PracticeRecommendations {
  focus_areas_en: string[];
  focus_areas_zh: string[];
  exercises_en: string[];
  exercises_zh: string[];
  daily_duration_en: string;
  daily_duration_zh: string;
}

export interface CharacterAnalysis {
  character: string;
  position: number;
  expected_pinyin: string;
  expected_tone: number;
  expected_initial: string;  // Consonant/声母
  expected_final: string;   // Vowel/韵母
  actual_pinyin: string;
  actual_tone: number;
  actual_initial: string;   // Consonant/声母
  actual_final: string;     // Vowel/韵母
  status: 'correct' | 'error' | 'defect';
  error_type: ErrorCategory | 'none';
  feedback_en: string;      // MUST include TONE, CONSONANT, VOWEL details
  feedback_zh: string;     // MUST include 声调、声母、韵母 details
  fix_tip_en: string;
  fix_tip_zh: string;
  practice_words: string[];
}

export interface ToneAnalysis {
  total_tones: number;
  correct_tones: number;
  tone_accuracy: string;
  common_errors: string[];
}

export interface PhonemeAnalysis {
  initial_errors: string[];
  final_errors: string[];
  consonant_issues: string[];
  vowel_issues: string[];
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  section: 1 | 2 | 3 | 4 | 5;
  expected_text: string;
  transcription: string;
  character_results: CharacterResult[];
  errors: PronunciationError[];
  scores: {
    overall: number;
    pronunciation: number;
    tone: number;
    fluency: number;
  };
  psc_level: string;
  psc_grade: string;
  pass: boolean;
  feedback: {
    overall_assessment_en: string;
    overall_assessment_zh: string;
    character_analysis: CharacterAnalysis[];
    error_summary: ErrorSummary;
    practice_recommendations: PracticeRecommendations;
    encouragement_en: string;
    encouragement_zh: string;
    tone_analysis?: ToneAnalysis;
    phoneme_analysis?: PhonemeAnalysis;
  };
}