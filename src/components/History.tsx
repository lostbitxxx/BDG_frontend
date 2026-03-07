import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { COLORS, ROUTES } from "../constants";
import { getTestHistory, type BackendTestHistoryItem } from "../services/api";
import { getPracticeRecords, PracticeRecord } from "../services/testHistory";
import { useAuth } from "../context/AuthContext";

const History: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [testHistory, setTestHistory] = useState<BackendTestHistoryItem[]>([]);
  const [practiceRecords, setPracticeRecords] = useState<PracticeRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'tests' | 'practice'>('tests');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [historyRes, practices] = await Promise.all([
        getTestHistory(50),
        getPracticeRecords()
      ]);
      setTestHistory(historyRes.success && Array.isArray(historyRes.history) ? historyRes.history : []);
      setPracticeRecords(practices);
      if (historyRes.error) setLoadError(historyRes.error);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoadError('Could not load history. You may need to sign in.');
      setTestHistory([]);
      setPracticeRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (iso: string | Date) => {
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleDateString('en-US', {
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
    if (level.includes('1') || level.includes('一')) return '#27ae60';
    if (level.includes('2') || level.includes('二')) return '#3498db';
    if (level.includes('3') || level.includes('三')) return '#f39c12';
    return '#e74c3c';
  };

  const totalTests = testHistory.length;
  const avgScore = totalTests > 0
    ? Math.round(testHistory.reduce((sum, r) => sum + (r.totalScore ?? 0), 0) / totalTests)
    : 0;
  const bestScore = totalTests > 0 ? Math.max(...testHistory.map(r => r.totalScore ?? 0)) : 0;

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

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.light }}>
        <Header />
        <main style={{ padding: "24px 20px", maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ color: COLORS.primary, marginBottom: "8px", fontSize: "28px" }}>📊 History</h1>
          <p style={{ color: COLORS.muted, marginBottom: "24px" }}>Sign in to save and view your test results and marks.</p>
          <Link to={ROUTES.SIGNIN}>
            <button style={{ padding: "12px 24px", fontSize: "16px", backgroundColor: COLORS.primary, color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
              Sign in
            </button>
          </Link>
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

        {loadError && (
          <div style={{ padding: "12px 16px", marginBottom: "24px", backgroundColor: "#ffebee", borderRadius: "8px", color: "#c62828" }}>
            {loadError}
          </div>
        )}

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

        {/* Test history from backend (GET /api/test/history) */}
        {activeTab === 'tests' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {testHistory.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", backgroundColor: "white", borderRadius: "12px" }}>
                <span style={{ fontSize: "48px" }}>📝</span>
                <p style={{ color: COLORS.muted, marginTop: "16px" }}>No test records yet. Complete a mock test (and finish with Submit test) to see your history here.</p>
              </div>
            ) : (
              testHistory.map((item) => (
                <div key={item.id} style={{ backgroundColor: "white", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div>
                      <div style={{ fontSize: "14px", color: COLORS.muted }}>{formatDate(item.completedAt)}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "24px", fontWeight: "bold", color: getScoreColor(item.totalScore ?? 0) }}>{Math.round(item.totalScore ?? 0)}%</span>
                        {item.testGPA != null && (
                        <span style={{ fontSize: "16px", fontWeight: "600", color: COLORS.secondary }}>GPA {Number(item.testGPA).toFixed(1)}</span>
                        )}
                        <span style={{
                          backgroundColor: getLevelBadgeColor(item.level),
                          color: "white",
                          padding: "4px 12px",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}>
                          {item.level} – {item.grade}
                        </span>
                        {item.pass != null && (
                          <span style={{ fontSize: "12px", color: item.pass ? "#2e7d32" : "#c62828" }}>{item.pass ? "Pass" : "No pass"}</span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: COLORS.muted, marginTop: "4px" }}>
                        {item.type === 'full' ? 'Full test' : `Section ${item.partialSection ?? '?'}`}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
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
                      {expandedId === item.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>

                  {expandedId === item.id && (item.sectionGrades || item.sectionGPAs) && (
                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #eee" }}>
                      <div style={{ fontWeight: "600", color: COLORS.primary, marginBottom: "8px" }}>Section grades</div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {(item.completedSections ?? Object.keys(item.sectionGPAs ?? item.sectionGrades ?? {}).map(Number).sort((a, b) => a - b)).map((secId) => (
                          <div key={secId} style={{ padding: "6px 12px", backgroundColor: "#f8f9fa", borderRadius: "6px", fontSize: "12px" }}>
                            <span style={{ color: COLORS.muted }}>S{secId}: </span>
                            <span style={{ fontWeight: "600" }}>{item.sectionGrades?.[String(secId)] ?? "—"}</span>
                            {item.sectionGPAs?.[String(secId)] != null && (
                              <span style={{ color: COLORS.secondary }}> ({Number(item.sectionGPAs[String(secId)]).toFixed(1)})</span>
                            )}
                          </div>
                        ))}
                      </div>
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
