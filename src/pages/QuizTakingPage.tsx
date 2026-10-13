import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../services/api';
import {
  Clock,
  Flag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  FileText,
  Presentation,
  Video,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge, ProgressBar } from '../components/ui/Card';
import { CitationChip } from '../components/tutor/CitationChip';
import { Quiz, QuizAttemptAnswer } from '../types';
import { QUESTION_BANK } from '../data/mockData';

export const QuizTakingPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { setLastQuizResult, showToast } = useApp();

  const [quiz, setQuiz] = useState<Quiz | null>(() => {
    try {
      const stored = sessionStorage.getItem(`quiz_${quizId}`);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Fallback default practice quiz
    return {
      id: quizId || 'quiz-fallback',
      title: 'Trees & Recursion Practice',
      courseId: 'cs-201-dsa',
      topics: ['Trees', 'Recursion'],
      difficulty: 'adaptive',
      mode: 'practice',
      timeLimitMinutes: 10,
      questions: QUESTION_BANK.slice(0, 5),
      createdAt: new Date().toISOString(),
    };
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(() => {
    return (quiz?.timeLimitMinutes || 10) * 60;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (!quiz?.timeLimitMinutes) return;
    const interval = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  const questions = quiz?.questions || [];
  const currentQ = questions[currentIndex];
  const isPracticeMode = quiz?.mode === 'practice';
  const isQuestionSubmitted = submittedQuestions[currentQ?.id];

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQ) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // 1-4 for MCQ options
      if (currentQ.type === 'mcq' && currentQ.options) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= currentQ.options.length) {
          handleSelectAnswer(currentQ.options[num - 1]);
        }
      }

      // Left and Right arrows
      if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQ, currentIndex, questions.length]);

  const handleSelectAnswer = (ans: string) => {
    if (isPracticeMode && isQuestionSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: ans }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitCurrentPractice = () => {
    if (!userAnswers[currentQ.id]) {
      showToast('Please select or input an answer first', 'info');
      return;
    }
    setSubmittedQuestions((prev) => ({ ...prev, [currentQ.id]: true }));
  };

  const handleFinalSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);

    const answersList: QuizAttemptAnswer[] = quiz.questions.map((q) => {
      const userAns = userAnswers[q.id] || '';
      let isCorrect = false;

      if (q.type === 'mcq') {
        isCorrect = userAns.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
      } else if (q.type === 'numerical') {
        const userNum = parseFloat(userAns);
        const correctNum = Number(q.correctAnswer);
        const tolerance = q.acceptableTolerance || 0;
        isCorrect = Math.abs(userNum - correctNum) <= tolerance;
      } else {
        // Short answer keyword match
        isCorrect = userAns.length > 15;
      }

      // Check if distractor maps to misconception
      let misconception: string | undefined;
      if (!isCorrect && q.misconceptions) {
        const match = q.misconceptions.find((m) => m.option === userAns);
        if (match) misconception = match.misconception;
      }

      return {
        questionId: q.id,
        userAnswer: userAns,
        isCorrect,
        timeSpentSeconds: 45,
        flagged: flaggedQuestions[q.id] || false,
        identifiedMisconception: misconception,
      };
    });

    const timeSpent = (quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : 600) - timeRemainingSeconds;

    try {
      const result = await api.submitQuiz(quiz, answersList, Math.max(30, timeSpent));
      setLastQuizResult(result);
      navigate(`/app/quiz/${quiz.id}/results`);
    } catch (e) {
      showToast('Error recording assessment results', 'attention');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz || !currentQ) {
    return <div className="p-8 text-center">Loading assessment...</div>;
  }

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Quiz Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-border/70">
        <div>
          <span className="text-[10px] font-mono uppercase text-muted font-bold tracking-wider">
            {quiz.mode.toUpperCase()} ASSESSMENT
          </span>
          <h1 className="text-base font-semibold text-main truncate max-w-sm sm:max-w-md">
            {quiz.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {quiz.timeLimitMinutes && (
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 ${
              timeRemainingSeconds < 120
                ? 'bg-attention/15 border-attention text-attention animate-pulse'
                : 'bg-surface border-border text-main'
            }`}>
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemainingSeconds)}</span>
            </div>
          )}

          <Button
            variant="attention"
            size="sm"
            onClick={handleFinalSubmit}
            isLoading={isSubmitting}
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Progress & Navigator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span className="font-mono">{answeredCount} of {questions.length} answered</span>
        </div>
        <ProgressBar value={currentIndex + 1} max={questions.length} size="sm" color="accent" />

        {/* Quick Navigator Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {questions.map((q, idx) => {
            const isAnswered = !!userAnswers[q.id];
            const isCurrent = idx === currentIndex;
            const isFlagged = flaggedQuestions[q.id];

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-accent text-accent-fg font-bold shadow-xs'
                    : isAnswered
                    ? 'bg-accent-subtle text-accent border border-accent/30'
                    : 'bg-surface border border-border text-muted hover:text-main'
                }`}
              >
                {idx + 1}
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-attention" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Card */}
      <Card variant="default" className="space-y-6 p-6 sm:p-8">
        {/* Question Header: Tags */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              {currentQ.topic}
            </Badge>
            <Badge variant="neutral" size="sm" className="capitalize font-mono">
              {currentQ.difficulty}
            </Badge>
            <span className="text-[11px] text-muted font-mono uppercase">
              {currentQ.type.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Source Origin Location Tag */}
            <span className="text-[11px] font-mono text-muted flex items-center gap-1 bg-surface px-2 py-1 rounded border border-border">
              {currentQ.citation.source_type === 'pdf' && <FileText className="w-3 h-3 text-accent" />}
              {currentQ.citation.source_type === 'pptx' && <Presentation className="w-3 h-3 text-accent" />}
              {currentQ.citation.source_type === 'video' && <Video className="w-3 h-3 text-accent" />}
              <span>
                {currentQ.citation.page_number && `Page ${currentQ.citation.page_number}`}
                {currentQ.citation.slide_number && `Slide ${currentQ.citation.slide_number}`}
                {currentQ.citation.timestamp_label && `${currentQ.citation.timestamp_label}`}
              </span>
            </span>

            {/* Flag for review button */}
            <button
              onClick={handleToggleFlag}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1 transition-colors ${
                flaggedQuestions[currentQ.id]
                  ? 'bg-attention/15 border-attention text-attention font-medium'
                  : 'bg-surface border-border text-muted hover:text-main'
              }`}
              title="Flag for review"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-base font-medium text-main leading-relaxed">
          {currentQ.question}
        </div>

        {/* Input area by question type */}
        {currentQ.type === 'mcq' && currentQ.options && (
          <div className="space-y-2.5">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = userAnswers[currentQ.id] === option;
              const isCorrectOpt = String(currentQ.correctAnswer) === option;

              let optionColor = 'bg-card border-border hover:border-accent/40 text-main';
              if (isSelected) {
                optionColor = 'bg-accent-subtle border-accent text-accent font-semibold';
              }
              if (isPracticeMode && isQuestionSubmitted) {
                if (isCorrectOpt) {
                  optionColor = 'bg-accent-subtle border-accent text-accent font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  optionColor = 'bg-attention/15 border-attention text-attention';
                }
              }

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectAnswer(option)}
                  disabled={isPracticeMode && isQuestionSubmitted}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${optionColor}`}
                >
                  <span className="w-5 h-5 rounded-full bg-surface border border-border text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {optIdx + 1}
                  </span>
                  <span className="text-xs leading-relaxed flex-1">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'numerical' && (
          <div className="space-y-3 max-w-sm">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Numerical Input ({currentQ.unit || 'value'})
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={userAnswers[currentQ.id] || ''}
                onChange={(e) => handleSelectAnswer(e.target.value)}
                disabled={isPracticeMode && isQuestionSubmitted}
                placeholder="Enter computed integer or decimal..."
                className="w-full px-3.5 py-2 text-sm bg-surface border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-accent font-mono"
              />
              {currentQ.unit && (
                <span className="text-xs font-mono text-muted">{currentQ.unit}</span>
              )}
            </div>
          </div>
        )}

        {currentQ.type === 'short_answer' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Conceptual Explanation
            </label>
            <textarea
              rows={4}
              value={userAnswers[currentQ.id] || ''}
              onChange={(e) => handleSelectAnswer(e.target.value)}
              disabled={isPracticeMode && isQuestionSubmitted}
              placeholder="State your answer with algorithmic rationale..."
              className="w-full p-3 text-xs bg-surface border border-border rounded-xl text-main focus:outline-none focus:ring-2 focus:ring-accent leading-relaxed"
            />
          </div>
        )}

        {/* Immediate Cited Feedback in Practice Mode */}
        {isPracticeMode && isQuestionSubmitted && (
          <div className="p-4 rounded-xl bg-surface border border-border space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Cited Syllabus Feedback
              </span>
              <span className="text-xs font-mono text-muted">
                Correct: {String(currentQ.correctAnswer)}
              </span>
            </div>

            <p className="text-xs text-main leading-relaxed">
              {currentQ.explanation}
            </p>

            <div className="pt-2 border-t border-border flex items-center gap-2">
              <span className="text-[11px] text-muted font-mono">Source Origin:</span>
              <CitationChip citation={currentQ.citation} />
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {isPracticeMode && !isQuestionSubmitted ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitCurrentPractice}
                disabled={!userAnswers[currentQ.id]}
              >
                Check Answer
              </Button>
            ) : currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentIndex(currentIndex + 1)}
              >
                Next Question
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="attention"
                size="sm"
                onClick={handleFinalSubmit}
                isLoading={isSubmitting}
              >
                Finish & View Report
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
