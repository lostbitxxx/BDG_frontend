import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";
import AudioRecorder from "./AudioRecorder";
import { audioService, startTest, completeTest, type CompleteTestPayload } from "../services/api";
import { getQuestionsBySection, Question } from "../data/questions";
import { COLORS, ROUTES, API_BASE_URL } from "../constants";
import { saveTestRecord, analyzeStrengthsWeaknesses, TestSectionScore } from "../services/testHistory";
import { useCharacter } from "../context/CharacterContext";
import { auth } from "../lib/firebase";

// PSC Section Time Limits (in seconds)
const SECTION_TIME_LIMITS: Record<number, number> = {
  1: 180,  // 3 minutes
  2: 180,  // 3 minutes
  3: 300,  // 5 minutes
  4: 240,  // 4 minutes
  5: 180,  // 3 minutes
};

// PSC Section Info (fallback when API not used)
const SECTIONS = [
  { id: 1, title: "Section 1: Single Characters", description: "100 characters - test basic syllables", timeLimit: "3 min", scoreWeight: "10%", icon: "📝" },
  { id: 2, title: "Section 2: Polysyllabic Words", description: "100 words - focus on tones", timeLimit: "3 min", scoreWeight: "20%", icon: "📖" },
  { id: 3, title: "Section 3: Vocabulary & Grammar", description: "Word judgment, classifiers, grammar", timeLimit: "5 min", scoreWeight: "10%", icon: "❓" },
  { id: 4, title: "Section 4: Reading Passage", description: "Read 400-character passage", timeLimit: "4 min", scoreWeight: "30%", icon: "📄" },
  { id: 5, title: "Section 5: Speaking Topic", description: "3-minute speech on topic", timeLimit: "3 min", scoreWeight: "30%", icon: "🎤" },
];

// GET /api/test/sections response (backend)
export interface TestSectionInfo {
  section: number;
  name: string;
  nameEn: string;
  timeLimit: number;
}

const TOTAL_SECTIONS = 5;

async function fetchTestSections(): Promise<TestSectionInfo[]> {
  try {
    const base = API_BASE_URL.replace(/\/api\/?$/, "") || "";
    const url = base ? `${base}/api/test/sections` : "/api/test/sections";
    const res = await fetch(url);
    const data = await res.json();
    if (data?.success && Array.isArray(data.sections) && data.sections.length > 0) {
      return data.sections;
    }
  } catch (_) {
    // ignore
  }
  return [];
}

// PSC Testing Rules
const TEST_RULES = [
  "Read each question/prompt clearly and at a natural pace",
  "For reading sections (1, 2, 4): read the characters/words/passage aloud",
  "For vocabulary & grammar (Section 3): select the correct answer and read it aloud",
  "For speaking (Section 5): speak continuously for at least 3 minutes on the given topic",
  "Follow the time limits for each section",
  "Pronunciation errors will be penalized based on severity",
  "Tone errors are particularly important in scoring",
  "You can pause between questions but the timer continues"
];

// PSC Scoring Levels
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

  if (overall >= 97) { grade = 'A'; level = 'Level 1'; pass = true; }
  else if (overall >= 92) { grade = 'B'; level = 'Level 1'; pass = true; }
  else if (overall >= 87) { grade = 'A'; level = 'Level 2'; pass = true; }
  else if (overall >= 80) { grade = 'B'; level = 'Level 2'; pass = true; }
  else if (overall >= 70) { grade = 'A'; level = 'Level 3'; pass = true; }
  else if (overall >= 60) { grade = 'B'; level = 'Level 3'; pass = true; }
  else { grade = 'C'; level = 'Below Level 3'; pass = false; }

  return { overall, grade, level, pass };
}

export function getScoreDescription(grade: string, level: string): string {
  const descriptions: Record<string, string> = {
    'Level 1-A': 'Excellent! You have near-native pronunciation.', 'Level 1-B': 'Great! You can work in broadcast/media.',
    'Level 2-A': 'Good! You can teach Mandarin in southern China.', 'Level 2-B': 'Good! suitable for teaching Chinese.',
    'Level 3-A': 'Fair - Pass for civil service jobs.', 'Level 3-B': 'Basic - Keep practicing.',
    'Below Level 3': 'Needs more practice.',
  };
  return descriptions[`${level}${grade ? '-' + grade : ''}`] || 'Keep practicing!';
}

// GPA bands (match backend): 90+ A, 85-89 B+, 80-84 B, 70-79 C+, 60-69 C, <60 D
type GPAGrade = 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
const SCORE_PERCENT_TO_GRADE: { min: number; grade: GPAGrade }[] = [
  { min: 90, grade: 'A' },
  { min: 85, grade: 'B+' },
  { min: 80, grade: 'B' },
  { min: 70, grade: 'C+' },
  { min: 60, grade: 'C' },
  { min: 0, grade: 'D' },
];
const GRADE_TO_GPA: Record<GPAGrade, number> = { A: 4, 'B+': 3, B: 2.5, 'C+': 2.3, C: 2, D: 1 };

function scorePercentToGrade(percent: number): GPAGrade {
  const row = SCORE_PERCENT_TO_GRADE.find((r) => percent >= r.min);
  return row?.grade ?? 'D';
}

