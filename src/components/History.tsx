import React, { useState, useEffect } from "react";
import Header from "./Header";
import { COLORS } from "../constants";
import { getTestRecords, getPracticeRecords, TestRecord, PracticeRecord, getAggregatedWeakAreas } from "../services/testHistory";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";

const History: React.FC = () => {
  const navigate = useNavigate();
  const [testRecords, setTestRecords] = useState<TestRecord[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'tests' | 'practice'>('tests');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tests, practices] = await Promise.all([
        getTestRecords(),
        getPracticeRecords()
      ]);
      setTestRecords(tests);
      setPracticeRecords(practices);
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setIsLoading(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    return '#e74c3c';
  };

  const getLevelBadgeColor = (level: string) => {
    if (level.includes('1')) return '#27ae60';
    if (level.includes('2')) return '#3498db';
    if (level.includes('3')) return '#f39c12';
    return '#e74c3c';
  };

  const handlePracticeFromWeakness = (record: TestRecord) => {
    // Navigate to tailored practice with the weaknesses from this record
    navigate(ROUTES.TAILORED_PRACTICE, {
      state: {
        fromHistory: true,
        testRecord: record,
        weaknesses: record.weaknesses,
        strengths: record.strengths,
        testRecordId: record.id
      }
    });
  };

  // Calculate summary stats
  const totalTests = testRecords.length;
  const avgScore = totalTests > 0
    ? Math.round(testRecords.reduce((sum, r) => sum + r.overallScore, 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...testRecords.map(r => r.overallScore)) : 0;
  const weakAreas = getAggregatedWeakAreas(testRecords);

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 80px)" }}>
          <div style={{ textAlign: "center", color: COLORS.muted }}>Loading history...</div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
      <Header />
      <main style={{ padding: "24px 20px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", color: COLORS.primary, marginBottom: "8px", fontSize: "28px" }}>📊 History</h1>
        <p style={{ textAlign: "center", color: COLORS.muted, marginBottom: "32px" }}>View your test results and practice progress</p>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: COLORS.primary }}>{totalTests}</div>
            <div style={{ fontSize: "14px", color: COLORS.muted }}>Total Tests</div>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: getScoreColor(avgScore) }}>{avgScore}%</div>
            <div style={{ fontSize: "14px", color: COLORS.muted }}>Average Score</div>
          </div>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: getScoreColor(bestScore) }}>{bestScore}%</div>
            <div style={{ fontSize: "14px", color: COLORS.muted }}>Best Score</div>
          </div>
        </div>

        {/* Weak Areas Alert */}
        {weakAreas.length > 0 && (
          <div style={{ backgroundColor: "#fff3e0", borderRadius: "12px", padding: "16px", marginBottom: "24px", borderLeft: "4px solid #ff9800" }}>
            <div style={{ fontWeight: "600", color: "#e65100", marginBottom: "8px" }}>Areas to Focus On:</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {weakAreas.map((area, idx) => (
                <span key={idx} style={{ backgroundColor: "#ff9800", color: "white", padding: "4px 12px", borderRadius: "16px", fontSize: "13px" }}>
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            onClick={() => setActiveTab('tests')}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              backgroundColor: activeTab === 'tests' ? COLORS.primary : "white",
              color: activeTab === 'tests' ? "white" : COLORS.muted,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Test Results
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontWeight: "600",
              backgroundColor: activeTab === 'practice' ? COLORS.primary : "white",
              color: activeTab === 'practice' ? "white" : COLORS.muted,
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Practice History
          </button>
        </div>

        {/* Test Records List */}
        {activeTab === 'tests' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {testRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "12px" }}>
                <span style={{ fontSize: "48px" }}>📝</span>
                <p style={{ color: COLORS.muted, marginTop: "16px" }}>No test records yet. Take a mock test to see your history!</p>
              </div>
            ) : (
              testRecords.map((record) => (
                <div key={record.id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: COLORS.muted }}>{formatDate(record.testDate)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: getScoreColor(record.overallScore) }}>{record.overallScore}%</span>
                        <span style={{
                          backgroundColor: getLevelBadgeColor(record.level),
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {record.level} - {record.grade}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedRecord(expandedRecord === record.id ? null : record.id!)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        backgroundColor: "#f8f9fa",
                        color: COLORS.primary,
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      {expandedRecord === record.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {/* Section Scores */}
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    {record.sectionScores.map((sec, idx) => (
                      <div key={idx} style={{
                        padding: "6px 12px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}>
                        <span style={{ color: COLORS.muted }}>S{sec.sectionId}: </span>
                        <span style={{ fontWeight: "600", color: getScoreColor(sec.score) }}>{sec.score}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Strengths & Weaknesses */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {record.strengths.length > 0 && record.strengths.map((s, idx) => (
                      <span key={idx} style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "4px 10px", borderRadius: "4px", fontSize: "12px" }}>
                        ✓ {s}
                      </span>
                    ))}
                    {record.weaknesses.length > 0 && record.weaknesses.map((w, idx) => (
                      <span key={idx} style={{ backgroundColor: "#ffebee", color: "#c62828", padding: "4px 10px", borderRadius: "4px", fontSize: "12px" }}>
                        ✗ {w}
                      </span>
                    ))}
                  </div>

                  {/* Expanded Details */}
                  {expandedRecord === record.id && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
                      {/* AI Feedback */}
                      {record.feedbackEn && (
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>AI Feedback:</div>
                          <div style={{ backgroundColor: "#e3f2fd", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#1565c0", marginBottom: "8px" }}>
                            {record.feedbackEn}
                          </div>
                          {record.feedbackZh && (
                            <div style={{ backgroundColor: "#fff3e0", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#e65100" }}>
                              {record.feedbackZh}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Practice Button */}
                      {record.weaknesses.length > 0 && (
                        <button
                          onClick={() => handlePracticeFromWeakness(record)}
                          style={{
                            width: "100%",
                            padding: "12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            backgroundColor: COLORS.secondary,
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          🎯 Practice Weak Areas from This Test
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Practice Records List */}
        {activeTab === 'practice' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {practiceRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "12px" }}>
                <span style={{ fontSize: "48px" }}>🎯</span>
                <p style={{ color: COLORS.muted, marginTop: "16px" }}>No practice records yet. Start practicing to track your progress!</p>
              </div>
            ) : (
              practiceRecords.map((record) => (
                <div key={record.id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: COLORS.muted }}>{formatDate(record.practiceDate)}</div>
                      <div style={{ fontWeight: "600", color: COLORS.primary, marginTop: "4px" }}>
                        {record.practiceType.charAt(0).toUpperCase() + record.practiceType.slice(1)} Practice
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "20px", fontWeight: "bold", color: getScoreColor(record.score) }}>{record.score}%</div>
                      <div style={{ fontSize: "12px", color: COLORS.muted }}>{record.questionsAttempted} questions</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
                    {record.focusAreas.map((area, idx) => (
                      <span key={idx} style={{ backgroundColor: "#fff3e0", color: "#e65100", padding: "2px 8px", borderRadius: "4px", fontSize: "11px" }}>
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
