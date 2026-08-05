export type DepthMode = 'sprint' | 'standard' | 'deep';
export type UploadMode = 'unified' | 'per_document';

export interface SourceFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx';
  size: number;
  rawTextPreview?: string;
  uploadedAt: string;
}

export interface TeachingCard {
  id?: string;
  title: string;
  badge?: string;
  content: string;
  keyTakeaway?: string;
  example?: string;
}

export interface Question {
  id?: string;
  type: 'mcq' | 'short_answer';
  prompt: string;
  options?: string[];
  correctAnswerIndex?: number;
  correctAnswerText?: string;
  correctAnswer?: string;
  explanation?: string;
  modelAnswer?: string;
  keywords?: string[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  pathId: string;
  title: string;
  description: string;
  xpValue: number;
  estimatedMinutes: number;
  cards: TeachingCard[];
  questions: Question[];
  completed: boolean;
  score?: number;
  completedAt?: string;
}

export interface Section {
  id: string;
  pathId: string;
  title: string;
  description: string;
  sourceFileName?: string;
  lessons: Lesson[];
}

export interface StudyPath {
  id: string;
  userId: string;
  title: string;
  description: string;
  depthMode: DepthMode;
  uploadMode: UploadMode;
  sourceFiles: SourceFile[];
  sections: Section[];
  totalLessons: number;
  completedLessons: number;
  xpEarned: number;
  isActive: boolean;
  createdAt: string;
  lastStudiedAt?: string;
}

export interface StudyMistake {
  id: string;
  pathId: string;
  lessonId: string;
  questionType: 'mcq' | 'short_answer';
  questionPrompt: string;
  options?: string[];
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  createdAt: string;
}

export interface StudyStats {
  totalXp: number;
  streakCount: number;
  longestStreak: number;
  lastStudiedDate?: string;
  activeDays: string[];
}
