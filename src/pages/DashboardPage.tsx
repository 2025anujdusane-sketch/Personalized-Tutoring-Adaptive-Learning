import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  MessageSquare,
  HelpCircle,
  FolderOpen,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge } from '../components/ui/Card';
import { MasteryRing, ScoreLineChart, TopicMasteryRow } from '../components/charts/Charts';

export const DashboardPage: React.FC = () => {
  const { user, masteries, schedule } = useApp();
  const navigate = useNavigate();
  const [whyThisExpanded, setWhyThisExpanded] = useState(false);

  // Compute stats
  const masteryValues = Object.values(masteries);
  const overallMastery =
    masteryValues.reduce((acc, curr) => acc + curr.mastery, 0) / (masteryValues.length || 1);

  const sortedMasteries = [...masteryValues].sort((a, b) => a.mastery - b.mastery);
  const weakestTopics = sortedMasteries.slice(0, 3);
  const strongestTopics = sortedMasteries.slice(-3).reverse();

  // Upcoming revision items with attention color
  const upcomingRevisions = schedule.filter((s) => !s.completed);

  const mockRecentScores = [
    { quizTitle: 'Arrays & Sorting', score: 92, date: 'Oct 08' },
    { quizTitle: 'Binary Search', score: 85, date: 'Oct 09' },
    { quizTitle: 'Recursion Stacks', score: 55, date: 'Oct 10' },
    { quizTitle: 'Trees Traversal', score: 40, date: 'Oct 10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* 1. Header & Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Welcome back, {user?.name || 'Alex'}
          </h1>
          <p className="text-xs text-muted mt-1">
            Course: <strong className="text-main font-semibold">Data Structures & Algorithms</strong> · Verified syllabus grounding active.
          </p>
        </div>

        {/* Exam Countdown & Streak */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>
              Exam in <strong className="font-semibold text-main">17 days</strong> (Oct 28)
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-attention/15 border border-attention/30 text-xs font-semibold text-attention flex items-center gap-1.5">
            <span>{user?.streakDays || 4} day streak</span>
          </div>
        </div>
      </div>

      {/* 2. Today's Recommended Session (High Priority Action) */}
      <Card variant="default" className="border-accent/40 bg-card relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="attention" size="sm">
                Recommended Focus
              </Badge>
              <span className="text-xs text-muted font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> 12 min session
              </span>
            </div>

            <div>
              <h2 className="text-lg font-serif font-semibold text-main">
                Practice Trees and Recursion Prerequisite
              </h2>
              <p className="text-xs text-muted mt-1 max-w-2xl leading-relaxed">
                Adaptive assessment designed to repair recursive stack tracing weaknesses and reinforce Binary Search Tree validation intervals.
              </p>
            </div>

            {/* Expandable "Why this?" Card */}
            <div>
              <button
                type="button"
                onClick={() => setWhyThisExpanded(!whyThisExpanded)}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1 cursor-pointer select-none"
              >
                <span>Why this question set?</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    whyThisExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {whyThisExpanded && (
                <div className="mt-3 p-3.5 rounded-xl bg-surface border border-border text-xs text-main space-y-1.5 animate-in fade-in duration-150">
                  <div className="font-semibold text-attention flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Bayesian Knowledge Tracing & Prerequisite Root-Cause:</span>
                  </div>
                  <p className="text-muted leading-relaxed">
                    • Current mastery on <strong>Trees</strong> is <strong>0.32</strong> (last practiced 5 days ago, forgetting decay: critical).<br />
                    • Prerequisite topic <strong>Recursion</strong> is at <strong>0.41</strong>.<br />
                    • Graph dependency edge: <code className="bg-card px-1 py-0.5 rounded font-mono">Recursion → Trees</code> indicates 68% of tree traversal failures originate from uncertain base-case call stack decomposition.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/app/quiz?topics=Trees,Recursion')}
            >
              Start 12-Min Quiz
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => navigate('/app/tutor?q=why%20does%20local%20bst%20validation%20fail')}
            >
              Ask Tutor First
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Metrics Overview Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Mastery Card */}
        <Card variant="default" className="md:col-span-4 flex flex-col justify-between items-center text-center p-6">
          <div className="w-full text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Course Mastery
            </span>
            <div className="text-sm font-semibold text-main mt-0.5">
              Bayesian Knowledge Estimate
            </div>
          </div>

          <div className="my-4">
            <MasteryRing value={overallMastery} size={135} strokeWidth={11} label="Mastery" />
          </div>

          <p className="text-xs text-muted max-w-xs leading-relaxed">
            Composite probability of knowing syllabus concepts across 9 topics.
          </p>
        </Card>

        {/* Weakest vs Strongest Topics */}
        <Card variant="default" className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Topic Breakdown
              </span>
              <h3 className="text-sm font-semibold text-main">Priority Topics for Revision</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/course-map')}
            >
              Explore Course Map →
            </Button>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-attention uppercase tracking-wider mb-2">
              ▲ Lowest Mastery (Urgent Attention)
            </div>
            {weakestTopics.map((topic) => (
              <TopicMasteryRow
                key={topic.topic}
                mastery={topic}
                onPractice={(t) => navigate(`/app/quiz?topics=${t}`)}
              />
            ))}
          </div>

          <div className="pt-2 border-t border-border/60">
            <div className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">
              ● Strongest Mastery (Maintenance)
            </div>
            {strongestTopics.slice(0, 2).map((topic) => (
              <TopicMasteryRow
                key={topic.topic}
                mastery={topic}
                onPractice={(t) => navigate(`/app/quiz?topics=${t}`)}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* 4. Secondary Row: Recent Quiz Scores Chart & Upcoming Revision Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score History Chart */}
        <Card variant="default" className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Performance Trend
              </span>
              <h3 className="text-sm font-semibold text-main">Recent Quiz Scores</h3>
            </div>
            <span className="text-xs text-muted font-mono">Last 4 Assessments</span>
          </div>

          <ScoreLineChart scores={mockRecentScores} height={170} />

          <div className="flex justify-between items-center text-xs text-muted pt-2 border-t border-border/60 font-mono">
            <span>Average: 68%</span>
            <span className="text-attention">Dip detected on Recursion & Trees</span>
          </div>
        </Card>

        {/* Upcoming Revision Queue (Attention items) */}
        <Card variant="default" className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-attention">
                Spaced Revision Queue
              </span>
              <h3 className="text-sm font-semibold text-main">Scheduled Flashcards & Tasks</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/schedule')}
            >
              Full Plan →
            </Button>
          </div>

          <div className="space-y-2.5">
            {upcomingRevisions.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-surface border border-border flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-main">{item.topic}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-attention/15 text-attention">
                      {item.type === 'revision' ? 'Revision' : 'Practice'}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-snug">{item.title}</p>
                </div>
                <span className="text-xs font-mono text-muted shrink-0">
                  {item.durationMinutes}m
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={() => navigate('/app/revision')}
          >
            <Layers className="w-3.5 h-3.5" />
            Open Flashcard Deck for Weak Topics
          </Button>
        </Card>
      </div>

      {/* 5. Quick Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <button
          onClick={() => navigate('/app/tutor')}
          className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 text-left transition-all hover:shadow-sm cursor-pointer group flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-accent-subtle text-accent group-hover:scale-105 transition-transform">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-main group-hover:text-accent transition-colors">
              Ask Grounded Tutor
            </div>
            <p className="text-xs text-muted mt-0.5">
              Query algorithms with exact textbook and slide citations.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/quiz')}
          className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 text-left transition-all hover:shadow-sm cursor-pointer group flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-accent-subtle text-accent group-hover:scale-105 transition-transform">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-main group-hover:text-accent transition-colors">
              Take Adaptive Quiz
            </div>
            <p className="text-xs text-muted mt-0.5">
              Choose topics, difficulties, or launch a timed mock exam.
            </p>
          </div>
        </button>

        <button
          onClick={() => navigate('/app/library')}
          className="p-4 rounded-xl bg-card border border-border hover:border-accent/50 text-left transition-all hover:shadow-sm cursor-pointer group flex items-start gap-3"
        >
          <div className="p-2.5 rounded-lg bg-accent-subtle text-accent group-hover:scale-105 transition-transform">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-main group-hover:text-accent transition-colors">
              Manage Source Library
            </div>
            <p className="text-xs text-muted mt-0.5">
              Upload PDFs, PPTX slides, and lecture MP4 recordings.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
