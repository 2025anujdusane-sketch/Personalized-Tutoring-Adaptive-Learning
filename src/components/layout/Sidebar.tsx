import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Network,
  Layers,
  Calendar,
  CheckCircle,
  Settings,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/library', label: 'Source Library', icon: FolderOpen },
    { to: '/app/tutor', label: 'Source Tutor', icon: MessageSquare },
    { to: '/app/quiz', label: 'Adaptive Quiz', icon: HelpCircle },
    { to: '/app/progress', label: 'Mastery Analytics', icon: TrendingUp },
    { to: '/app/course-map', label: 'Course Flow Map', icon: Network },
    { to: '/app/revision', label: 'Revision Pack', icon: Layers },
    { to: '/app/schedule', label: 'Study Schedule', icon: Calendar },
    { to: '/app/evaluation', label: 'System Evaluation', icon: CheckCircle },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 text-main">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center font-serif font-bold text-lg shadow-xs">
              S
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight flex items-center gap-1.5">
                <span>StudySphere AI</span>
              </div>
              <p className="text-[10px] text-muted -mt-0.5 font-mono">
                Source-Grounded Companion
              </p>
            </div>
          </NavLink>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface lg:hidden cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Course Strip */}
        <div className="px-4 py-3 bg-surface/50 border-b border-border/80">
          <div className="text-[10px] uppercase font-semibold text-muted tracking-wider">
            Active Syllabus
          </div>
          <div className="text-xs font-semibold text-main truncate mt-0.5">
            Data Structures & Algorithms
          </div>
          <div className="text-[11px] text-muted flex items-center gap-1 mt-0.5 font-mono">
            <span>3 Sources</span>
            <span>·</span>
            <span>9 Topics</span>
            <span>·</span>
            <span className="text-accent font-semibold">BKT Active</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/app'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors select-none ${
                    isActive
                      ? 'bg-accent-subtle text-accent font-semibold border border-accent/25'
                      : 'text-muted hover:text-main hover:bg-surface'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Hackathon Callout Card */}
        <div className="p-3 m-3 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-main">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Multimodal AI 2026</span>
          </div>
          <p className="text-[11px] text-muted mt-1 leading-snug">
            Track D: Personalized Tutoring & Adaptive Assessments.
          </p>
        </div>
      </aside>
    </>
  );
};
