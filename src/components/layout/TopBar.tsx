import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Search,
  Flame,
  LogOut,
  User,
  BookOpen,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const { user, resolvedTheme, toggleTheme, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Route to tutor with search query pre-filled
    navigate(`/app/tutor?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6">
      {/* Left zone: Mobile toggle + Course Switcher */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
          className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs">
          <BookOpen className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-main max-w-[140px] sm:max-w-none truncate">
            CS 201: Data Structures & Algorithms
          </span>
        </div>
      </div>

      {/* Middle zone: Quick search in syllabus */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search textbook, slides, or lecture transcripts..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-surface border border-border rounded-lg text-main placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
          />
          <kbd className="hidden sm:inline-block absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-muted bg-card border border-border rounded">
            Enter
          </kbd>
        </form>
      </div>

      {/* Right zone: Streak, Theme Toggle, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak indicator */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-attention/15 border border-attention/30 text-attention text-xs font-semibold select-none">
          <Flame className="w-3.5 h-3.5 fill-attention text-attention" />
          <span>{user?.streakDays || 4}d streak</span>
        </div>

        {/* Theme toggle with aria-label */}
        <button
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface transition-colors cursor-pointer border border-border/60"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-accent" />
          ) : (
            <Moon className="w-4 h-4 text-accent" />
          )}
        </button>

        {/* User menu dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-surface transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div className="w-7 h-7 rounded-full bg-accent-subtle text-accent border border-accent/30 flex items-center justify-center text-xs font-semibold font-mono">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <span className="text-xs font-medium text-main hidden sm:inline-block max-w-[100px] truncate">
              {user?.name || 'Alex Rivera'}
            </span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-lg p-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
              onClick={() => setUserMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-border/60 mb-1">
                <div className="font-semibold text-main">{user?.name || 'Alex Rivera'}</div>
                <div className="text-[11px] text-muted truncate">{user?.email || 'demo@studysphere.ai'}</div>
              </div>
              <button
                onClick={() => navigate('/app/settings')}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-muted hover:text-main hover:bg-surface rounded-lg transition-colors cursor-pointer text-left"
              >
                <User className="w-3.5 h-3.5" />
                Profile & Settings
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-attention hover:bg-attention/10 rounded-lg transition-colors cursor-pointer text-left font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
