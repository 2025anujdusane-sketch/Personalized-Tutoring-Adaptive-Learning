import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Button } from '../components/ui/Button';
import { Input, Modal } from '../components/ui/Card';
import { ArrowRight, BookOpen, CheckCircle2, Sparkles, Sun, Moon } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { login, resolvedTheme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [examDate, setExamDate] = useState('2026-10-28');
  const [course, setCourse] = useState('Data Structures & Algorithms');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding Modal Step
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [studyGoal, setStudyGoal] = useState('10');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(email, name);
      setShowOnboarding(true);
    }, 600);
  };

  const handleStartDiagnostic = () => {
    setShowOnboarding(false);
    navigate('/app/quiz/diagnostic');
  };

  const handleSkipToDashboard = () => {
    setShowOnboarding(false);
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-bg text-main flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center font-serif font-bold text-lg">
            S
          </div>
          <span className="font-semibold text-base font-serif">StudySphere AI</span>
        </Link>
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface border border-border/60"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
        </button>
      </header>

      {/* Main Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-main">
              Create your student workspace
            </h1>
            <p className="text-xs text-muted mt-1">
              Ingest your course files and unlock source-grounded adaptive tutoring.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-attention/15 border border-attention/30 text-attention text-xs rounded-lg font-medium">
                {error}
              </div>
            )}

            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Rivera"
              required
            />

            <Input
              label="University / Student Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Target Syllabus / Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Data Structures & Algorithms">
                  CS 201: Data Structures & Algorithms (Full Ingested Demo)
                </option>
                <option value="Computer Systems">CS 202: Computer Systems Architecture</option>
                <option value="Discrete Mathematics">MATH 105: Discrete Mathematics</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Upcoming Exam Date (Optional)
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isLoading}
              >
                Create Account & Continue
              </Button>
            </div>
          </form>

          <div className="pt-2 text-center text-xs text-muted border-t border-border">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-semibold">
              Log in instead
            </Link>
          </div>
        </div>
      </div>

      {/* Onboarding Dialog */}
      <Modal
        isOpen={showOnboarding}
        onClose={() => {}}
        title="Welcome to StudySphere AI"
        description="Let's tailor your adaptive learner model"
      >
        <div className="space-y-5">
          <div className="p-3.5 rounded-xl bg-accent-subtle/80 border border-accent/30 text-xs space-y-1 text-main">
            <div className="font-semibold text-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Syllabus Initialized</span>
            </div>
            <p className="text-muted">
              We've pre-indexed 3 course files for <strong>Data Structures & Algorithms</strong> (Textbook PDF, Lecture Slides PPTX, and Prof. Vance's Video Lectures).
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Weekly Study Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['5', '10', '15'].map((hrs) => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setStudyGoal(hrs)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                    studyGoal === hrs
                      ? 'bg-accent text-accent-fg border-accent'
                      : 'bg-card border-border text-muted hover:text-main'
                  }`}
                >
                  {hrs} hrs / week
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
            <div className="text-xs font-semibold text-main flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent" />
              <span>Recommended First Step: Diagnostic Quiz</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Take a short 5-question diagnostic assessment to initialize your topic mastery baseline and uncover any hidden prerequisite gaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full sm:flex-1"
              onClick={handleStartDiagnostic}
            >
              Take 5-Question Diagnostic
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="w-full sm:w-auto"
              onClick={handleSkipToDashboard}
            >
              Skip to Dashboard
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted border-t border-border bg-card">
        Demo registration for evaluation. No real personal details required.
      </footer>
    </div>
  );
};
