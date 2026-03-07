// Test History Firestore Service
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth } from '../lib/firebase';

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
}

// Save a new test record
export async function saveTestRecord(record: Omit<TestRecord, 'id'>): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const docRef = await addDoc(collection(db, 'testRecords'), {
    ...record,
    userId: user.uid,
    testDate: record.testDate.toISOString(),
  });

  return docRef.id;
}

// Get all test records for current user
export async function getTestRecords(): Promise<TestRecord[]> {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, 'testRecords'),
    where('userId', '==', user.uid),
    orderBy('testDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    testDate: doc.data().testDate.toDate ? doc.data().testDate.toDate() : new Date(doc.data().testDate)
  })) as TestRecord[];
}

// Get a single test record by ID
export async function getTestRecord(id: string): Promise<TestRecord | null> {
  const docRef = doc(db, 'testRecords', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      testDate: docSnap.data().testDate.toDate ? docSnap.data().testDate.toDate() : new Date(docSnap.data().testDate)
    } as TestRecord;
  }
  return null;
}

// Delete a test record
export async function deleteTestRecord(id: string): Promise<void> {
  const docRef = doc(db, 'testRecords', id);
  await deleteDoc(docRef);
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

  const q = query(
    collection(db, 'practiceRecords'),
    where('userId', '==', user.uid),
    orderBy('practiceDate', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    practiceDate: doc.data().practiceDate.toDate ? doc.data().practiceDate.toDate() : new Date(doc.data().practiceDate)
  })) as PracticeRecord[];
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
