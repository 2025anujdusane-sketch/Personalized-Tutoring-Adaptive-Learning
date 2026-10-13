import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Layers,
  Calendar,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge } from '../components/ui/Card';
import { CitationChip } from '../components/tutor/CitationChip';
import { QUESTION_BANK } from '../data/mockData';

export const QuizResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lastQuizResult, refreshMasteries } = useApp();

  // If no result in memory, use mock sample result for evaluation inspection
  const result = lastQuizResult || {
    quizId: 'quiz-sample',
    quizTitle: 'Trees & Recursion Assessment',
    score: 3,
    totalQuestions: 5,
    percentage: 60,
    completedAt: 'Just now',
    timeTakenSeconds: 312,
    mode: 'practice' as const,
    topicBreakdown: {
      'Trees': { correct: 1, total: 3, score: 33 },
      'Recursion': { correct: 2, total: 2, score: 100 },
    },
    userAnswers: [
      {
        questionId: 'q-tree-01',
        userAnswer: 'It causes an infinite loop during inorder traversal',
        isCorrect: false,
        timeSpentSeconds: 45,
        identifiedMisconception: 'Confuses BST value invariants with cyclic graph edge detection.',
      },
    ],
    masteryChanges: {
      'Trees': { before: 0.32, after: 0.36 },
      'Recursion': { before: 0.41, after: 0.48 },
    },
    rootCauseInsights: [
      'Your mistakes on Trees correlate directly with recursive call-frame unwinding. The prerequisite Recursion was at 0.41. Strengthening base-case formulation will directly repair tree validation accuracy.',
    ],
    likelyMisconceptions: [
      {
        topic: 'Trees',
        misconception: 'Confuses BST value invariants with cyclic graph edge detection.',
        count: 1,
      },
    ],
    recommendedTopics: ['Trees', 'Recursion'],
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s}s`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-muted font-bold">
            Assessment Completed · Post-Test Evaluation
          </span>
          <h1 className="text-2xl font-serif font-semibold text-main">
            {result.quizTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/quiz')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Assessment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/app/progress')}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            View Mastery Analytics
          </Button>
        </div>
      </div>

      {/* Score Hero Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card variant="default" className="text-center p-6 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Final Score
          </span>
          <div className={`text-4xl font-serif font-bold ${
            result.percentage >= 70 ? 'text-accent' : 'text-attention'
          }`}>
            {result.percentage}%
          </div>
          <p className="text-xs text-muted font-mono">
            {result.score} of {result.totalQuestions} correct
          </p>
        </Card>

        <Card variant="default" className="text-center p-6 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Time Taken
          </span>
          <div className="text-4xl font-serif font-bold text-main font-mono">
            {formatTime(result.timeTakenSeconds)}
          </div>
          <p className="text-xs text-muted">
            Average {(result.timeTakenSeconds / result.totalQuestions).toFixed(0)}s per problem
          </p>
        </Card>

        <Card variant="default" className="text-center p-6 space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Mastery Updates
          </span>
          <div className="text-4xl font-serif font-bold text-accent font-mono">
            +{Object.keys(result.masteryChanges).length}
          </div>
          <p className="text-xs text-muted">
            Topics recalibrated via BKT
          </p>
        </Card>
      </div>

      {/* Root-Cause Diagnosis Card */}
      {result.rootCauseInsights.length > 0 && (
        <Card variant="default" className="border-attention/40 bg-card space-y-3">
          <div className="flex items-center gap-2 text-attention font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Prerequisite Root-Cause Diagnostic</span>
          </div>

          <div className="space-y-2">
            {result.rootCauseInsights.map((insight, idx) => (
              <p key={idx} className="text-xs text-main leading-relaxed">
                {insight}
              </p>
            ))}
          </div>

          <div className="pt-2 border-t border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted font-mono">
              Graph Edge Analysis: Recursion → Trees
            </span>
            <Button
              variant="attention"
              size="sm"
              onClick={() => navigate('/app/revision')}
            >
              Open Prerequisite Flashcards
            </Button>
          </div>
        </Card>
      )}

      {/* Topic Mastery Changes (Before -> After) */}
      <Card variant="default" className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Per-Topic Mastery Adjustments (Bayesian Update)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(result.masteryChanges).map(([topic, delta]) => {
            const beforePct = Math.round(delta.before * 100);
            const afterPct = Math.round(delta.after * 100);
            const isGain = afterPct >= beforePct;

            return (
              <div
                key={topic}
                className="p-3.5 rounded-xl bg-surface border border-border flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-main">{topic}</span>
                  <div className="text-[11px] text-muted mt-0.5">
                    Score: {result.topicBreakdown[topic]?.score || 0}%
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="text-muted">{beforePct}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted" />
                  <span className={isGain ? 'text-accent font-bold' : 'text-attention font-bold'}>
                    {afterPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Likely Misconceptions Identified */}
      {result.likelyMisconceptions.length > 0 && (
        <Card variant="default" className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Cognitive Misconceptions Detected
          </span>

          <div className="space-y-2.5">
            {result.likelyMisconceptions.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-surface border border-border flex items-start gap-3"
              >
                <div className="p-1 rounded bg-attention/15 text-attention shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-main">
                    Topic: {item.topic}
                  </div>
                  <p className="text-xs text-muted mt-1 leading-snug">
                    {item.misconception}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Question Review List with Verified Citations */}
      <Card variant="default" className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Question Review & Cited Explanations
        </span>

        <div className="space-y-4">
          {QUESTION_BANK.slice(0, result.totalQuestions).map((q, idx) => {
            const userAns = result.userAnswers[idx]?.userAnswer || 'Not answered';
            const isCorrect = result.userAnswers[idx]?.isCorrect;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-surface border border-border space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted">
                      #{idx + 1}
                    </span>
                    <Badge variant="accent" size="sm">
                      {q.topic}
                    </Badge>
                  </div>
                  {isCorrect ? (
                    <span className="text-xs font-medium text-accent flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-attention flex items-center gap-1 font-mono">
                      <XCircle className="w-3.5 h-3.5" /> Review Needed
                    </span>
                  )}
                </div>

                <div className="text-xs font-medium text-main">
                  {q.question}
                </div>

                <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted">Your Submission:</span>
                    <span className={isCorrect ? 'text-accent font-medium' : 'text-attention font-medium'}>
                      {userAns}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="flex justify-between border-t border-border/50 pt-1">
                      <span className="text-muted">Correct Key:</span>
                      <span className="text-main font-semibold">{String(q.correctAnswer)}</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted leading-relaxed">
                  <strong className="text-main">Explanation:</strong> {q.explanation}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted font-mono">Source Location:</span>
                  <CitationChip citation={q.citation} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommended Next Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border">
        <Button
          variant="primary"
          size="md"
          className="w-full sm:flex-1"
          onClick={() => navigate('/app/revision')}
        >
          <Layers className="w-4 h-4" />
          Open Revision Pack for Weak Topics
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="w-full sm:flex-1"
          onClick={() => navigate('/app/schedule')}
        >
          <Calendar className="w-4 h-4" />
          Update Study Schedule
        </Button>
      </div>
    </div>
  );
};
