// Test History Firestore Service
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, deleteDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth } from '../lib/firebase';

function toDate(val: unknown): Date {
  if (!val) return new Date();
  if (typeof (val as { toDate?: () => Date }).toDate === 'function') return (val as Timestamp).toDate();
  return new Date(val as string | number);
}

export interface TestSectionScore {
  sectionId: number;
  sectionName: string;
  score: number;
  grade: string;
}

export interface TestRecord {
  id?: string;
  userId: string;
  testDate: Date;
  overallScore: number;
  level: string;
  grade: string;
  sectionScores: TestSectionScore[];
  strengths: string[];
  weaknesses: string[];
  feedbackEn: string;
  feedbackZh: string;
  totalQuestions: number;
  correctAnswers: number;
  testType: 'full' | 'section';
  sectionId?: number;
}

export interface PracticeQuestion {
  content: string;
  pinyin: string;
  type: string;
  difficulty: string;
  hint?: string;
}

export interface PracticeRecord {
  id?: string;
  userId: string;
  practiceDate: Date;
  practiceType: 'tone' | 'pronunciation' | 'vocabulary' | 'fluency' | 'mixed';
  focusAreas: string[];
  score: number;
  duration: number;
  questionsAttempted: number;
  correctAnswers: number;
  questions?: PracticeQuestion[];
  feedbackEn?: string;
  feedbackZh?: string;
}

// Save a new test record (requires user to be signed in)
export async function saveTestRecord(record: Omit<TestRecord, 'id'>): Promise<string> {
  // Check Firebase auth - need Firebase user to save to Firestore
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const docRef = await addDoc(collection(db, 'testRecords'), {
    ...record,
    userId: user.uid,
    testDate: Timestamp.fromDate(record.testDate instanceof Date ? record.testDate : new Date(record.testDate)),
  });

  return docRef.id;
}

// Get all test records for current user
export async function getTestRecords(): Promise<TestRecord[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, 'testRecords'),
      where('userId', '==', user.uid),
      orderBy('testDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, testDate: toDate(data.testDate) } as TestRecord;
    });
  } catch (err) {
    console.error('getTestRecords failed (e.g. missing Firestore index):', err);
    return [];
  }
}

// Get a single test record by ID
export async function getTestRecord(id: string): Promise<TestRecord | null> {
  const docRef = doc(db, 'testRecords', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return { id: docSnap.id, ...data, testDate: toDate(data.testDate) } as TestRecord;
  }
  return null;
}

// Delete a test record
export async function deleteTestRecord(id: string): Promise<void> {
  const docRef = doc(db, 'testRecords', id);
  await deleteDoc(docRef);
}

// Update a practice record (for incremental saves during practice)
export async function updatePracticeRecord(id: string, updates: Partial<PracticeRecord>): Promise<void> {
  const docRef = doc(db, 'practiceRecords', id);
  const updateData: Record<string, any> = {};

  if (updates.score !== undefined) updateData.score = updates.score;
  if (updates.questionsAttempted !== undefined) updateData.questionsAttempted = updates.questionsAttempted;
  if (updates.correctAnswers !== undefined) updateData.correctAnswers = updates.correctAnswers;
  if (updates.duration !== undefined) updateData.duration = updates.duration;

  await updateDoc(docRef, updateData);
}

// Save a practice record
export async function savePracticeRecord(record: Omit<PracticeRecord, 'id'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'practiceRecords'), {
    ...record,
    userId: user.uid,
    practiceDate: record.practiceDate.toISOString(),
  });

  return docRef.id;
}

// Get all practice records for current user
export async function getPracticeRecords(): Promise<PracticeRecord[]> {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    // Simplified query without orderBy to avoid needing composite index
    const q = query(
      collection(db, 'practiceRecords'),
      where('userId', '==', user.uid)
    );
    const querySnapshot = await getDocs(q);
    // Sort in memory instead of using orderBy
    const records = querySnapshot.docs.map(d => {
      const data = d.data();
      return { id: d.id, ...data, practiceDate: toDate(data.practiceDate) } as PracticeRecord;
    });
    return records.sort((a, b) => {
      const dateA = a.practiceDate?.getTime() || 0;
      const dateB = b.practiceDate?.getTime() || 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.error('getPracticeRecords failed:', err);
    return [];
  }
}

// Calculate strengths and weaknesses from section scores
export function analyzeStrengthsWeaknesses(sectionScores: TestSectionScore[]): { strengths: string[], weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const sectionNames: Record<number, string> = {
    1: 'Single Characters',
    2: 'Polysyllabic Words',
    3: 'Vocabulary & Grammar',
    4: 'Reading Passage',
    5: 'Speaking'
  };

  sectionScores.forEach(section => {
    if (section.score >= 80) {
      strengths.push(sectionNames[section.sectionId] || `Section ${section.sectionId}`);
    } else if (section.score < 70) {
      weaknesses.push(sectionNames[section.sectionId] || `Section ${section.sectionId}`);
    }
  });

  return { strengths, weaknesses };
}

// Get aggregated weak areas across all tests
export function getAggregatedWeakAreas(testRecords: TestRecord[]): string[] {
  const weaknessCount: Record<string, number> = {};

  testRecords.forEach(record => {
    record.weaknesses.forEach(weakness => {
      weaknessCount[weakness] = (weaknessCount[weakness] || 0) + 1;
    });
  });

  return Object.entries(weaknessCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area);
}
