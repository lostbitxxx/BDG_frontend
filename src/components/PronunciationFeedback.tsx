import React from 'react';
import {
  AnalysisResult,
  CharacterResult,
  CharacterAnalysis,
  ToneAnalysis,
  PhonemeAnalysis,
} from '../types';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PronunciationFeedbackProps {
  result: AnalysisResult;
  showDetails?: boolean;
  language?: 'en' | 'zh';
}

export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  result,
  showDetails = true,
  language = 'en'
}) => {
  const { scores, feedback, expected_text, transcription, character_results, errors } = result;
  const isZh = language === 'zh';

  const getStatus = (charResult: CharacterResult): 'correct' | 'error' | 'defect' | 'pending' => {
    if (charResult.status === 'pending') return 'pending';
    if (charResult.errors.length === 0) return 'correct';
    const hasError = charResult.errors.some(e => e.severity === 'error');
    return hasError ? 'error' : 'defect';
  };

  const formatCategory = (category: string): string => {
    const map: Record<string, Record<string, string>> = {
      initial_error: { en: 'Initial', zh: '声母' },
      final_error: { en: 'Final', zh: '韵母' },
      tone_error: { en: 'Tone', zh: '声调' },
      neutral_tone_error: { en: 'Neutral', zh: '轻声' },
      omission: { en: 'Omission', zh: '漏读' },
      addition: { en: 'Addition', zh: '添加' },
    };
    return map[category]?.[language] || category;
  };

  const getStatusColor = (status: string): { bg: string; border: string; text: string } => {
    switch (status) {
      case 'correct':
        return { bg: '#d4edda', border: '#c3e6cb', text: '#155724' };
      case 'error':
        return { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' };
      case 'defect':
        return { bg: '#fff3cd', border: '#ffeeba', text: '#856404' };
      default:
        return { bg: '#e2e3e5', border: '#d6d8db', text: '#383d41' };
    }
  };

  return (
    <div style={styles.container}>
      {/* Score Header */}
      <div style={styles.scoreHeader}>
        <div style={styles.scoreItem}>
          <div style={styles.scoreValue}>{scores.overall}</div>
          <div style={styles.scoreLabel}>{isZh ? '总分' : 'Overall'}</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreValue}>{scores.pronunciation}</div>
          <div style={styles.scoreLabel}>{isZh ? '发音' : 'Pronunciation'}</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreValue}>{scores.tone}</div>
          <div style={styles.scoreLabel}>{isZh ? '声调' : 'Tone'}</div>
        </div>
        <div style={styles.scoreItem}>
          <div style={styles.scoreValue}>{scores.fluency}</div>
          <div style={styles.scoreLabel}>{isZh ? '流利度' : 'Fluency'}</div>
        </div>
        <div style={styles.pscRating}>
          {result.psc_level} {result.psc_grade}
        </div>
      </div>

      {/* Text Display */}
      <div style={styles.textDisplay}>
        <div style={styles.textRow}>
          <span style={styles.textLabel}>{isZh ? '期望' : 'Expected'}</span>
          <div style={styles.characters}>
            {character_results.map((cr, i) => {
              const status = getStatus(cr);
              const colors = getStatusColor(status);
              return (
                <div key={i} style={{ ...styles.characterBadge, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}>
                  <span style={styles.characterChar}>{cr.character}</span>
                  <span style={{ ...styles.pinyinText, color: colors.text }}>{cr.expected_pinyin || '-'}</span>
                  <span style={{ ...styles.toneText, color: colors.text }}>T{cr.expected_tone}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={styles.textRow}>
          <span style={styles.textLabel}>{isZh ? '实际' : 'You said'}</span>
          <div style={styles.characters}>
            {transcription.split('').map((char, i) => (
              <div key={i} style={{ ...styles.characterBadge, backgroundColor: '#e2e3e5', borderColor: '#d6d8db' }}>
                <span style={styles.characterChar}>{char}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#d4edda' }}></span>
            {isZh ? '✓ 正确' : '✓ Correct'}
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#f8d7da' }}></span>
            {isZh ? '✗ 错误' : '✗ Error'}
          </span>
          <span style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: '#fff3cd' }}></span>
            {isZh ? '◐ 缺陷' : '◐ Defect'}
          </span>
        </div>
      </div>

      {/* Error Summary */}
      {showDetails && errors.length > 0 && (
        <div style={styles.errorSummarySection}>
          <h3 style={styles.sectionTitle}>{isZh ? '错误总结' : 'Error Summary'}</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={{ ...styles.summaryValue, color: '#e74c3c' }}>{errors.length}</div>
              <div style={styles.summaryLabel}>{isZh ? '总错误' : 'Total Errors'}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{errors.filter(e => e.category === 'initial_error').length}</div>
              <div style={styles.summaryLabel}>{isZh ? '声母错误' : 'Initial Errors'}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{errors.filter(e => e.category === 'final_error').length}</div>
              <div style={styles.summaryLabel}>{isZh ? '韵母错误' : 'Final Errors'}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{errors.filter(e => e.category === 'tone_error').length}</div>
              <div style={styles.summaryLabel}>{isZh ? '声调错误' : 'Tone Errors'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Errors */}
      {showDetails && errors.length > 0 && (
        <div style={styles.errorDetailsSection}>
          <h3 style={styles.sectionTitle}>{isZh ? '详细分析' : 'Detailed Analysis'}</h3>
          {errors.slice(0, 5).map((error, i) => (
            <div key={i} style={{ ...styles.errorCard, backgroundColor: error.severity === 'error' ? '#fff5f5' : '#fffaf0', borderColor: error.severity === 'error' ? '#feb2b2' : '#fbd38d' }}>
              <div style={styles.errorHeader}>
                <span style={styles.errorCharacter}>{error.character}</span>
                <span style={{ ...styles.errorBadge, backgroundColor: error.category === 'tone_error' ? '#fce4ec' : error.category === 'initial_error' ? '#e3f2fd' : '#e8f5e9', color: error.category === 'tone_error' ? '#c2185b' : error.category === 'initial_error' ? '#1565c0' : '#2e7d32' }}>
                  {formatCategory(error.category)}
                </span>
              </div>

              <div style={styles.comparison}>
                <div style={styles.comparisonItem}>
                  <div style={styles.comparisonLabel}>{isZh ? '期望' : 'Expected'}</div>
                  <div style={styles.comparisonValue}>{error.expected_pinyin}(T{error.expected_tone})</div>
                </div>
                <span style={styles.arrow}>→</span>
                <div style={styles.comparisonItem}>
                  <div style={styles.comparisonLabel}>{isZh ? '实际' : 'Actual'}</div>
                  <div style={{ ...styles.comparisonValue, color: '#e74c3c' }}>{error.actual_pinyin || '-'}(T{error.actual_tone || '-'})</div>
                </div>
              </div>

              <div style={styles.feedbackText}>
                <p style={styles.feedbackEN}>{isZh ? error.description_zh : error.description_en}</p>
              </div>

              <div style={styles.fixTip}>
                <div style={styles.fixTipTitle}>{isZh ? '如何改正' : 'How to Fix'}</div>
                <p style={styles.feedbackEN}>{isZh ? error.fix_tip_zh : error.fix_tip_en}</p>
              </div>

              {error.practice_words.length > 0 && (
                <div style={styles.practiceWords}>
                  {error.practice_words.map((word, j) => (
                    <span key={j} style={styles.practiceWord}>{word}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Character Analysis with Tone, Phoneme, Consonant, Vowel Details */}
      {showDetails && feedback.character_analysis && feedback.character_analysis.length > 0 && (
        <div style={styles.characterAnalysisSection}>
          <h3 style={styles.sectionTitle}>
            {isZh ? '详细音素分析' : 'Detailed Phoneme Analysis'}
          </h3>
          <p style={styles.analysisSubtitle}>
            {isZh ? '包含声调、声母、韵母详细反馈' : 'Includes Tone, Consonant (Initial), Vowel (Final) feedback'}
          </p>

          {feedback.character_analysis.slice(0, 10).map((charAnalysis: CharacterAnalysis, i: number) => (
            <div
              key={i}
              style={{
                ...styles.analysisCard,
                backgroundColor: charAnalysis.status === 'correct' ? '#f0fdf4' : '#fef2f2',
                borderColor: charAnalysis.status === 'correct' ? '#bbf7d0' : '#fecaca',
              }}
            >
              <div style={styles.analysisHeader}>
                <span style={styles.analysisChar}>{charAnalysis.character}</span>
                <span
                  style={{
                    ...styles.analysisStatus,
                    backgroundColor: charAnalysis.status === 'correct' ? '#22c55e' : charAnalysis.status === 'error' ? '#ef4444' : '#f59e0b',
                  }}
                >
                  {isZh
                    ? (charAnalysis.status === 'correct' ? '正确' : charAnalysis.status === 'error' ? '错误' : '缺陷')
                    : charAnalysis.status.toUpperCase()}
                </span>
              </div>

              {/* Expected vs Actual - Tone, Consonant, Vowel */}
              <div style={styles.analysisDetails}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>{isZh ? '期望' : 'Expected'}</span>
                  <span style={styles.detailValue}>
                    {charAnalysis.expected_pinyin || '-'} |
                    {isZh ? '声调' : 'Tone'} {charAnalysis.expected_tone} |
                    {isZh ? '声母' : 'Initial'} {charAnalysis.expected_initial || '-'} |
                    {isZh ? '韵母' : 'Final'} {charAnalysis.expected_final || '-'}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>{isZh ? '实际' : 'Actual'}</span>
                  <span style={{ ...styles.detailValue, color: charAnalysis.status !== 'correct' ? '#ef4444' : '#333' }}>
                    {charAnalysis.actual_pinyin || '-'} |
                    {isZh ? '声调' : 'Tone'} {charAnalysis.actual_tone} |
                    {isZh ? '声母' : 'Initial'} {charAnalysis.actual_initial || '-'} |
                    {isZh ? '韵母' : 'Final'} {charAnalysis.actual_final || '-'}
                  </span>
                </div>
              </div>

              {/* Error Type Badge */}
              {charAnalysis.error_type && charAnalysis.error_type !== 'none' && (
                <div style={styles.errorTypeBadge}>
                  {isZh
                    ? (charAnalysis.error_type === 'tone_error' ? '声调错误' :
                       charAnalysis.error_type === 'initial_error' ? '声母错误' :
                       charAnalysis.error_type === 'final_error' ? '韵母错误' :
                       charAnalysis.error_type === 'neutral_tone_error' ? '轻声错误' :
                       charAnalysis.error_type)
                    : (charAnalysis.error_type === 'tone_error' ? 'TONE ERROR' :
                       charAnalysis.error_type === 'initial_error' ? 'CONSONANT/INITIAL ERROR' :
                       charAnalysis.error_type === 'final_error' ? 'VOWEL/FINAL ERROR' :
                       charAnalysis.error_type === 'neutral_tone_error' ? 'NEUTRAL TONE ERROR' :
                       charAnalysis.error_type)}
                </div>
              )}

              {/* Detailed Feedback - MUST include Tone, Consonant, Vowel */}
              {(charAnalysis.feedback_en || charAnalysis.feedback_zh) && (
                <div style={styles.feedbackSection}>
                  <div style={styles.feedbackLabel}>{isZh ? '详细反馈' : 'Detailed Feedback'}</div>
                  <p style={styles.feedbackText}>{isZh ? charAnalysis.feedback_zh : charAnalysis.feedback_en}</p>
                </div>
              )}

              {/* Fix Tips */}
              {(charAnalysis.fix_tip_en || charAnalysis.fix_tip_zh) && (
                <div style={styles.fixTipSection}>
                  <div style={styles.fixTipLabel}>{isZh ? '如何改正' : 'How to Fix'}</div>
                  <p style={styles.fixTipText}>{isZh ? charAnalysis.fix_tip_zh : charAnalysis.fix_tip_en}</p>
                </div>
              )}

              {/* Practice Words */}
              {charAnalysis.practice_words && charAnalysis.practice_words.length > 0 && (
                <div style={styles.practiceWordsSection}>
                  {charAnalysis.practice_words.map((word: string, j: number) => (
                    <span key={j} style={styles.practiceWordBadge}>{word}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {feedback.character_analysis.length > 10 && (
            <p style={styles.moreText}>
              {isZh ? `... 还有 ${feedback.character_analysis.length - 10} 个字符` : `... and ${feedback.character_analysis.length - 10} more characters`}
            </p>
          )}
        </div>
      )}

      {/* Tone Analysis Summary */}
      {showDetails && feedback.tone_analysis && (
        <div style={styles.analysisSummarySection}>
          <h3 style={styles.sectionTitle}>{isZh ? '声调分析' : 'Tone Analysis'}</h3>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{feedback.tone_analysis.total_tones || 0}</div>
              <div style={styles.summaryLabel}>{isZh ? '总声调' : 'Total Tones'}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={{ ...styles.summaryValue, color: '#22c55e' }}>{feedback.tone_analysis.correct_tones || 0}</div>
              <div style={styles.summaryLabel}>{isZh ? '正确' : 'Correct'}</div>
            </div>
            <div style={styles.summaryItem}>
              <div style={styles.summaryValue}>{feedback.tone_analysis.tone_accuracy || '0%'}</div>
              <div style={styles.summaryLabel}>{isZh ? '准确率' : 'Accuracy'}</div>
            </div>
          </div>
          {feedback.tone_analysis.common_errors && feedback.tone_analysis.common_errors.length > 0 && (
            <div style={styles.errorList}>
              <div style={styles.errorListTitle}>{isZh ? '常见声调错误' : 'Common Tone Errors'}</div>
              {feedback.tone_analysis.common_errors.map((err: string, i: number) => (
                <span key={i} style={styles.errorBadge}>{err}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Phoneme Analysis Summary */}
      {showDetails && feedback.phoneme_analysis && (
        <div style={styles.analysisSummarySection}>
          <h3 style={styles.sectionTitle}>{isZh ? '音素分析' : 'Phoneme Analysis'}</h3>

          {(feedback.phoneme_analysis.consonant_issues && feedback.phoneme_analysis.consonant_issues.length > 0) && (
            <div style={styles.phonemeSection}>
              <div style={styles.phonemeTitle}>
                {isZh ? '声母/辅音问题' : 'Consonant/Initial Issues'}
              </div>
              <div style={styles.phonemeList}>
                {feedback.phoneme_analysis.consonant_issues.map((issue: string, i: number) => (
                  <span key={i} style={styles.phonemeBadge}>{issue}</span>
                ))}
              </div>
            </div>
          )}

          {(feedback.phoneme_analysis.vowel_issues && feedback.phoneme_analysis.vowel_issues.length > 0) && (
            <div style={styles.phonemeSection}>
              <div style={styles.phonemeTitle}>
                {isZh ? '韵母/元音问题' : 'Vowel/Final Issues'}
              </div>
              <div style={styles.phonemeList}>
                {feedback.phoneme_analysis.vowel_issues.map((issue: string, i: number) => (
                  <span key={i} style={styles.phonemeBadge}>{issue}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Practice Recommendations */}
      {showDetails && feedback.practice_recommendations && (
        <div style={styles.practiceSection}>
          <h3 style={styles.sectionTitle}>{isZh ? '练习建议' : 'Practice Recommendations'}</h3>

          <div style={styles.focusAreas}>
            <div style={styles.focusTitle}>{isZh ? '重点练习' : 'Focus Areas'}</div>
            <div style={styles.focusList}>
              {(isZh ? feedback.practice_recommendations.focus_areas_zh : feedback.practice_recommendations.focus_areas_en).map((area, i) => (
                <span key={i} style={styles.focusTag}>{area}</span>
              ))}
            </div>
          </div>

          <div style={styles.focusAreas}>
            <div style={styles.focusTitle}>{isZh ? '每日练习' : 'Daily Exercise'}</div>
            <div style={styles.focusList}>
              {(isZh ? feedback.practice_recommendations.exercises_zh : feedback.practice_recommendations.exercises_en).map((exercise, i) => (
                <span key={i} style={styles.focusTag}>{exercise}</span>
              ))}
            </div>
          </div>

          {feedback.encouragement_en && (
            <div style={styles.encouragement}>
              <p style={styles.encouragementEN}>{feedback.encouragement_en}</p>
              <p style={styles.encouragementZH}>{feedback.encouragement_zh}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  scoreHeader: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  scoreItem: {
    textAlign: 'center' as const,
  },
  scoreValue: {
    fontSize: '28px',
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: '12px',
    opacity: 0.9,
    textTransform: 'uppercase' as const,
  },
  pscRating: {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
  },
  textDisplay: {
    padding: '20px',
    background: '#f8f9fa',
    borderBottom: '1px solid #eee',
  },
  textRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '12px',
  },
  textLabel: {
    fontWeight: '600',
    width: '80px',
    color: '#666',
    fontSize: '14px',
  },
  characters: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '4px',
  },
  characterBadge: {
    display: 'inline-flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '48px',
    borderRadius: '6px',
    fontSize: '18px',
    fontWeight: '500',
    border: '2px solid',
  },
  characterChar: {
    lineHeight: '1',
  },
  pinyinText: {
    fontSize: '9px',
    marginTop: '2px',
  },
  toneText: {
    fontSize: '8px',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '12px',
    background: '#f1f3f4',
    fontSize: '12px',
    marginTop: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
  errorSummarySection: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  sectionTitle: {
    margin: '0 0 16px 0',
    fontSize: '16px',
    color: '#333',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  summaryItem: {
    background: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  errorDetailsSection: {
    padding: '20px',
  },
  errorCard: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  errorHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  errorCharacter: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  errorBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  comparison: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '12px',
    fontSize: '14px',
  },
  comparisonItem: {
    textAlign: 'center' as const,
  },
  comparisonLabel: {
    fontSize: '10px',
    color: '#999',
    textTransform: 'uppercase' as const,
  },
  comparisonValue: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
  },
  arrow: {
    fontSize: '20px',
    color: '#999',
  },
  feedbackText: {
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '12px',
  },
  feedbackEN: {
    margin: '0 0 8px 0',
    color: '#333',
  },
  fixTip: {
    background: '#e8f5e9',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  fixTipTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: '4px',
  },
  practiceWords: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  practiceWord: {
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  practiceSection: {
    padding: '20px',
    background: '#f8f9fa',
  },
  focusAreas: {
    marginBottom: '16px',
  },
  focusTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  focusList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  focusTag: {
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  encouragement: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    marginTop: '16px',
  },
  encouragementEN: {
    margin: '0 0 4px 0',
    fontSize: '14px',
  },
  encouragementZH: {
    margin: 0,
    fontSize: '13px',
    opacity: 0.9,
  },

  // Character Analysis Section Styles
  characterAnalysisSection: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  analysisSubtitle: {
    fontSize: '12px',
    color: '#666',
    margin: '-8px 0 16px 0',
  },
  analysisCard: {
    border: '1px solid',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  analysisHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  analysisChar: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
  },
  analysisStatus: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'white',
  },
  analysisDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '13px',
  },
  detailLabel: {
    fontWeight: '600',
    color: '#666',
  },
  detailValue: {
    color: '#333',
  },
  errorTypeBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    marginBottom: '12px',
  },
  feedbackSection: {
    marginBottom: '12px',
  },
  feedbackLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#7c3aed',
    marginBottom: '4px',
  },
  fixTipSection: {
    backgroundColor: '#ecfdf5',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px',
  },
  fixTipLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#059669',
    marginBottom: '4px',
  },
  fixTipText: {
    fontSize: '13px',
    color: '#333',
    margin: 0,
    lineHeight: 1.5,
  },
  practiceWordsSection: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  practiceWordBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  moreText: {
    textAlign: 'center' as const,
    color: '#666',
    fontSize: '12px',
    marginTop: '8px',
  },

  // Analysis Summary Section
  analysisSummarySection: {
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  errorList: {
    marginTop: '12px',
  },
  errorListTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px',
  },
  // Phoneme Section
  phonemeSection: {
    marginBottom: '16px',
  },
  phonemeTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  phonemeList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  phonemeBadge: {
    display: 'inline-block',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
  },
};

export default PronunciationFeedback;
