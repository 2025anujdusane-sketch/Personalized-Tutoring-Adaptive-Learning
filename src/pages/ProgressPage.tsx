import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  TrendingUp,
  BrainCircuit,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge, Modal, ProgressBar } from '../components/ui/Card';
import { MasteryRing, ScoreLineChart, TopicMasteryRow } from '../components/charts/Charts';
import { TOPICS } from '../data/mockData';

export const ProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const { masteries } = useApp();
  const [bktModalOpen, setBktModalOpen] = useState(false);
  const [selectedChartTopic, setSelectedChartTopic] = useState('Overall');

  const topicList = Object.values(masteries);
  const overallMastery =
    topicList.reduce((acc, curr) => acc + curr.mastery, 0) / (topicList.length || 1);

  const mockTimeTrend = [
    { quizTitle: 'Diagnostic', score: 48, date: 'Oct 04' },
    { quizTitle: 'Arrays Practice', score: 62, date: 'Oct 06' },
    { quizTitle: 'Binary Search Drill', score: 78, date: 'Oct 08' },
    { quizTitle: 'Recursion Assessment', score: 55, date: 'Oct 10' },
    { quizTitle: 'Current Mastery', score: Math.round(overallMastery * 100), date: 'Today' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Learner Progress & Mastery
          </h1>
          <p className="text-xs text-muted mt-1">
            Dynamic Bayesian Knowledge Tracing and Ebbinghaus forgetting decay modeling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBktModalOpen(true)}
          >
            <Info className="w-3.5 h-3.5 text-accent" />
            How Mastery is Calculated
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/evaluation')}
          >
            System Benchmarks →
          </Button>
        </div>
      </div>

      {/* Hero Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="default" className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Overall Knowledge
          </span>
          <div className="text-3xl font-bold font-mono text-accent">
            {Math.round(overallMastery * 100)}%
          </div>
          <p className="text-xs text-muted">
            Composite probability across 9 DSA topics.
          </p>
        </Card>

        <Card variant="default" className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Topics in Critical Decay
          </span>
          <div className="text-3xl font-bold font-mono text-attention">
            {topicList.filter((t) => t.decayStatus === 'critical').length}
          </div>
          <p className="text-xs text-muted">
            Unreviewed &gt; 4 days (Trees, DP).
          </p>
        </Card>

        <Card variant="default" className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Question Accuracy
          </span>
          <div className="text-3xl font-bold font-mono text-main">
            71.4%
          </div>
          <p className="text-xs text-muted">
            180 total assessment attempts recorded.
          </p>
        </Card>

        <Card variant="default" className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Prerequisite Health
          </span>
          <div className="text-3xl font-bold font-mono text-attention">
            Needs Focus
          </div>
          <p className="text-xs text-muted">
            Recursion (0.41) throttling Trees.
          </p>
        </Card>
      </div>

      {/* Main Grid: Per-topic Bars & Time-series Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Per-topic Mastery Breakdown */}
        <Card variant="default" className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Syllabus Breakdown
              </span>
              <h2 className="text-sm font-semibold text-main">Topic Mastery Estimates</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/app/course-map')}
            >
              Interactive Map →
            </Button>
          </div>

          <div className="space-y-1">
            {topicList.map((m) => (
              <TopicMasteryRow
                key={m.topic}
                mastery={m}
                onPractice={(topic) => navigate(`/app/quiz?topics=${topic}`)}
              />
            ))}
          </div>
        </Card>

        {/* Right: Mastery Over Time & Accuracy Distribution */}
        <div className="lg:col-span-6 space-y-6">
          <Card variant="default" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Longitudinal Learning
                </span>
                <h3 className="text-sm font-semibold text-main">Mastery Progression Curve</h3>
              </div>
              <span className="text-xs text-muted font-mono">Last 5 Sessions</span>
            </div>

            <ScoreLineChart scores={mockTimeTrend} height={180} />

            <div className="flex justify-between items-center text-xs text-muted font-mono pt-2 border-t border-border/60">
              <span>+23% Gain since Diagnostic</span>
              <span className="text-accent">Steady Linear Progression</span>
            </div>
          </Card>

          {/* Breakdown by Difficulty & Question Type */}
          <Card variant="default" className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Accuracy Dimensions
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* By Difficulty */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-xs font-semibold text-main block">By Difficulty:</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Easy:</span>
                    <span className="font-mono font-semibold text-accent">88%</span>
                  </div>
                  <ProgressBar value={88} size="sm" color="accent" />
                  <div className="flex justify-between pt-1">
                    <span className="text-muted">Medium:</span>
                    <span className="font-mono font-semibold text-main">68%</span>
                  </div>
                  <ProgressBar value={68} size="sm" color="accent" />
                  <div className="flex justify-between pt-1">
                    <span className="text-muted">Hard:</span>
                    <span className="font-mono font-semibold text-attention">42%</span>
                  </div>
                  <ProgressBar value={42} size="sm" color="attention" />
                </div>
              </div>

              {/* By Type */}
              <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2">
                <span className="text-xs font-semibold text-main block">By Question Type:</span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">MCQ Problems:</span>
                    <span className="font-mono font-semibold text-accent">82%</span>
                  </div>
                  <ProgressBar value={82} size="sm" color="accent" />
                  <div className="flex justify-between pt-1">
                    <span className="text-muted">Numerical:</span>
                    <span className="font-mono font-semibold text-main">74%</span>
                  </div>
                  <ProgressBar value={74} size="sm" color="accent" />
                  <div className="flex justify-between pt-1">
                    <span className="text-muted">Short Answer:</span>
                    <span className="font-mono font-semibold text-attention">54%</span>
                  </div>
                  <ProgressBar value={54} size="sm" color="attention" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Session History Table */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Audit Trail
            </span>
            <h3 className="text-sm font-semibold text-main">Recent Assessment Sessions</h3>
          </div>
          <span className="text-xs text-muted font-mono">Synced locally</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted font-mono text-[11px] uppercase">
                <th className="pb-2 font-medium">Session Title</th>
                <th className="pb-2 font-medium">Mode</th>
                <th className="pb-2 font-medium">Score</th>
                <th className="pb-2 font-medium">Time</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-2.5 font-medium text-main">Trees Traversal Drill</td>
                <td className="py-2.5 text-muted uppercase font-mono text-[10px]">Practice</td>
                <td className="py-2.5 font-mono text-attention font-bold">40%</td>
                <td className="py-2.5 text-muted font-mono">05:12</td>
                <td className="py-2.5">
                  <Badge variant="attention" size="sm">Prerequisite Review Needed</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-main">Recursion Stacks Quiz</td>
                <td className="py-2.5 text-muted uppercase font-mono text-[10px]">Practice</td>
                <td className="py-2.5 font-mono text-attention font-bold">55%</td>
                <td className="py-2.5 text-muted font-mono">06:40</td>
                <td className="py-2.5">
                  <Badge variant="attention" size="sm">Decayed</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-main">Binary Search Invariants</td>
                <td className="py-2.5 text-muted uppercase font-mono text-[10px]">Mock Exam</td>
                <td className="py-2.5 font-mono text-accent font-bold">85%</td>
                <td className="py-2.5 text-muted font-mono">08:15</td>
                <td className="py-2.5">
                  <Badge variant="accent" size="sm">Mastered</Badge>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-medium text-main">Arrays Memory Layout</td>
                <td className="py-2.5 text-muted uppercase font-mono text-[10px]">Practice</td>
                <td className="py-2.5 font-mono text-accent font-bold">92%</td>
                <td className="py-2.5 text-muted font-mono">04:30</td>
                <td className="py-2.5">
                  <Badge variant="accent" size="sm">Mastered</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bayesian Knowledge Tracing Explanation Modal */}
      <Modal
        isOpen={bktModalOpen}
        onClose={() => setBktModalOpen(false)}
        title="How Topic Mastery is Estimated"
        description="Transparent mathematical principles behind StudySphere AI"
      >
        <div className="space-y-4 text-xs leading-relaxed text-main">
          <p>
            StudySphere AI does not use arbitrary percentage averages. Instead, we implement a Bayesian Knowledge Tracing (BKT) learner model:
          </p>

          <div className="p-3.5 rounded-xl bg-surface border border-border space-y-2 font-mono text-[11px]">
            <div className="text-accent font-semibold">1. Latent Knowledge State P(L):</div>
            <p className="text-muted">
              Probability that a student genuinely understands a skill rather than guessing correctly or slipping on an easy problem.
            </p>

            <div className="text-accent font-semibold pt-1">2. Evidence Updates:</div>
            <p className="text-muted">
              Correct answers increase P(L) based on difficulty slip parameters; incorrect options decrease it and flag specific misconceptions.
            </p>

            <div className="text-attention font-semibold pt-1">3. Ebbinghaus Forgetting Decay:</div>
            <p className="text-muted">
              Even high-mastery topics decay toward a "review due" state after 4+ days of inactivity, scheduling proactive retrieval.
            </p>
          </div>

          <p className="text-muted">
            When you take quizzes or chat with the tutor, the model updates these estimates in real time to guide what you study next.
          </p>

          <div className="pt-2 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setBktModalOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
