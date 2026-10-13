import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Card';
import { Eye, EyeOff, ShieldCheck, Sparkles, BookOpen, Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, resolvedTheme, toggleTheme } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid university or personal email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(email);
      navigate('/app');
    }, 800);
  };

  const handleDemoLogin = () => {
    setEmail('demo@studysphere.ai');
    setPassword('demo1234');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login('demo@studysphere.ai', 'Alex Rivera');
      navigate('/app');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-bg text-main flex flex-col justify-between">
      {/* Top navbar */}
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

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Left Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
            <div>
              <h1 className="text-2xl font-serif font-semibold text-main">
                Log in to your study space
              </h1>
              <p className="text-xs text-muted mt-1">
                Access your indexed course materials, citations, and adaptive quizzes.
              </p>
            </div>

            {/* Demo Hint Banner */}
            <div className="p-3 rounded-xl bg-accent-subtle/80 border border-accent/25 text-xs text-main space-y-1">
              <div className="font-semibold text-accent flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Demo Student Credentials</span>
              </div>
              <p className="text-[11px] text-muted">
                Email: <span className="font-mono text-main">demo@studysphere.ai</span> · Password: <span className="font-mono text-main">demo1234</span>
              </p>
              <p className="text-[10px] text-muted/80">
                (Or enter any valid email and 6+ character password to explore).
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-attention/15 border border-attention/30 text-attention text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                required
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-muted hover:text-main flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 text-sm bg-card border border-border rounded-lg text-main focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-main">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-accent focus:ring-accent"
                  />
                  <span>Remember session</span>
                </label>
                <Link to="/signup" className="text-accent hover:underline font-medium">
                  Need an account?
                </Link>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                >
                  Log In
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  onClick={handleDemoLogin}
                  isLoading={isLoading}
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  Continue as Demo Student (1-Click)
                </Button>
              </div>
            </form>

            <div className="pt-2 text-center text-xs text-muted">
              Don't have an account yet?{' '}
              <Link to="/signup" className="text-accent hover:underline font-semibold">
                Sign up free
              </Link>
            </div>
          </div>

          {/* Right Themed Panel (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 bg-surface p-8 flex-col justify-between border-l border-border">
            <div className="space-y-6">
              <div className="w-10 h-10 rounded-xl bg-accent-subtle text-accent flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-serif font-semibold text-main leading-snug">
                "A tutor that cites its sources, knows what you're missing, and proves it works."
              </h2>
              <div className="space-y-3 text-xs text-muted">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Verified sentence-level citations to your textbook and slides.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Honest refusal of off-syllabus queries without hallucinations.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>Bayesian Knowledge Tracing with prerequisite root-cause analysis.</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/80 text-[11px] text-muted font-mono">
              Multimodal AI Hackathon 2026 · Track D
            </div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="py-4 text-center text-xs text-muted border-t border-border bg-card">
        Demo login portal for evaluation. No real authentication or passwords stored externally.
      </footer>
    </div>
  );
};