function gradeToGPA(grade: GPAGrade): number {
  return GRADE_TO_GPA[grade] ?? 1;
}

// Full Test Component - Left side
const FullTest: React.FC<{
  onStartSection: (section: 1 | 2 | 3 | 4 | 5) => void;
  onStartFullTest: () => void;
}> = ({ onStartFullTest }) => {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
        <h2 style={{ margin: "0 0 8px 0", color: COLORS.primary }}>Full PSC Mock Test</h2>
        <p style={{ color: COLORS.muted, marginBottom: "24px" }}>Complete all 5 sections in one session</p>

        <button
          onClick={onStartFullTest}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: COLORS.primary,
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            marginBottom: "24px",
          }}
        >
          Start Full Test (All 5 Sections)
        </button>

        {/* Progress through sections */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                padding: "16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>{section.icon}</div>
              <div style={{ fontWeight: "600", color: COLORS.primary, fontSize: "14px" }}>{section.title}</div>
              <div style={{ fontSize: "12px", color: COLORS.muted }}>{section.scoreWeight}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Section Practice Component - Right side (equal size)
const SectionPractice: React.FC<{
  onSelectSection: (section: 1 | 2 | 3 | 4 | 5) => void;
}> = ({ onSelectSection }) => {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "100%" }}>
        <h3 style={{ margin: "0 0 16px 0", color: COLORS.primary }}>Practice by Section</h3>
        <p style={{ color: COLORS.muted, fontSize: "14px", marginBottom: "20px" }}>Focus on specific areas</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id as 1 | 2 | 3 | 4 | 5)}
              style={{
                padding: "16px",
                fontSize: "14px",
                backgroundColor: "white",
                border: "2px solid #e0e0e0",
                borderRadius: "12px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = COLORS.secondary; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>{section.icon}</span>
                <div>
                  <div style={{ fontWeight: "600", color: COLORS.primary }}>{section.title}</div>
                  <div style={{ fontSize: "12px", color: COLORS.muted }}>{section.timeLimit} • {section.scoreWeight}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// PSC Detailed Information for each section
const SECTION_DETAILS = [
  {
    id: 1,
    title: "Section 1: Single Characters",
    description: "Read 100 single characters",
    content: "You will read 100 single Chinese characters. Each character will be shown on screen. Read each character clearly and at a natural pace. Pay attention to correct pronunciation and tone.",
    scoring: "Each character is worth 0.1 point. Total: 10 points.",
    tips: ["Focus on accurate tones", "Maintain natural pace", "Pronounce each character clearly"]
  },
  {
    id: 2,
    title: "Section 2: Polysyllabic Words",
    description: "Read 100 polysyllabic words",
    content: "You will read 100 two-syllable words. The words are randomly selected from the PSC vocabulary list (表一 and 表二, 70% from 表一, 30% from 表二). Focus on tone pairs and tone sandhi.",
    scoring: "Each word is worth 0.2 points. Total: 20 points.",
    tips: ["Watch for tone changes in tone pairs", "Pay attention to third tone sandhi", "Distinguish similar tones"]
  },
  {
    id: 3,
    title: "Section 3: Vocabulary & Grammar",
    description: "Word judgment, quantity words, grammar",
    content: "This section has 3 parts: (1) Judge if two words have the same pronunciation, (2) Choose the correct quantity words/classifiers, (3) Complete grammar sentences.",
    scoring: "Approximately 25 questions. Total: 10 points.",
    tips: ["Listen carefully to pronunciation differences", "Know common classifier usage", "Review basic Mandarin grammar patterns"]
  },
  {
    id: 4,
    title: "Section 4: Reading Passage",
    description: "Read one 400-character passage",
    content: "You will read one passage of approximately 400 characters. Read fluently with proper punctuation pauses. The passage will be shown on screen.",
    scoring: "The passage is worth 30 points. 30% pronunciation, 40% tone, 30% fluency.",
    tips: ["Read at a steady pace", "Pause at punctuation marks", "Maintain consistent tone throughout"]
  },
  {
    id: 5,
    title: "Section 5: Speaking",
    description: "3-minute speech on given topic",
    content: "You will be given a topic and must speak continuously for at least 3 minutes. Speak spontaneously about the topic provided.",
    scoring: "Worth 30 points. Graded on pronunciation, tone, fluency, and content relevance.",
    tips: ["Plan your speech structure", "Speak continuously for 3 minutes", "Stay on topic"]
  }
];

// Rules Modal Component
const RulesModal: React.FC<{
  onAccept: () => void;
  onCancel: () => void;
  sectionId?: number | null;
  isFullTest?: boolean;
}> = ({ onAccept, onCancel, sectionId, isFullTest }) => {
  const section = sectionId ? SECTION_DETAILS.find(s => s.id === sectionId) : null;

  // If it's full test, show all sections overview
  if (isFullTest) {
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "700px",
          maxHeight: "85vh",
          overflow: "auto",
          margin: "20px",
        }}>
          <h2 style={{ margin: "0 0 8px 0", color: COLORS.primary, textAlign: "center" }}>PSC Mock Test - Full Exam</h2>
          <p style={{ color: COLORS.muted, marginBottom: "24px", textAlign: "center" }}>Complete all 5 sections in one session. Total time: approximately 18 minutes.</p>

          <div style={{ marginBottom: "24px" }}>
            {SECTION_DETAILS.map((sec, idx) => (
              <div key={sec.id} style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "12px",
                borderLeft: `4px solid ${COLORS.secondary}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontWeight: "600", color: COLORS.primary }}>{sec.title}</div>
                  <div style={{ fontSize: "12px", color: COLORS.muted, backgroundColor: "white", padding: "4px 8px", borderRadius: "4px" }}>{sec.scoring.split('.')[0]}</div>
                </div>
                <div style={{ fontSize: "13px", color: "#555", marginBottom: "8px" }}>{sec.description}</div>
                <div style={{ fontSize: "12px", color: COLORS.muted }}>
                  <strong>Tips:</strong> {sec.tips.join(" • ")}
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: "#e3f2fd", borderRadius: "8px", padding: "16px", marginBottom: "24px" }}>
            <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>Testing Process:</div>
            <div style={{ fontSize: "13px", color: "#555", lineHeight: "1.6" }}>
              {TEST_RULES.map((rule, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ color: COLORS.secondary, fontWeight: "bold" }}>•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={onCancel}
              style={{
                padding: "12px 32px",
                fontSize: "14px",
                backgroundColor: "#f8f9fa",
                color: COLORS.muted,
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              style={{
                padding: "12px 32px",
                fontSize: "14px",
                backgroundColor: COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              I Understand - Start Full Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If it's a specific section practice
  if (section) {
    return (
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}>
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "600px",
          maxHeight: "85vh",
          overflow: "auto",
          margin: "20px",
        }}>
          <h2 style={{ margin: "0 0 8px 0", color: COLORS.primary }}>{section.title}</h2>
          <p style={{ color: COLORS.muted, marginBottom: "24px" }}>{section.description}</p>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "12px" }}>What to Expect:</div>
            <div style={{ fontSize: "14px", color: "#555", lineHeight: "1.7", backgroundColor: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
              {section.content}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>Scoring:</div>
            <div style={{ fontSize: "14px", color: "#555", backgroundColor: "#e3f2fd", padding: "12px", borderRadius: "8px" }}>
              {section.scoring}
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>Tips for This Section:</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {section.tips.map((tip, idx) => (
                <div key={idx} style={{
                  backgroundColor: "#fff3e0",
                  color: "#e65100",
                  padding: "8px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={onCancel}
              style={{
                padding: "12px 32px",
                fontSize: "14px",
                backgroundColor: "#f8f9fa",
                color: COLORS.muted,
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              style={{
                padding: "12px 32px",
                fontSize: "14px",
                backgroundColor: COLORS.primary,
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              I Understand - Start Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default rules view
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "32px",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflow: "auto",
        margin: "20px",
      }}>
        <h2 style={{ margin: "0 0 16px 0", color: COLORS.primary }}>PSC Mock Test Guidelines</h2>
        <p style={{ color: COLORS.muted, marginBottom: "24px" }}>Please read the following instructions carefully before starting:</p>

        <div style={{ marginBottom: "24px" }}>
          {TEST_RULES.map((rule, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                width: "24px", height: "24px",
                borderRadius: "50%",
                backgroundColor: "#e3f2fd",
                color: COLORS.secondary,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "bold", flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ color: "#333", fontSize: "14px", lineHeight: "1.5" }}>{rule}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "12px 32px",
              fontSize: "14px",
              backgroundColor: "#f8f9fa",
              color: COLORS.muted,
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            style={{
              padding: "12px 32px",
              fontSize: "14px",
              backgroundColor: COLORS.primary,
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            I Understand - Start Test
          </button>
        </div>
      </div>
    </div>
  );
};

// Full test: section result for summary (grade + gpa per section)
export type FullTestSectionResult = { grade: string; gpa: number };

// Summary page after completing a full test (all 5 sections)
const FullTestSummary: React.FC<{
  sectionResults: Record<number, FullTestSectionResult>;
  sectionList: TestSectionInfo[] | null;
  onBack: () => void;
}> = ({ sectionResults, sectionList, onBack }) => {
  const sectionIds = [1, 2, 3, 4, 5] as const;
  const completed = sectionIds.filter((id) => sectionResults[id]);
  const testGPA =
    completed.length > 0
      ? completed.reduce((sum, id) => sum + sectionResults[id].gpa, 0) / completed.length
      : 0;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "24px 20px", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", color: COLORS.primary, marginBottom: "8px" }}>Test complete</h2>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "24px" }}>Full PSC mock test summary</p>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
          <div style={{ fontSize: "14px", color: COLORS.muted, marginBottom: "4px" }}>Test GPA</div>
          <div style={{ fontSize: "48px", fontWeight: "bold", color: COLORS.primary }}>{testGPA.toFixed(1)}</div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", color: COLORS.primary, fontSize: "16px" }}>Section results</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {sectionIds.map((id) => {
              const result = sectionResults[id];
              const apiInfo = sectionList?.find((s) => s.section === id);
              const fallbackInfo = SECTIONS.find((s) => s.id === id);
              const label = apiInfo ? apiInfo.nameEn : fallbackInfo ? fallbackInfo.title : `Section ${id}`;
              return (
                <div key={id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                  <span style={{ fontWeight: "500", color: COLORS.primary }}>{label}</span>
                  {result ? (
                    <span style={{ fontWeight: "600", color: COLORS.secondary }}>{result.grade} ({result.gpa.toFixed(1)})</span>
                  ) : (
                    <span style={{ color: COLORS.muted, fontSize: "14px" }}>Not completed</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <button type="button" onClick={onBack} style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
            Back to test
          </button>
        </div>
      </main>
    </div>
  );
};

// Question Page Component - The detailed recording interface
const QuestionPage: React.FC<{
  section: number;
  questions: Question[];
  onBack: () => void;
  isFullTest?: boolean;
  onNextSection?: (currentSection: number) => void;
  onSectionComplete?: (section: number, data: FullTestSectionResult) => void;
  onCompleteTest?: (payload: CompleteTestPayload) => void;
  sessionId?: string | null;
  sectionList?: TestSectionInfo[] | null;
  totalSections?: number;
}> = ({ section, questions, onBack, isFullTest, onNextSection, onSectionComplete, onCompleteTest, sessionId, sectionList, totalSections = 5 }) => {
  const { character, setAffinityFromBackend } = useCharacter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; duration: number } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const apiSection = sectionList?.find((s) => s.section === section);
  const timeLimit = apiSection?.timeLimit ?? SECTION_TIME_LIMITS[section];
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSectionMode = section === 1 || section === 2;
  const currentQ = questions[currentQuestionIndex];

  // Report section grade/GPA to parent for full-test summary when analysis succeeds; for section practice, call backend complete
  useEffect(() => {
    if (!analysisResult?.success) return;
    const grades = analysisResult.sectionGrades as Record<number, string> | undefined;
    const gpas = analysisResult.sectionGPAs as Record<number, number> | undefined;
    const grade = grades?.[section];
    const gpa = gpas?.[section];
    if (grade != null && gpa != null) {
      onSectionComplete?.(section, { grade, gpa: Number(gpa) });
      if (!isFullTest && sessionId && onCompleteTest) {
        const scores = analysisResult.scores as { overall?: number; pass?: boolean } | undefined;
        const overall = Number(scores?.overall) ?? 0;
        const scoreData = calculatePSCScore(overall);
        onCompleteTest({
          type: 'partial',
          partialSection: section,
          totalScore: overall,
          testGPA: Number(gpa),
          level: scoreData.level,
          grade: scoreData.grade,
          pass: scoreData.pass,
          sectionGrades: { [String(section)]: grade },
          sectionGPAs: { [String(section)]: Number(gpa) },
          completedSections: [section],
        });
      }
    }
  }, [analysisResult, section, isFullTest, sessionId, onSectionComplete, onCompleteTest]);

  useEffect(() => {
    if (isTimerRunning && !recordedAudio) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= timeLimit) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsTimerRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, recordedAudio, timeLimit]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedAudio({ blob, duration });
    setIsTimerRunning(false);
  };

  const handleRecordingStart = () => {
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  const handleUpload = async () => {
    if (!recordedAudio) return;
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      const uploadResult = await audioService.uploadAudio(recordedAudio.blob, `recording-${Date.now()}.webm`);
      if (!uploadResult.success || !uploadResult.url) {
        setIsUploading(false);
        setIsAnalyzing(false);
        return;
      }

      const expectedText = questions.map(q => q.content).join(' ');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      try {
        const firebaseUser = auth?.currentUser ?? null;
        if (firebaseUser) {
          const idToken = await firebaseUser.getIdToken();
          if (idToken) headers['Authorization'] = `Bearer ${idToken}`;
        }
      } catch (_) {
        // Firebase not ready or no ID token; continue without auth so analyze still runs
      }
      const fallbackToken = localStorage.getItem('token');
      if (!headers['Authorization'] && fallbackToken) headers['Authorization'] = `Bearer ${fallbackToken}`;

      const origin = API_BASE_URL.replace(/\/api\/?$/, '') || '';
      const analyzeUrl = origin ? `${origin}/api/audio/analyze` : '/api/audio/analyze';
      const analyzeResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ audioUrl: uploadResult.url, expectedText, section }),
      });
      const text = await analyzeResponse.text();
      let result: Record<string, unknown>;
      try {
        result = JSON.parse(text) as Record<string, unknown>;
      } catch {
        result = {
          success: false,
          code: 'audio_cannot_be_processed',
          error: analyzeResponse.status === 404
            ? 'Analyze endpoint not found. Check that the backend is running and the URL is correct.'
            : `Request failed (${analyzeResponse.status})`,
        };
      }
      // Non-2xx: treat as analysis failure and ensure stable shape for error UI (code + error)
      if (!analyzeResponse.ok) {
        result = {
          ...result,
          success: false,
          code: (result.code as string) || 'audio_cannot_be_processed',
          error: (result.error as string) || `Request failed (${analyzeResponse.status})`,
        };
      }
      // Ensure GPA is always available after each test: use backend values or derive from section score
      const hasGPAFromBackend = result.testGPA != null || (result.sectionGPAs && typeof result.sectionGPAs === 'object' && Object.keys(result.sectionGPAs as object).length > 0);
      if (!hasGPAFromBackend && result.success && section != null) {
        const scores = result.scores as { overall?: number } | undefined;
        const overall = scores?.overall;
        if (typeof overall === 'number') {
          const grade = scorePercentToGrade(overall);
          const gpa = gradeToGPA(grade);
          result = {
            ...result,
            sectionGrades: { ...(result.sectionGrades as object || {}), [section]: grade },
            sectionGPAs: { ...(result.sectionGPAs as object || {}), [section]: gpa },
            testGPA: gpa,
          };
        }
      }
      setAnalysisResult(result);

      // Update affinity/XP from backend response so UI shows new level
      const raw = (result.affinityLevel != null || result.affinityXp != null
        ? result
        : result.affinity && typeof result.affinity === 'object'
          ? result.affinity
          : result.data && typeof result.data === 'object'
            ? result.data
            : null) as Record<string, unknown> | null;
      if (raw && (raw.affinityLevel !== undefined || raw.affinity_level !== undefined || raw.affinityXp !== undefined || raw.affinity_xp !== undefined)) {
        const level = Number(raw.affinityLevel ?? raw.affinity_level ?? raw.level ?? 1);
        const xp = Number(raw.affinityXp ?? raw.affinity_xp ?? raw.xp ?? 0);
        const xpInLevel = raw.affinityXpCurrentLevel ?? raw.affinity_xp_current_level ?? raw.xpInLevel;
        const xpNeeded = raw.affinityXpNeededForLevel ?? raw.affinity_xp_needed_for_level ?? raw.xpPerLevel;
        setAffinityFromBackend(character, {
          affinityXp: xp,
          affinityLevel: Math.max(1, level),
          ...(xpInLevel != null && { affinityXpCurrentLevel: Number(xpInLevel) }),
          ...(xpNeeded != null && { affinityXpNeededForLevel: Number(xpNeeded) }),
        });
      }

      // Save test result to Firestore
      const scores = result.scores as { overall?: number } | undefined;
      if (result.success && scores) {
        const overall = Number(scores.overall) || 0;
        const scoreData = calculatePSCScore(overall);

        const sectionScores: TestSectionScore[] = [
          {
            sectionId: section,
            sectionName: SECTIONS.find(s => s.id === section)?.title || `Section ${section}`,
            score: overall,
            grade: scoreData.grade
          }
        ];

        const { strengths, weaknesses } = analyzeStrengthsWeaknesses(sectionScores);

        const feedback = result.feedback as { overall_assessment_en?: string; overall_assessment_zh?: string } | undefined;
        const feedbackEn = feedback?.overall_assessment_en ?? '';
        const feedbackZh = feedback?.overall_assessment_zh ?? '';

        if (auth.currentUser) {
          try {
            await saveTestRecord({
              userId: '', // Set by service from auth.currentUser
              testDate: new Date(),
              overallScore: overall,
              level: scoreData.level,
              grade: scoreData.grade,
              sectionScores,
              strengths,
              weaknesses,
              feedbackEn,
              feedbackZh,
              totalQuestions: questions.length,
              correctAnswers: Math.round(overall * questions.length / 100),
              testType: 'section',
              sectionId: section
            });
          } catch (e) {
            console.error('Failed to save test record to history:', e);
          }
        }
      }
    } catch (error) { console.error('Error:', error); }
    finally { setIsUploading(false); setIsAnalyzing(false); }
  };

  const handleRerecord = () => {
    setAnalysisResult(null);
    setRecordedAudio(null);
    setElapsedTime(0);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    return '#e74c3c';
  };

  const sectionInfo = SECTIONS.find(s => s.id === section);
  const sectionTitle = isFullTest && apiSection
    ? `Section ${section} of ${totalSections}: ${apiSection.nameEn}`
    : sectionInfo?.title;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "24px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={onBack} style={{ padding: "8px 16px", fontSize: "14px", backgroundColor: "white", border: "1px solid #e0e0e0", borderRadius: "8px", cursor: "pointer" }}>
            ← Back
          </button>
          {isFullTest && onNextSection && (
            <button type="button" onClick={() => onNextSection(section)} style={{ padding: "8px 16px", fontSize: "14px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
              {section < totalSections ? "Next section" : "Submit test"}
            </button>
          )}
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "bold", color: COLORS.primary }}>{sectionTitle}</div>
            <div style={{ color: COLORS.muted, fontSize: "14px" }}>{questions.length} questions</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: COLORS.muted }}>Time Limit</div>
              <div style={{ fontSize: "14px", fontWeight: "600" }}>{formatTime(timeLimit)}</div>
            </div>
            <div style={{ padding: "8px 20px", backgroundColor: elapsedTime > timeLimit * 0.8 ? "#ffebee" : "#e3f2fd", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", fontFamily: "monospace", color: elapsedTime > timeLimit * 0.8 ? "#c62828" : "#1565c0" }}>
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginBottom: "24px" }}>
          {isSectionMode && (
            <>
              <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "16px" }}>Words to Read ({questions.length}):</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {questions.map((q: any, idx: number) => (
                  <div key={q.id || idx} style={{ width: "70px", padding: "10px 4px", backgroundColor: "#f8f9fa", borderRadius: "8px", textAlign: "center", border: "1px solid #e0e0e0" }}>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{q.content}</div>
                    <div style={{ fontSize: "10px", color: COLORS.muted }}>{q.pinyin || ''}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 3 && currentQ && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div style={{ fontWeight: "600", color: COLORS.primary }}>Question {currentQuestionIndex + 1} of {questions.length}</div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {questions.map((_, idx) => (
                    <div key={idx} style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: idx === currentQuestionIndex ? COLORS.secondary : idx < currentQuestionIndex ? "#27ae60" : "#e0e0e0" }} />
                  ))}
                </div>
              </div>
              <div style={{ fontSize: "20px", fontWeight: "600", marginBottom: "24px", color: COLORS.primary }}>{currentQ.content}</div>
              {currentQ.pinyin && <div style={{ color: COLORS.muted, fontSize: "14px", marginBottom: "16px" }}>{currentQ.pinyin}</div>}
              {currentQ.options && <div>{currentQ.options.map((opt, optIdx) => <div key={optIdx} style={{ padding: "14px 16px", backgroundColor: "#f8f9fa", borderRadius: "8px", marginBottom: "8px" }}>{opt}</div>)}</div>}
            </>
          )}

          {section === 4 && currentQ && (
            <>
              <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "16px" }}>Read this passage aloud:</div>
              <div style={{ fontSize: "18px", lineHeight: "2", padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px", textAlign: "justify" }}>{currentQ.content}</div>
              {currentQ.pinyin && <div style={{ marginTop: "16px", color: COLORS.muted, fontSize: "14px", fontStyle: "italic" }}>{currentQ.pinyin}</div>}
            </>
          )}

          {section === 5 && currentQ && (
            <>
              <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "16px" }}>Speak about this topic for at least 3 minutes:</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", padding: "32px", backgroundColor: "#e3f2fd", borderRadius: "12px", textAlign: "center", color: "#1565c0" }}>{currentQ.content}</div>
              {currentQ.pinyin && <div style={{ marginTop: "16px", color: COLORS.muted, fontSize: "14px" }}>Keywords: {currentQ.pinyin}</div>}
            </>
          )}
        </div>

        {section === 3 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
            <button onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))} disabled={currentQuestionIndex === 0} style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: currentQuestionIndex === 0 ? "#e0e0e0" : COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer" }}>← Previous</button>
            <button onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))} disabled={currentQuestionIndex >= questions.length - 1} style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: currentQuestionIndex >= questions.length - 1 ? "#e0e0e0" : COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: currentQuestionIndex >= questions.length - 1 ? "not-allowed" : "pointer" }}>Next →</button>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          {recordedAudio ? (
            <div style={{ padding: "24px", backgroundColor: "#e8f5e9", borderRadius: "12px", display: "inline-block" }}>
              <div style={{ fontSize: "20px", color: "#2e7d32", fontWeight: "bold" }}>Recording Complete!</div>
              <div style={{ fontSize: "14px", color: "#666" }}>Duration: {recordedAudio.duration}s</div>
            </div>
          ) : (
            <AudioRecorder onRecordingComplete={handleRecordingComplete} onRecordingStart={handleRecordingStart} maxDuration={timeLimit} />
          )}
        </div>

        {recordedAudio && !analysisResult && (
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" }}>
            <button type="button" onClick={handleRerecord} disabled={isUploading || isAnalyzing} style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: "#95a5a6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>Re-record</button>
            <button onClick={handleUpload} disabled={isUploading || isAnalyzing} style={{ padding: "12px 32px", fontSize: "14px", backgroundColor: isUploading || isAnalyzing ? "#95a5a6" : COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: isUploading || isAnalyzing ? "not-allowed" : "pointer" }}>
              {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Submit & Analyze"}
            </button>
          </div>
        )}

        {analysisResult && (
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px", marginTop: "24px" }}>
            <h3 style={{ margin: "0 0 24px 0", color: COLORS.primary, textAlign: "center" }}>Analysis Results</h3>
            {(analysisResult.success && analysisResult.code !== 'audio_cannot_be_processed') ? (
              <>
                <div style={{ textAlign: "center", padding: "24px", backgroundColor: "#f8f9fa", borderRadius: "12px", marginBottom: "24px" }}>
                  <div style={{ fontSize: "14px", color: COLORS.muted }}>PSC Score</div>
                  <div style={{ fontSize: "64px", fontWeight: "bold", color: getScoreColor(analysisResult.scores?.overall || 0) }}>{Math.round(analysisResult.scores?.overall || 0)}%</div>
                  <div style={{ display: "inline-block", padding: "8px 16px", backgroundColor: analysisResult.scores?.pass ? "#e8f5e9" : "#ffebee", borderRadius: "20px", color: analysisResult.scores?.pass ? "#2e7d32" : "#c62828", fontWeight: "600" }}>
                    {calculatePSCScore(analysisResult.scores?.overall || 0).level} - {calculatePSCScore(analysisResult.scores?.overall || 0).grade}
                  </div>
                </div>
                {analysisResult.scores && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
                    {analysisResult.scores.pronunciation !== undefined && <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}><div style={{ fontSize: "12px", color: COLORS.muted }}>Pronunciation</div><div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores.pronunciation) }}>{Math.round(analysisResult.scores.pronunciation)}</div></div>}
                    {analysisResult.scores.tone !== undefined && <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}><div style={{ fontSize: "12px", color: COLORS.muted }}>Tone</div><div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores.tone) }}>{Math.round(analysisResult.scores.tone)}</div></div>}
                    {analysisResult.scores.fluency !== undefined && <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}><div style={{ fontSize: "12px", color: COLORS.muted }}>Fluency</div><div style={{ fontSize: "28px", fontWeight: "bold", color: getScoreColor(analysisResult.scores.fluency) }}>{Math.round(analysisResult.scores.fluency)}</div></div>}
                  </div>
                )}
                {(analysisResult.testGPA != null || (analysisResult.sectionGPAs && Object.keys(analysisResult.sectionGPAs).length > 0)) && (
                  <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: COLORS.primary }}>GPA</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
                      {analysisResult.testGPA != null && (
                        <div style={{ padding: "12px 20px", backgroundColor: "#e8f5e9", borderRadius: "12px", border: "2px solid #2e7d32" }}>
                          <div style={{ fontSize: "12px", color: COLORS.muted }}>Test GPA</div>
                          <div style={{ fontSize: "28px", fontWeight: "bold", color: "#2e7d32" }}>{Number(analysisResult.testGPA).toFixed(1)}</div>
                        </div>
                      )}
                      {analysisResult.sectionGrades && analysisResult.sectionGPAs && (() => {
                        const sectionIds = Object.keys(analysisResult.sectionGPAs as Record<string, number>)
                          .map((k) => (Number.isNaN(Number(k)) ? k : Number(k)))
                          .sort((a, b) => Number(a) - Number(b));
                        return sectionIds.map((sectionId) => {
                          const grades = analysisResult.sectionGrades as Record<string | number, string>;
                          const gpas = analysisResult.sectionGPAs as Record<string | number, number>;
                          const grade = grades?.[sectionId];
                          const gpa = gpas?.[sectionId];
                          if (grade == null && gpa == null) return null;
                          const id = typeof sectionId === "number" ? sectionId : Number(sectionId);
                          const sectionTitle = SECTIONS.find((s) => s.id === id);
                          return (
                            <div key={String(sectionId)} style={{ padding: "10px 16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                              <div style={{ fontSize: "11px", color: COLORS.muted }}>{sectionTitle?.title ?? `Section ${sectionId}`}</div>
                              <div style={{ fontSize: "16px", fontWeight: "600", color: COLORS.primary }}>
                                {grade != null ? `${grade} ` : ""}{(gpa != null ? `(${Number(gpa).toFixed(1)})` : "")}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
                {analysisResult.feedback && <div><h4 style={{ margin: "0 0 12px 0", color: COLORS.primary }}>Feedback / 反馈</h4><div style={{ padding: "16px", backgroundColor: "#e3f2fd", borderRadius: "8px", whiteSpace: "pre-wrap", fontSize: "14px", color: "#1565c0" }}>{analysisResult.feedback}</div></div>}
              </>
            ) : (
              <div style={{ padding: "16px", backgroundColor: "#ffebee", borderRadius: "8px" }}>
                <p style={{ color: "#c62828", margin: "0 0 16px 0" }}>Analysis Failed: {analysisResult.error || "Unknown error"}</p>
                <p style={{ color: COLORS.muted, fontSize: "14px", margin: "0 0 16px 0" }}>The audio could not be processed. Try recording again.</p>
                <button type="button" onClick={handleRerecord} style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                  Rerecord
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Main MockTest Component
const MockTest: React.FC = () => {
  const [view, setView] = useState<'select' | 'rules' | 'question' | 'summary'>('select');
  const [selectedSection, setSelectedSection] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<'full' | 'section' | null>(null);
  const [testSections, setTestSections] = useState<TestSectionInfo[] | null>(null);
  const [fullTestSectionResults, setFullTestSectionResults] = useState<Record<number, FullTestSectionResult>>({});
  const [testSessionId, setTestSessionId] = useState<string | null>(null);

  const handleSelectSection = async (section: 1 | 2 | 3 | 4 | 5) => {
    setSelectedSection(section);
    setTestMode('section');
    setView('rules');
  };

  const handleStartFullTest = useCallback(async () => {
    setSelectedSection(1);
    setTestMode('full');
    setFullTestSectionResults({});
    setView('rules');
    const sections = await fetchTestSections();
    setTestSections(sections.length > 0 ? sections : null);
  }, []);

  const handleAcceptRules = async () => {
    const mode = testMode === 'full' ? 'full' : 'partial';
    const startResult = await startTest({
      type: mode,
      section: mode === 'partial' ? (selectedSection ?? undefined) : undefined,
    });
    if (startResult.sessionId) setTestSessionId(startResult.sessionId);

    setView('question');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/questions/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: selectedSection,
          count: selectedSection! <= 2 ? 100 : selectedSection === 3 ? 25 : selectedSection === 4 ? 1 : 2
        })
      });
      const data = await response.json();
      setQuestions(data.success && data.questions ? data.questions : getQuestionsBySection(selectedSection!));
    } catch {
      setQuestions(getQuestionsBySection(selectedSection!));
    }
    finally { setIsLoading(false); }
  };

  const handleCancelRules = () => {
    setView('select');
    setSelectedSection(null);
    setTestMode(null);
    setTestSessionId(null);
  };

  const handleSectionComplete = useCallback((section: number, data: FullTestSectionResult) => {
    setFullTestSectionResults((prev) => ({ ...prev, [section]: data }));
  }, []);

  const handleCompleteSectionTest = useCallback(
    async (payload: CompleteTestPayload) => {
      if (testSessionId) {
        await completeTest(testSessionId, payload);
        setTestSessionId(null);
      }
    },
    [testSessionId],
  );

  const handleNextSection = useCallback(async (currentSection: number) => {
    if (currentSection >= 5) {
      if (testSessionId) {
        const sectionIds = [1, 2, 3, 4, 5] as const;
        const completed = sectionIds.filter((id) => fullTestSectionResults[id]);
        const testGPA =
          completed.length > 0
            ? completed.reduce((sum, id) => sum + fullTestSectionResults[id].gpa, 0) / completed.length
            : 0;
        const sectionGrades: Record<string, string> = {};
        const sectionGPAs: Record<string, number> = {};
        completed.forEach((id) => {
          sectionGrades[String(id)] = fullTestSectionResults[id].grade;
          sectionGPAs[String(id)] = fullTestSectionResults[id].gpa;
        });
        const totalScore = testGPA * 25;
        const scoreData = calculatePSCScore(totalScore);
        await completeTest(testSessionId, {
          type: 'full',
          totalScore,
          testGPA,
          level: scoreData.level,
          grade: scoreData.grade,
          pass: scoreData.pass,
          sectionGrades,
          sectionGPAs,
          completedSections: [...completed],
        });
        setTestSessionId(null);
      }
      setView('summary');
      return;
    }
    const next = (currentSection + 1) as 1 | 2 | 3 | 4 | 5;
    setSelectedSection(next);
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/questions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: next,
          count: next <= 2 ? 100 : next === 3 ? 25 : next === 4 ? 1 : 2,
        }),
      });
      const data = await response.json();
      setQuestions(data.success && data.questions ? data.questions : getQuestionsBySection(next));
    } catch {
      setQuestions(getQuestionsBySection(next));
    } finally {
      setIsLoading(false);
    }
    setView('question');
  }, [testSessionId, fullTestSectionResults]);

  if (view === 'question' && selectedSection) {
    if (isLoading) {
      return (
        <div style={{ minHeight: "100vh", backgroundColor: COLORS.light, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>Loading questions...</div>
        </div>
      );
    }
    return (
      <QuestionPage
        section={selectedSection}
        questions={questions}
        onBack={() => { setTestSessionId(null); setView('select'); }}
        isFullTest={testMode === 'full'}
        onNextSection={testMode === 'full' ? handleNextSection : undefined}
        onSectionComplete={testMode === 'full' ? handleSectionComplete : undefined}
        onCompleteTest={testMode === 'section' && testSessionId ? handleCompleteSectionTest : undefined}
        sessionId={testSessionId}
        sectionList={testMode === 'full' ? testSections : null}
        totalSections={TOTAL_SECTIONS}
      />
    );
  }

  if (view === 'rules') {
    return <RulesModal onAccept={handleAcceptRules} onCancel={handleCancelRules} sectionId={selectedSection} isFullTest={testMode === 'full'} />;
  }

  if (view === 'summary') {
    return (
      <FullTestSummary
        sectionResults={fullTestSectionResults}
        sectionList={testSections}
        onBack={() => {
          setView('select');
          setSelectedSection(null);
          setTestMode(null);
          setFullTestSectionResults({});
          setTestSessionId(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: COLORS.primary, marginBottom: "8px", fontSize: "32px" }}>PSC Mock Test</h1>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "40px" }}>Choose a test mode to begin</p>

        <div style={{ display: "flex", gap: "24px", marginBottom: "40px" }}>
          <FullTest onStartSection={handleSelectSection} onStartFullTest={handleStartFullTest} />
          <SectionPractice onSelectSection={handleSelectSection} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
          <Link to={ROUTES.TAILORED_PRACTICE}><button style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: "white", color: COLORS.secondary, border: `2px solid ${COLORS.secondary}`, borderRadius: "8px", cursor: "pointer" }}>Tailored Practice</button></Link>
          <Link to={ROUTES.HISTORY}><button style={{ padding: "12px 24px", fontSize: "14px", backgroundColor: "white", color: "#34495e", border: "2px solid #34495e", borderRadius: "8px", cursor: "pointer" }}>History</button></Link>
        </div>
      </main>
    </div>
  );
};

export default MockTest;
