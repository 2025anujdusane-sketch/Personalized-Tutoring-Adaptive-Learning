import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Badge, Input } from '../components/ui/Card';

export const SchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const { schedule, toggleScheduleItem, user, updateUser, showToast } = useApp();

  const [examDate, setExamDate] = useState<string>(user?.examDate || '2026-10-28');
  const [dailyHours, setDailyHours] = useState<number>(2);

  const handleUpdateSchedule = () => {
    updateUser({ examDate });
    showToast('Updated schedule planner parameters', 'success');
  };

  const completedCount = schedule.filter((s) => s.completed).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
            Adaptive Study Schedule Planner
          </h1>
          <p className="text-xs text-muted mt-1">
            Dynamic calendar balancing new syllabus exploration against spaced retention review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-mono">
            <span>Progress: </span>
            <strong className="text-accent">{completedCount} of {schedule.length}</strong> done
          </div>
        </div>
      </div>

      {/* Configuration & Forgetting Curve Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Planner Inputs */}
        <Card variant="default" className="md:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Target Parameters
            </span>
            <Badge variant="accent" size="sm">
              Exam in 17 Days
            </Badge>
          </div>

          <div className="space-y-3">
            <Input
              label="Target Exam Date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-muted">
                  Daily Available Study Time
                </span>
                <span className="font-mono text-main font-semibold">{dailyHours} hours / day</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono">
                <span>1 hr</span>
                <span>3 hrs</span>
                <span>6 hrs</span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={handleUpdateSchedule}
            >
              Recalculate Spaced Schedule
            </Button>
          </div>
        </Card>

        {/* Ebbinghaus Forgetting Curve Visualizer */}
        <Card variant="surface" className="md:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Ebbinghaus Forgetting Model
            </span>
            <span className="text-xs font-mono text-attention font-semibold">
              Proactive Interventions
            </span>
          </div>

          <p className="text-xs text-muted leading-relaxed">
            Without review, retention drops to ~40% within 4 days. Scheduled retrieval sessions (attention badges) intercept decay at optimal intervals.
          </p>

          {/* Mini SVG Forgetting Curve */}
          <div className="p-3 bg-card rounded-xl border border-border">
            <svg viewBox="0 0 320 120" className="w-full h-auto text-muted font-mono text-[9px]">
              <line x1="30" y1="10" x2="30" y2="100" stroke="var(--border)" strokeWidth="1" />
              <line x1="30" y1="100" x2="300" y2="100" stroke="var(--border)" strokeWidth="1" />

              {/* Decay Curve 1 */}
              <path
                d="M 30 20 Q 80 85, 120 90"
                fill="none"
                stroke="var(--attention)"
                strokeWidth="2"
                strokeDasharray="3 3"
              />

              {/* Review Spike 1 */}
              <line x1="120" y1="90" x2="120" y2="25" stroke="var(--accent)" strokeWidth="1.5" />

              {/* Decay Curve 2 (Flatter) */}
              <path
                d="M 120 25 Q 200 65, 300 70"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2"
              />

              {/* Labels */}
              <text x="35" y="18" fill="var(--text-muted)">100%</text>
              <text x="125" y="22" fill="var(--accent)">Review 1 (Today)</text>
              <text x="35" y="98" fill="var(--text-muted)">Day 1</text>
              <text x="120" y="112" fill="var(--text-muted)">Day 4</text>
              <text x="280" y="112" fill="var(--text-muted)">Day 14</text>
            </svg>
          </div>
        </Card>
      </div>

      {/* Weekly Schedule Timeline */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border/60">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Timeline Plan
            </span>
            <h3 className="text-sm font-semibold text-main">Recommended Daily Study Slots</h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" />
              <span>New Practice</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-attention" />
              <span>Prerequisite Revision</span>
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {schedule.map((session) => {
            const isRevision = session.type === 'revision';

            return (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  session.completed
                    ? 'bg-surface/50 border-border opacity-70'
                    : isRevision
                    ? 'bg-card border-attention/30 hover:border-attention'
                    : 'bg-card border-border hover:border-accent/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={session.completed}
                    onChange={() => toggleScheduleItem(session.id)}
                    className="rounded text-accent focus:ring-accent mt-1 cursor-pointer h-4 w-4"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-main font-mono">
                        {session.day} ({session.date})
                      </span>
                      <span className="text-[10px]">·</span>
                      <Badge
                        variant={isRevision ? 'attention' : 'accent'}
                        size="sm"
                      >
                        {isRevision ? 'Spaced Revision' : 'New Practice'}
                      </Badge>
                      <span className="text-xs text-muted font-medium">
                        {session.topic}
                      </span>
                    </div>

                    <h4 className={`text-sm font-semibold ${session.completed ? 'line-through text-muted' : 'text-main'}`}>
                      {session.title}
                    </h4>

                    <p className="text-xs text-muted leading-snug">
                      {session.priorityReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 sm:self-center self-end">
                  <span className="text-xs font-mono text-muted flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {session.durationMinutes} min
                  </span>

                  <Button
                    variant={isRevision ? 'attention' : 'primary'}
                    size="sm"
                    onClick={() => navigate(`/app/quiz?topics=${session.topic}`)}
                  >
                    Start
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
