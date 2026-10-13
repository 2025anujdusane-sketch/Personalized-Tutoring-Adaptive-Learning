import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  User,
  Sun,
  Moon,
  Monitor,
  Languages,
  Bell,
  Shield,
  RotateCcw,
  LogOut,
  Save,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, Input, Badge } from '../components/ui/Card';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, theme, setTheme, resetDemoData, logout, showToast } = useApp();

  const [name, setName] = useState(user?.name || 'Alex Rivera');
  const [email, setEmail] = useState(user?.email || 'demo@studysphere.ai');
  const [examDate, setExamDate] = useState(user?.examDate || '2026-10-28');
  const [language, setLanguage] = useState<'en' | 'hi'>(user?.preferredLanguage || 'en');
  const [studyGoal, setStudyGoal] = useState<number>(user?.studyGoalHoursWeekly || 10);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [decayReminders, setDecayReminders] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      email,
      examDate,
      preferredLanguage: language,
      studyGoalHoursWeekly: studyGoal,
    });
    showToast('Saved profile preferences', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-border/70">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-main">
          Account & Preferences
        </h1>
        <p className="text-xs text-muted mt-1">
          Customize your profile, theme tokens, language, and model parameters.
        </p>
      </div>

      {/* Profile Form */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Learner Profile
          </span>
          <span className="text-xs font-mono text-muted">ID: {user?.id}</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Upcoming Exam Date"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Weekly Study Goal (Hours)
              </label>
              <input
                type="number"
                min="2"
                max="40"
                value={studyGoal}
                onChange={(e) => setStudyGoal(parseInt(e.target.value) || 10)}
                className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" size="sm">
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Theme Selection */}
      <Card variant="default" className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          Design Token Theme
        </span>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Canvas #F6F7F4' },
            { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Canvas #141A18' },
            { id: 'system', label: 'System Default', icon: Monitor, desc: 'Auto-sync OS' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTheme(item.id as any)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-accent-subtle border-accent text-accent font-semibold shadow-xs'
                    : 'bg-card border-border text-muted hover:text-main'
                }`}
              >
                <Icon className="w-4 h-4 mb-2" />
                <div className="text-xs font-medium text-main">{item.label}</div>
                <div className="text-[10px] text-muted font-mono">{item.desc}</div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Language Preference */}
      <Card variant="default" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Tutor Language
          </span>
          <Languages className="w-4 h-4 text-accent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              language === 'en'
                ? 'bg-accent-subtle border-accent text-accent font-semibold'
                : 'bg-card border-border text-muted hover:text-main'
            }`}
          >
            <div className="text-xs font-semibold text-main">English (Default)</div>
            <p className="text-[11px] text-muted mt-1">
              Standard academic definitions mirroring English textbooks and slides.
            </p>
          </button>

          <button
            onClick={() => setLanguage('hi')}
            className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
              language === 'hi'
                ? 'bg-accent-subtle border-accent text-accent font-semibold'
                : 'bg-card border-border text-muted hover:text-main'
            }`}
          >
            <div className="text-xs font-semibold text-main">हिंदी (Hindi Explanations)</div>
            <p className="text-[11px] text-muted mt-1">
              English technical terms paired with intuitive Hindi conceptual descriptions.
            </p>
          </button>
        </div>
      </Card>

      {/* Privacy Notice & Demo Controls */}
      <Card variant="surface" className="space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Data Privacy & Demo Management</span>
        </span>

        <p className="text-xs text-muted leading-relaxed">
          All uploaded documents, citations, quiz logs, and Bayesian mastery parameters in this prototype are processed and persisted exclusively within your browser’s local storage.
        </p>

        <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemoData}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data to Initial State
          </Button>

          <Button
            variant="attention"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out of Session
          </Button>
        </div>
      </Card>
    </div>
  );
};
