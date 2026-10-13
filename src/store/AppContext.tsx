import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  TopicMastery,
  SourceDocument,
  ChatMessage,
  Citation,
  Flashcard,
  ScheduleSession,
  QuizResult,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_TOPIC_MASTERY,
  MOCK_SOURCES,
  FLASHCARDS,
  SCHEDULE_PLAN,
  CANNED_CHAT_RESPONSES,
} from '../data/mockData';
import { getPersistedMasteries, savePersistedMasteries } from '../services/api';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'attention' | 'info';
}

interface AppContextType {
  user: UserProfile | null;
  theme: 'light' | 'dark' | 'system';
  resolvedTheme: 'light' | 'dark';
  masteries: Record<string, TopicMastery>;
  sources: SourceDocument[];
  chatMessages: ChatMessage[];
  flashcards: Flashcard[];
  schedule: ScheduleSession[];
  activeDrawerCitation: Citation | null;
  toasts: ToastMessage[];
  lastQuizResult: QuizResult | null;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  login: (email: string, name?: string) => void;
  logout: () => void;
  updateUser: (fields: Partial<UserProfile>) => void;
  refreshMasteries: () => void;
  resetDemoData: () => void;
  addSource: (source: SourceDocument) => void;
  deleteSource: (id: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  openSourceDrawer: (citation: Citation) => void;
  closeSourceDrawer: () => void;
  updateFlashcardState: (id: string, state: 'new' | 'reviewing' | 'mastered') => void;
  toggleScheduleItem: (id: string) => void;
  setLastQuizResult: (result: QuizResult | null) => void;
  showToast: (message: string, type?: 'success' | 'attention' | 'info') => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('studysphere_theme');
    return (saved as 'light' | 'dark' | 'system') || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Sync resolved theme with DOM
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setThemeState(newTheme);
    localStorage.setItem('studysphere_theme', newTheme);
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  // Auth session
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('studysphere_user');
      if (saved) return JSON.parse(saved);
      // Pre-seed with demo user on initial load for convenient exploration
      return INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const login = (email: string, name?: string) => {
    const newUser: UserProfile = {
      ...INITIAL_USER,
      email,
      name: name || (email.startsWith('demo') ? 'Alex Rivera' : email.split('@')[0]),
    };
    setUser(newUser);
    localStorage.setItem('studysphere_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('studysphere_user');
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    setUser(updated);
    localStorage.setItem('studysphere_user', JSON.stringify(updated));
  };

  // Masteries
  const [masteries, setMasteries] = useState<Record<string, TopicMastery>>(() => getPersistedMasteries());

  const refreshMasteries = useCallback(() => {
    setMasteries(getPersistedMasteries());
  }, []);

  // Sources
  const [sources, setSources] = useState<SourceDocument[]>(() => {
    try {
      const saved = localStorage.getItem('studysphere_sources');
      if (saved) return JSON.parse(saved);
    } catch {}
    return MOCK_SOURCES;
  });

  const addSource = (source: SourceDocument) => {
    const next = [source, ...sources];
    setSources(next);
    localStorage.setItem('studysphere_sources', JSON.stringify(next));
  };

  const deleteSource = (id: string) => {
    const next = sources.filter((s) => s.id !== id);
    setSources(next);
    localStorage.setItem('studysphere_sources', JSON.stringify(next));
  };

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `Hello Alex! I am your course tutor for **Data Structures & Algorithms**. I have indexed your textbook, lecture slides, and Prof. Vance's recorded lectures. Ask me any concept—every answer will cite the exact page, slide, or timestamp. If a question is outside your material, I will clearly flag it.`,
        grounding_status: 'backed',
        citations: [
          CANNED_CHAT_RESPONSES['explain binary search'].citations[0],
        ],
        timestamp: '10:00 AM',
      },
    ];
  });

  const addChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Chat history cleared. What topic from your course materials would you like to review today?',
        timestamp: 'Just now',
      },
    ]);
  };

  // Active drawer citation
  const [activeDrawerCitation, setActiveDrawerCitation] = useState<Citation | null>(null);

  const openSourceDrawer = (citation: Citation) => {
    setActiveDrawerCitation(citation);
  };

  const closeSourceDrawer = () => {
    setActiveDrawerCitation(null);
  };

  // Flashcards
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('studysphere_flashcards');
      if (saved) return JSON.parse(saved);
    } catch {}
    return FLASHCARDS;
  });

  const updateFlashcardState = (id: string, state: 'new' | 'reviewing' | 'mastered') => {
    setFlashcards((prev) => {
      const next = prev.map((fc) => (fc.id === id ? { ...fc, state, lastReviewed: 'Just now' } : fc));
      localStorage.setItem('studysphere_flashcards', JSON.stringify(next));
      return next;
    });
  };

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleSession[]>(() => {
    try {
      const saved = localStorage.getItem('studysphere_schedule');
      if (saved) return JSON.parse(saved);
    } catch {}
    return SCHEDULE_PLAN;
  });

  const toggleScheduleItem = (id: string) => {
    setSchedule((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item));
      localStorage.setItem('studysphere_schedule', JSON.stringify(next));
      return next;
    });
  };

  // Last quiz result
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(() => {
    try {
      const saved = localStorage.getItem('studysphere_last_quiz');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'attention' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetDemoData = () => {
    localStorage.removeItem('studysphere_masteries');
    localStorage.removeItem('studysphere_sources');
    localStorage.removeItem('studysphere_flashcards');
    localStorage.removeItem('studysphere_schedule');
    localStorage.removeItem('studysphere_last_quiz');
    localStorage.removeItem('studysphere_quiz_history');
    setMasteries(INITIAL_TOPIC_MASTERY);
    setSources(MOCK_SOURCES);
    setFlashcards(FLASHCARDS);
    setSchedule(SCHEDULE_PLAN);
    setLastQuizResult(null);
    showToast('Demo dataset reset to initial state', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        theme,
        resolvedTheme,
        masteries,
        sources,
        chatMessages,
        flashcards,
        schedule,
        activeDrawerCitation,
        toasts,
        lastQuizResult,
        setTheme,
        toggleTheme,
        login,
        logout,
        updateUser,
        refreshMasteries,
        resetDemoData,
        addSource,
        deleteSource,
        addChatMessage,
        clearChatHistory,
        openSourceDrawer,
        closeSourceDrawer,
        updateFlashcardState,
        toggleScheduleItem,
        setLastQuizResult,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
