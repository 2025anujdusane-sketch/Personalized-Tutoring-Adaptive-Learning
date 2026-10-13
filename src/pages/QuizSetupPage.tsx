import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { api } from '../services/api';
import {
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  Sliders,
  CheckSquare,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge } from '../components/ui/Card';
import { TOPICS } from '../data/mockData';

export const QuizSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { masteries, showToast } = useApp();

  const preselectedTopic = searchParams.get('topics');

  const [selectedTopics, setSelectedTopics] = useState<string[]>(() => {
    if (preselectedTopic) {
      return preselectedTopic.split(',');
    }
    return ['Trees', 'Recursion', 'Dynamic Programming'];
  });

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'adaptive'>('adaptive');
  const [types, setTypes] = useState<('mcq' | 'short_answer' | 'numerical')[]>(['mcq', 'short_answer', 'numerical']);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timedMode, setTimedMode] = useState<boolean>(true);
  const [timeLimit, setTimeLimit] = useState<number>(10);
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) {
        showToast('At least one topic must be selected', 'info');
        return;
      }
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const toggleType = (t: 'mcq' | 'short_answer' | 'numerical') => {
    if (types.includes(t)) {
      if (types.length === 1) return;
      setTypes(types.filter((item) => item !== t));
    } else {
      setTypes([...types, t]);
    }
  };

  const handleLaunchQuiz = async () => {
    setIsLoading(true);
    try {
      const generated = await api.generateQuiz({
        topics: selectedTopics,
        difficulty,
        types,
        count: questionCount,
        timedMode,
        timeLimitMinutes: timeLimit,
        mode,
      });

      // Save generated quiz in session storage or state
      sessionStorage.setItem(`quiz_${generated.id}`, JSON.stringify(generated));
      navigate(`/app/quiz/${generated.id}`);
    } catch (err) {
      showToast('Error generating quiz', 'attention');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendWeakTopics = () => {
    setSelectedTopics(['Trees', 'Recursion', 'Dynamic Programming']);
    setDifficulty('adaptive');
    showToast('Applied recommended weak-topic scope', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Adaptive Assessment Generator
          </h1>
          <p className="text-xs text-muted mt-1">
            Configure practice questions or mock exams with syllabus citations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/app/quiz/diagnostic')}
        >
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          Take 5-Question Diagnostic
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mode Switcher */}
          <div className="p-1 bg-surface rounded-xl border border-border inline-flex w-full">
            <button
              onClick={() => setMode('practice')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'practice'
                  ? 'bg-card text-main font-semibold shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Practice Mode (Immediate Cited Feedback)
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                mode === 'exam'
                  ? 'bg-card text-main font-semibold shadow-xs'
                  : 'text-muted hover:text-main'
              }`}
            >
              Mock Exam Mode (Grading & Citations at End)
            </button>
          </div>

          {/* Scope / Topic Picker */}
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  1. Syllabus Scope
                </span>
                <h3 className="text-sm font-semibold text-main">Choose Topics to Assess</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRecommendWeakTopics}
              >
                Recommended for me
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic);
                const currentMastery = masteries[topic]?.mastery || 0.5;
                const isWeak = currentMastery < 0.45;

                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-accent-subtle border-accent/40 text-main font-medium shadow-xs'
                        : 'bg-card border-border text-muted hover:text-main'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold">{topic}</span>
                      {isWeak && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase bg-attention/15 text-attention font-bold">
                          Weak
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-muted">
                      Mastery: {Math.round(currentMastery * 100)}%
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Difficulty & Types */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Difficulty */}
            <Card variant="default" className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                2. Difficulty Target
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'adaptive', label: 'Adaptive (BKT)' },
                  { id: 'easy', label: 'Easy' },
                  { id: 'medium', label: 'Medium' },
                  { id: 'hard', label: 'Hard' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDifficulty(item.id as any)}
                    className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                      difficulty === item.id
                        ? 'bg-accent text-accent-fg border-accent font-semibold'
                        : 'bg-surface border-border text-muted hover:text-main'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </Card>

            {/* Question Types */}
            <Card variant="default" className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                3. Problem Types
              </span>
              <div className="space-y-2">
                {[
                  { id: 'mcq', label: 'Multiple Choice (MCQ)' },
                  { id: 'short_answer', label: 'Short Answer (Conceptual)' },
                  { id: 'numerical', label: 'Numerical / Calculations' },
                ].map((item) => {
                  const active = types.includes(item.id as any);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleType(item.id as any)}
                      className={`w-full p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        active
                          ? 'bg-card border-accent text-main font-semibold'
                          : 'bg-surface border-border text-muted hover:text-main'
                      }`}
                    >
                      <span>{item.label}</span>
                      {active ? (
                        <CheckSquare className="w-3.5 h-3.5 text-accent" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded border border-border" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Count and Time Limits */}
          <Card variant="default" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Question Count
                </span>
                <div className="flex items-center gap-2 mt-2">
                  {[5, 10, 15].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                        questionCount === cnt
                          ? 'bg-accent text-accent-fg border-accent'
                          : 'bg-surface border-border text-muted hover:text-main'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Timed Countdown
                  </span>
                  <input
                    type="checkbox"
                    checked={timedMode}
                    onChange={(e) => setTimedMode(e.target.checked)}
                    className="rounded text-accent focus:ring-accent"
                  />
                </div>
                {timedMode && (
                  <div className="flex items-center gap-2 mt-2">
                    {[5, 10, 15, 20].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => setTimeLimit(mins)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono cursor-pointer ${
                          timeLimit === mins
                            ? 'bg-card border-accent text-accent font-semibold'
                            : 'bg-surface border-border text-muted'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Assessment Blueprint Preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card variant="surface" className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Assessment Blueprint
            </span>

            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Total Questions:</span>
                <span className="font-semibold text-main font-mono">{questionCount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Time Allocated:</span>
                <span className="font-semibold text-main font-mono">
                  {timedMode ? `${timeLimit} minutes` : 'Untimed'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Estimated Difficulty:</span>
                <span className="font-semibold text-main uppercase font-mono">{difficulty}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Mode:</span>
                <span className="font-semibold text-main uppercase font-mono">{mode}</span>
              </div>
            </div>

            {/* Mini Topic Mix Bar */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="text-[11px] font-semibold text-muted">Selected Topics Mix:</div>
              <div className="w-full bg-border h-2 rounded-full overflow-hidden flex">
                <div className="bg-accent h-full w-2/5" />
                <div className="bg-attention h-full w-2/5" />
                <div className="bg-border h-full w-1/5" />
              </div>
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>{selectedTopics.slice(0, 2).join(', ')}</span>
                <span>{selectedTopics.length} topics</span>
              </div>
            </div>

            {/* Why these questions? Preview */}
            <div className="p-3.5 rounded-xl bg-card border border-border space-y-1 text-xs">
              <div className="font-semibold text-main flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Learner Model Prediction</span>
              </div>
              <p className="text-muted leading-relaxed text-[11px]">
                This question mix stresses your lowest-confidence prerequisite paths (Recursion and Trees) while preserving retention across binary search.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleLaunchQuiz}
              isLoading={isLoading}
            >
              Launch Assessment
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
