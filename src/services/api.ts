import {
  Citation,
  GroundingStatus,
  Question,
  Quiz,
  QuizAttemptAnswer,
  QuizResult,
  SourceDocument,
  TopicMastery,
  SystemMetric,
} from '../types';
import {
  MOCK_SOURCES,
  TOPICS,
  QUESTION_BANK,
  CANNED_CHAT_RESPONSES,
  INITIAL_TOPIC_MASTERY,
  SCHEDULE_PLAN,
  SYSTEM_EVALUATION_METRICS,
  COURSE_ID,
  PREREQUISITE_EDGES,
} from '../data/mockData';

// Configurable endpoint switch
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('studysphere_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Helper: load persisted topic masteries
export function getPersistedMasteries(): Record<string, TopicMastery> {
  try {
    const raw = localStorage.getItem('studysphere_masteries');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading masteries from localStorage', e);
  }
  return { ...INITIAL_TOPIC_MASTERY };
}

export function savePersistedMasteries(masteries: Record<string, TopicMastery>): void {
  try {
    localStorage.setItem('studysphere_masteries', JSON.stringify(masteries));
  } catch (e) {
    console.error('Error saving masteries', e);
  }
}

/**
 * Update mastery using exponential moving average (EMA) or BKT
 */
export function updateMasteriesFromQuiz(
  topicBreakdown: Record<string, { correct: number; total: number; score: number }>,
  currentMasteries: Record<string, TopicMastery>
): { updatedMasteries: Record<string, TopicMastery>; changes: Record<string, { before: number; after: number }> } {
  const updated = { ...currentMasteries };
  const changes: Record<string, { before: number; after: number }> = {};

  Object.entries(topicBreakdown).forEach(([topic, stats]) => {
    const existing = updated[topic] || {
      topic,
      mastery: 0.5,
      lastPracticed: 'Just now',
      attemptsCount: 0,
      correctRate: 0.5,
      decayStatus: 'fresh',
      confidenceInterval: [0.4, 0.6],
      prerequisites: [],
    };

    const before = existing.mastery;
    const sessionAccuracy = stats.total > 0 ? stats.correct / stats.total : 0.5;

    const alpha = 0.25;
    const newMastery = Math.min(0.98, Math.max(0.1, Number((before * (1 - alpha) + sessionAccuracy * alpha).toFixed(2))));

    updated[topic] = {
      ...existing,
      mastery: newMastery,
      lastPracticed: 'Just now',
      attemptsCount: existing.attemptsCount + stats.total,
      correctRate: Number(((existing.correctRate * existing.attemptsCount + stats.correct) / (existing.attemptsCount + stats.total)).toFixed(2)),
      decayStatus: newMastery < 0.4 ? 'critical' : newMastery < 0.65 ? 'due' : 'fresh',
      confidenceInterval: [
        Math.max(0.05, Number((newMastery - 0.08).toFixed(2))),
        Math.min(0.99, Number((newMastery + 0.08).toFixed(2))),
      ],
    };

    changes[topic] = { before, after: newMastery };
  });

  savePersistedMasteries(updated);
  return { updatedMasteries: updated, changes };
}

export interface ChatRequest {
  query: string;
  topicScope?: string;
  language?: 'en' | 'hi';
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
  grounding_status: GroundingStatus;
  outside_knowledge?: string;
  topic?: string;
  suggested_followups?: string[];
}

export interface QuizGenerateRequest {
  topics?: string[];
  difficulty?: 'easy' | 'medium' | 'hard' | 'adaptive';
  types?: ('mcq' | 'short_answer' | 'numerical')[];
  count: number;
  timedMode?: boolean;
  timeLimitMinutes?: number;
  mode?: 'practice' | 'exam' | 'diagnostic';
}

export const api = {
  // GET /api/sources
  async getSources(): Promise<SourceDocument[]> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sources`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) return data;
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to cached sources:', e);
      }
    }
    await delay(200);
    try {
      const stored = localStorage.getItem('studysphere_sources');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return MOCK_SOURCES;
  },

  // POST /api/sources/upload
  async uploadSource(file: File | { name: string; size: number; type: string }): Promise<SourceDocument> {
    if (!USE_MOCKS) {
      try {
        const formData = new FormData();
        if (file instanceof File) {
          formData.append('file', file);
        } else {
          const dummyBlob = new Blob(['Sample uploaded document content for indexing.'], { type: 'text/plain' });
          formData.append('file', dummyBlob, file.name);
        }

        const token = localStorage.getItem('studysphere_token');
        const res = await fetch(`${API_BASE_URL}/api/sources/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend upload unavailable, using local simulation:', e);
      }
    }

    await delay(400);
    const ext = file.name.split('.').pop()?.toLowerCase();
    const sourceType = ext === 'pptx' ? 'pptx' : ext === 'mp4' ? 'video' : 'pdf';
    const newDoc: SourceDocument = {
      id: `src-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      type: sourceType,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      unitCount: sourceType === 'video' ? 35 : sourceType === 'pptx' ? 24 : 48,
      unitType: sourceType === 'video' ? 'minutes' : sourceType === 'pptx' ? 'slides' : 'pages',
      topics: ['Trees', 'Recursion'],
      uploadDate: 'Today',
      status: 'ready',
      description: `Uploaded source document containing syllabus materials for Data Structures & Algorithms.`,
      content: {
        units: [
          {
            number: 1,
            label: sourceType === 'video' ? '00:00' : 'Page 1',
            title: 'Uploaded Material Overview',
            text: 'Extracted content from student uploaded material. Fully indexed for vector citations and grounded QA verification.',
            topics: ['Trees', 'Recursion'],
          },
        ],
      },
    };

    const current = await this.getSources();
    const updated = [newDoc, ...current];
    try {
      localStorage.setItem('studysphere_sources', JSON.stringify(updated));
    } catch (e) {}
    return newDoc;
  },

  // POST /api/chat
  async sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(req),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend chat unavailable, falling back to mock response:', e);
      }
    }

    await delay(400);
    const normalized = req.query.trim().toLowerCase();

    for (const [key, response] of Object.entries(CANNED_CHAT_RESPONSES)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        let content = response.content;
        if (req.language === 'hi') {
          content = `[हिंदी व्याख्या]: ` + content + `\n\n(यह स्पष्टीकरण आपके अध्ययन सामग्री के उद्धरणों [1] से सीधे प्रमाणित है)`;
        }
        return {
          answer: content,
          citations: response.citations,
          grounding_status: response.grounding_status,
          outside_knowledge: response.outside_knowledge,
          topic: response.topic,
        };
      }
    }

    if (normalized.includes('tree') || normalized.includes('traversal')) {
      return {
        answer: CANNED_CHAT_RESPONSES['how does postorder traversal work'].content,
        citations: CANNED_CHAT_RESPONSES['how does postorder traversal work'].citations,
        grounding_status: 'backed',
        topic: 'Trees',
      };
    }

    if (normalized.includes('recur') || normalized.includes('stack')) {
      return {
        answer: CANNED_CHAT_RESPONSES['why does recursion cause stack overflow'].content,
        citations: CANNED_CHAT_RESPONSES['why does recursion cause stack overflow'].citations,
        grounding_status: 'backed',
        topic: 'Recursion',
      };
    }

    if (normalized.includes('search') || normalized.includes('binary')) {
      return {
        answer: CANNED_CHAT_RESPONSES['explain binary search'].content,
        citations: CANNED_CHAT_RESPONSES['explain binary search'].citations,
        grounding_status: 'backed',
        topic: 'Binary Search',
      };
    }

    return {
      answer: `This topic is not present in your uploaded course materials for Data Structures & Algorithms. To preserve factual integrity, StudySphere AI does not generate ungrounded answers. Please ask questions related to Arrays, Recursion, Trees, Graphs, Sorting, Hashing, or Dynamic Programming.`,
      grounding_status: 'outside',
      citations: [],
      outside_knowledge: 'The requested topic was evaluated against all indexed textbook pages, lecture slides, and video transcripts without discovering matching semantic embeddings.',
    };
  },

  // GET /api/courses/{id}/topics
  async getCourseTopics(courseId: string = COURSE_ID): Promise<{ topics: readonly string[]; prerequisites: typeof PREREQUISITE_EDGES }> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/topics`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend topics unavailable:', e);
      }
    }
    await delay(150);
    return {
      topics: TOPICS,
      prerequisites: PREREQUISITE_EDGES,
    };
  },

  // POST /api/quizzes/diagnostic
  async generateDiagnosticQuiz(): Promise<Quiz> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quizzes/diagnostic`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend diagnostic quiz unavailable:', e);
      }
    }

    await delay(300);
    const selectedIds = ['q-arr-01', 'q-rec-01', 'q-bs-01', 'q-tree-01', 'q-dp-01'];
    const questions = selectedIds
      .map((id) => QUESTION_BANK.find((q) => q.id === id))
      .filter((q): q is Question => q !== undefined);

    return {
      id: `quiz-diag-${Date.now()}`,
      title: 'Course Diagnostic Assessment (5 Questions)',
      courseId: COURSE_ID,
      topics: ['Arrays', 'Recursion', 'Binary Search', 'Trees', 'Dynamic Programming'],
      difficulty: 'adaptive',
      mode: 'diagnostic',
      timeLimitMinutes: 10,
      questions,
      createdAt: new Date().toISOString(),
    };
  },

  // POST /api/quizzes/generate
  async generateQuiz(req: QuizGenerateRequest): Promise<Quiz> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quizzes/generate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(req),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend generate quiz unavailable:', e);
      }
    }

    await delay(400);
    const chosenTopics = req.topics && req.topics.length > 0 ? req.topics : ['Trees', 'Recursion', 'Dynamic Programming'];
    let pool = QUESTION_BANK.filter((q) => chosenTopics.includes(q.topic));
    if (pool.length === 0) pool = QUESTION_BANK;

    if (req.difficulty && req.difficulty !== 'adaptive') {
      const diffMatches = pool.filter((q) => q.difficulty === req.difficulty);
      if (diffMatches.length >= req.count) pool = diffMatches;
    }

    if (req.types && req.types.length > 0) {
      const typeMatches = pool.filter((q) => req.types?.includes(q.type));
      if (typeMatches.length >= req.count) pool = typeMatches;
    }

    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const count = Math.min(req.count, shuffled.length);
    const selected = shuffled.slice(0, count);

    return {
      id: `quiz-${Date.now()}`,
      title: `${chosenTopics.join(', ')} Assessment`,
      courseId: COURSE_ID,
      topics: chosenTopics,
      difficulty: req.difficulty || 'adaptive',
      mode: req.mode || 'practice',
      timeLimitMinutes: req.timedMode ? req.timeLimitMinutes || 15 : undefined,
      questions: selected,
      createdAt: new Date().toISOString(),
    };
  },

  // POST /api/quizzes/{id}/submit
  async submitQuiz(quiz: Quiz, answers: QuizAttemptAnswer[], timeTakenSeconds: number): Promise<QuizResult> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/quizzes/${quiz.id}/submit`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ answers, timeTakenSeconds }),
        });
        if (res.ok) {
          const result: QuizResult = await res.json();
          // Sync persisted masteries
          if (result.masteryChanges) {
            const current = getPersistedMasteries();
            Object.entries(result.masteryChanges).forEach(([top, delta]) => {
              if (current[top]) {
                current[top].mastery = delta.after;
                current[top].lastPracticed = 'Just now';
                current[top].decayStatus = delta.after < 0.4 ? 'critical' : delta.after < 0.65 ? 'due' : 'fresh';
              }
            });
            savePersistedMasteries(current);
          }
          return result;
        }
      } catch (e) {
        console.warn('Backend submit quiz unavailable:', e);
      }
    }

    await delay(450);
    const total = quiz.questions.length;
    let correctCount = 0;
    const topicBreakdown: Record<string, { correct: number; total: number; score: number }> = {};
    const misconceptions: { topic: string; misconception: string; count: number }[] = [];

    quiz.questions.forEach((q) => {
      if (!topicBreakdown[q.topic]) {
        topicBreakdown[q.topic] = { correct: 0, total: 0, score: 0 };
      }
      topicBreakdown[q.topic].total += 1;

      const userAns = answers.find((a) => a.questionId === q.id);
      if (userAns) {
        if (userAns.isCorrect) {
          correctCount += 1;
          topicBreakdown[q.topic].correct += 1;
        } else if (userAns.identifiedMisconception) {
          const existing = misconceptions.find((m) => m.misconception === userAns.identifiedMisconception);
          if (existing) existing.count += 1;
          else misconceptions.push({ topic: q.topic, misconception: userAns.identifiedMisconception, count: 1 });
        }
      }
    });

    Object.keys(topicBreakdown).forEach((k) => {
      topicBreakdown[k].score = Math.round((topicBreakdown[k].correct / topicBreakdown[k].total) * 100);
    });

    const percentage = Math.round((correctCount / total) * 100);
    const currentMasteries = getPersistedMasteries();
    const { changes } = updateMasteriesFromQuiz(topicBreakdown, currentMasteries);

    const rootCauseInsights: string[] = [];
    if (topicBreakdown['Trees'] && topicBreakdown['Trees'].score < 60) {
      rootCauseInsights.push(
        'Your mistakes on Trees frequently correlate with call frame unwinding. The prerequisite Recursion is at 0.41 mastery. Strengthening recursive base-case formulation will directly improve your tree validation accuracy.'
      );
    }
    if (topicBreakdown['Dynamic Programming'] && topicBreakdown['Dynamic Programming'].score < 60) {
      rootCauseInsights.push(
        'Dynamic Programming struggles trace back to identifying overlapping recursive subproblems. Revisit Chapter 10.1 in your textbook before attempting bottom-up tabulation.'
      );
    }
    if (rootCauseInsights.length === 0 && percentage < 80) {
      rootCauseInsights.push('Review the cited source pages for missed questions in the question review below.');
    }

    const recommendedTopics = Object.entries(topicBreakdown)
      .filter(([_, stats]) => stats.score < 70)
      .map(([topic]) => topic);

    if (recommendedTopics.length === 0) {
      recommendedTopics.push('Trees', 'Dynamic Programming');
    }

    const result: QuizResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: correctCount,
      totalQuestions: total,
      percentage,
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeTakenSeconds,
      mode: quiz.mode,
      topicBreakdown,
      userAnswers: answers,
      masteryChanges: changes,
      rootCauseInsights,
      likelyMisconceptions: misconceptions,
      recommendedTopics,
    };

    try {
      const historyRaw = localStorage.getItem('studysphere_quiz_history');
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      history.unshift(result);
      localStorage.setItem('studysphere_quiz_history', JSON.stringify(history.slice(0, 10)));
    } catch (e) {}

    return result;
  },

  // GET /api/learner/{id}/progress
  async getLearnerProgress(): Promise<{
    masteries: Record<string, TopicMastery>;
    overallMastery: number;
    weakestTopics: TopicMastery[];
    strongestTopics: TopicMastery[];
    recentScores: { quizTitle: string; score: number; date: string }[];
  }> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/learner/usr-demo-01/progress`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend progress unavailable:', e);
      }
    }

    await delay(200);
    const masteries = getPersistedMasteries();
    const list = Object.values(masteries);
    const overallMastery = Number(
      (list.reduce((acc, curr) => acc + curr.mastery, 0) / list.length).toFixed(2)
    );
    const sorted = [...list].sort((a, b) => a.mastery - b.mastery);

    return {
      masteries,
      overallMastery,
      weakestTopics: sorted.slice(0, 3),
      strongestTopics: sorted.slice(-3).reverse(),
      recentScores: [
        { quizTitle: 'Arrays & Sorting Practice', score: 92, date: 'Oct 08' },
        { quizTitle: 'Binary Search Invariants', score: 85, date: 'Oct 09' },
        { quizTitle: 'Recursion Call Stack Quiz', score: 55, date: 'Oct 10' },
        { quizTitle: 'Trees & BST Traversal', score: 40, date: 'Oct 10' },
      ],
    };
  },

  // GET /api/learner/{id}/next
  async getNextRecommendation(): Promise<{
    topic: string;
    title: string;
    estimatedMinutes: number;
    reason: string;
    prerequisiteNote: string;
  }> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/learner/usr-demo-01/next`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend recommendation unavailable:', e);
      }
    }

    await delay(150);
    return {
      topic: 'Recursion & Trees',
      title: 'Practice Trees and Recursion Prerequisite',
      estimatedMinutes: 12,
      reason: 'Mastery 0.32 on Trees, last practised 5 days ago (decay state: critical).',
      prerequisiteNote: 'Root-cause analysis: Errors on Trees stem from Recursion (mastery 0.41). Starting with recursive stack tracing will yield the fastest mastery gains.',
    };
  },

  // GET /api/evaluation/metrics
  async getSystemEvaluation(): Promise<SystemMetric[]> {
    if (!USE_MOCKS) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/evaluation/metrics`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('Backend evaluation unavailable:', e);
      }
    }

    await delay(150);
    return SYSTEM_EVALUATION_METRICS;
  },

  // Voice Assistant API
  async transcribeAudio(file: Blob): Promise<{ text: string; duration: number; language: string }> {
    const formData = new FormData();
    formData.append('file', file, 'recording.webm');
    const res = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Transcription failed');
    return await res.json();
  },

  async speakText(text: string, voice?: string, language?: string): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/api/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, language }),
    });
    if (!res.ok) throw new Error('Speech synthesis failed');
    return await res.blob();
  },

  async sendVoiceTurn(file: Blob, notebookId?: string, language?: string): Promise<{
    transcript: string;
    answer: string;
    citations: Citation[];
    grounding_status: GroundingStatus;
    outside_knowledge?: string;
    audio_url: string;
  }> {
    const formData = new FormData();
    formData.append('file', file, 'voice_turn.webm');
    if (notebookId) formData.append('notebook_id', notebookId);
    if (language) formData.append('language', language);

    const token = localStorage.getItem('studysphere_token');
    const res = await fetch(`${API_BASE_URL}/api/voice/turn`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error('Voice turn failed');
    return await res.json();
  },

  async getVoices(): Promise<{ id: string; name: string; language: string; gender: string }[]> {
    const res = await fetch(`${API_BASE_URL}/api/voice/voices`);
    if (!res.ok) return [];
    return await res.json();
  },
};
