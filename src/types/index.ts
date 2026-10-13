export type SourceType = 'pdf' | 'pptx' | 'video';

export interface Citation {
  source_id: string;
  source_title: string;
  source_type: SourceType;
  page_number?: number;
  slide_number?: number;
  start_seconds?: number;
  end_seconds?: number;
  timestamp_label?: string;
  excerpt: string;
  section_heading?: string;
}

export type GroundingStatus = 'backed' | 'partial' | 'outside';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  grounding_status?: GroundingStatus;
  outside_knowledge?: string;
  topic?: string;
  timestamp: string;
  feedback?: 'helpful' | 'unhelpful';
}

export type QuestionType = 'mcq' | 'short_answer' | 'numerical';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DistractorMisconception {
  option: string;
  misconception: string;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  acceptableTolerance?: number; // for numerical
  unit?: string;
  explanation: string;
  misconceptions?: DistractorMisconception[];
  citation: Citation;
}

export interface QuizAttemptAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  flagged?: boolean;
  identifiedMisconception?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  topics: string[];
  difficulty: DifficultyLevel | 'adaptive';
  mode: 'practice' | 'exam' | 'diagnostic';
  timeLimitMinutes?: number;
  questions: Question[];
  createdAt: string;
}

export interface QuizResult {
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  timeTakenSeconds: number;
  mode: 'practice' | 'exam' | 'diagnostic';
  topicBreakdown: Record<string, { correct: number; total: number; score: number }>;
  userAnswers: QuizAttemptAnswer[];
  masteryChanges: Record<string, { before: number; after: number }>;
  rootCauseInsights: string[];
  likelyMisconceptions: { topic: string; misconception: string; count: number }[];
  recommendedTopics: string[];
}

export interface TopicMastery {
  topic: string;
  mastery: number; // 0.0 - 1.0
  lastPracticed: string;
  attemptsCount: number;
  correctRate: number;
  decayStatus: 'fresh' | 'due' | 'critical';
  confidenceInterval: [number, number];
  prerequisites: string[];
}

export interface SourceDocument {
  id: string;
  title: string;
  type: SourceType;
  fileSize: string;
  unitCount: number; // pages, slides, or minutes
  unitType: 'pages' | 'slides' | 'minutes';
  topics: string[];
  uploadDate: string;
  status: 'ready' | 'processing' | 'indexed';
  description: string;
  content: {
    units: {
      number: number;
      label: string;
      title: string;
      text: string;
      topics: string[];
      diagramTitle?: string;
      diagramDescription?: string;
      timestampSec?: number;
    }[];
  };
}

export interface Flashcard {
  id: string;
  topic: string;
  question: string;
  answer: string;
  citation: Citation;
  difficulty: DifficultyLevel;
  lastReviewed?: string;
  state: 'new' | 'reviewing' | 'mastered';
}

export interface ScheduleSession {
  id: string;
  day: string;
  date: string;
  title: string;
  topic: string;
  durationMinutes: number;
  type: 'new_practice' | 'revision';
  completed: boolean;
  priorityReason: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currentCourse: string;
  examDate?: string;
  studyGoalHoursWeekly: number;
  preferredLanguage: 'en' | 'hi';
  theme: 'light' | 'dark' | 'system';
  streakDays: number;
  onboardingCompleted: boolean;
}

export interface SystemMetric {
  metric: string;
  value: string;
  benchmark: string;
  description: string;
  category: 'RAGAS' | 'Grounding' | 'Learner Model';
}
