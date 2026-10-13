from typing import List, Optional, Union, Dict, Any, Tuple
from pydantic import BaseModel, Field

# Common Citation schema
class CitationSchema(BaseModel):
    source_id: str
    source_title: str
    source_type: str = "pdf"
    page_number: Optional[int] = None
    slide_number: Optional[int] = None
    start_seconds: Optional[int] = None
    end_seconds: Optional[int] = None
    timestamp_label: Optional[str] = None
    excerpt: str
    section_heading: Optional[str] = None

# Chat / Tutor
class ChatRequest(BaseModel):
    query: str
    notebook_id: Optional[str] = None
    source_ids: Optional[List[str]] = None
    topicScope: Optional[str] = None
    language: Optional[str] = "en"
    mode: Optional[str] = "explain" # explain | quiz_me | summarize
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    citations: List[CitationSchema] = []
    grounding_status: str = "backed" # backed | partial | outside
    outside_knowledge: Optional[str] = None
    topic: Optional[str] = None
    suggested_followups: List[str] = []

# Questions & Quizzes
class DistractorMisconception(BaseModel):
    option: str
    misconception: str

class QuestionSchema(BaseModel):
    id: str
    topic: str
    difficulty: str = "medium" # easy, medium, hard
    type: str = "mcq" # mcq, short_answer, numerical
    question: str
    options: Optional[List[str]] = None
    correctAnswer: Union[str, int, float]
    acceptableTolerance: Optional[float] = None
    unit: Optional[str] = None
    explanation: str
    misconceptions: Optional[List[DistractorMisconception]] = None
    citation: CitationSchema

class QuizGenerateRequest(BaseModel):
    notebook_id: Optional[str] = None
    topics: Optional[List[str]] = None
    topic_ids: Optional[List[str]] = None
    difficulty: Optional[str] = "adaptive"
    types: Optional[List[str]] = None
    count: int = 5
    timedMode: Optional[bool] = False
    timeLimitMinutes: Optional[int] = None
    mode: Optional[str] = "practice" # practice, exam, diagnostic

class QuizSchema(BaseModel):
    id: str
    title: str
    courseId: str = "cs-201-dsa"
    topics: List[str]
    difficulty: str = "adaptive"
    mode: str = "practice"
    timeLimitMinutes: Optional[int] = None
    questions: List[QuestionSchema]
    createdAt: str

class QuizAttemptAnswer(BaseModel):
    questionId: str
    userAnswer: str
    isCorrect: bool
    timeSpentSeconds: int = 0
    flagged: Optional[bool] = False
    identifiedMisconception: Optional[str] = None

class QuizSubmitRequest(BaseModel):
    quiz: Optional[QuizSchema] = None
    answers: List[QuizAttemptAnswer]
    timeTakenSeconds: int = 0

class TopicStat(BaseModel):
    correct: int
    total: int
    score: int

class MasteryDelta(BaseModel):
    before: float
    after: float

class MisconceptionItem(BaseModel):
    topic: str
    misconception: str
    count: int

class QuizResult(BaseModel):
    quizId: str
    quizTitle: str
    score: int
    totalQuestions: int
    percentage: int
    completedAt: str
    timeTakenSeconds: int
    mode: str
    topicBreakdown: Dict[str, TopicStat]
    userAnswers: List[QuizAttemptAnswer]
    masteryChanges: Dict[str, MasteryDelta]
    rootCauseInsights: List[str]
    likelyMisconceptions: List[MisconceptionItem]
    recommendedTopics: List[str]

# Mastery & Progress
class TopicMasterySchema(BaseModel):
    topic: str
    mastery: float
    lastPracticed: str
    attemptsCount: int
    correctRate: float
    decayStatus: str = "fresh" # fresh, due, critical
    confidenceInterval: Tuple[float, float]
    prerequisites: List[str] = []

class LearnerProgressResponse(BaseModel):
    masteries: Dict[str, TopicMasterySchema]
    overallMastery: float
    weakestTopics: List[TopicMasterySchema]
    strongestTopics: List[TopicMasterySchema]
    recentScores: List[Dict[str, Any]]

class NextRecommendationResponse(BaseModel):
    topic: str
    title: str
    estimatedMinutes: int
    reason: str
    prerequisiteNote: str

# Sources
class SourceUnit(BaseModel):
    number: int
    label: str
    title: str
    text: str
    topics: List[str] = []
    diagramTitle: Optional[str] = None
    diagramDescription: Optional[str] = None
    timestampSec: Optional[int] = None

class SourceContent(BaseModel):
    units: List[SourceUnit] = []

class SourceDocumentSchema(BaseModel):
    id: str
    title: str
    type: str # pdf, pptx, video
    fileSize: str
    unitCount: int
    unitType: str # pages, slides, minutes
    topics: List[str] = []
    uploadDate: str
    status: str # ready, processing, indexed, etc.
    description: str
    content: SourceContent = SourceContent(units=[])
    progressPct: Optional[int] = 100
    errorMessage: Optional[str] = None

# Evaluation
class SystemMetricSchema(BaseModel):
    metric: str
    value: str
    benchmark: str
    description: str
    category: str # RAGAS, Grounding, Learner Model

# Auth & User
class UserProfileSchema(BaseModel):
    id: str
    name: str
    email: str
    currentCourse: str
    examDate: Optional[str] = None
    studyGoalHoursWeekly: int = 10
    preferredLanguage: str = "en"
    theme: str = "system"
    streakDays: int = 4
    onboardingCompleted: bool = True

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = "Student"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileSchema

# Flashcards
class FlashcardSchema(BaseModel):
    id: str
    topic: str
    question: str
    answer: str
    citation: CitationSchema
    difficulty: str
    lastReviewed: Optional[str] = None
    state: str = "new"

# Studio Generate Request
class StudioGenerateRequest(BaseModel):
    notebook_id: Optional[str] = None
    source_ids: Optional[List[str]] = None
    kind: str # summary | study_guide | faq | revision_notes | flashcards | mind_map | briefing | report

# Focus Session
class FocusSessionCreate(BaseModel):
    planned_minutes: int = 25
    focused_minutes: int = 25
    subject: str = "General Study"
    tab_blur_count: int = 0
    completed: bool = True
