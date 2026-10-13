import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  Layers,
  Sparkles,
  Users,
  Sun,
  Moon,
  Menu,
  X,
  Languages,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';
import { TEAM_MEMBERS } from '../data/mockData';

export const LandingPage: React.FC = () => {
  const { resolvedTheme, toggleTheme, user } = useApp();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Demo Widget State
  const [activeDemoTab, setActiveDemoTab] = useState<'backed' | 'partial' | 'outside'>('backed');
  const [selectedDemoCitation, setSelectedDemoCitation] = useState<'pdf' | 'slide' | 'video'>('pdf');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Which file formats does StudySphere AI support?',
      a: 'We natively ingest university textbooks and syllabi in PDF format, lecture slide decks in PPTX / PPT, and recorded lecture videos in MP4 format alongside synchronized SRT/VTT transcript captions.',
    },
    {
      q: 'How does exact citation grounding work?',
      a: 'Every uploaded file is parsed into granular semantic units with deterministic coordinate metadata (exact PDF page numbers, slide indices, or video timestamps). When answering, the tutor links assertions to verified sentence-level excerpts. You can click any citation chip to view the original source excerpt immediately.',
    },
    {
      q: 'What happens if a student asks a question not in their course material?',
      a: 'Unlike ungrounded AI chatbots that hallucinate plausible-sounding guesses, StudySphere AI enforces strict honest refusal. If a concept is not present in your course material, the system declines and clearly distinguishes outside knowledge from verified syllabus facts.',
    },
    {
      q: 'How is per-topic mastery calculated?',
      a: 'Our learner model tracks Bayesian Knowledge Tracing (BKT) probability parameters updated after every quiz question and conversation attempt. We also apply an Ebbinghaus forgetting decay factor so topics you haven’t reviewed in several days are flagged for timely retrieval.',
    },
    {
      q: 'Can StudySphere AI identify why I am struggling with an advanced topic?',
      a: 'Yes! The course flow graph encodes prerequisite dependencies (e.g. Recursion → Trees). When you make repeated errors on tree questions, our root-cause diagnostic inspects prerequisite nodes and often discovers the fundamental issue lies in recursive call-stack tracing.',
    },
    {
      q: 'Can I study and receive explanations in Hindi?',
      a: 'Yes. With our mixed-language toggle, English lecture slides and textbook citations can be paired with clear Hindi conceptual explanations for Indian university students.',
    },
    {
      q: 'Is my uploaded university coursework private?',
      a: 'All files are restricted exclusively to your student workspace and evaluated locally in-browser for this prototype. No student notes or proprietary exam materials are used for external model training.',
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-main selection:bg-accent-subtle selection:text-main">
      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 text-main shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent text-accent-fg flex items-center justify-center font-serif font-bold text-lg shadow-xs">
              S
            </div>
            <span className="font-semibold text-base tracking-tight font-serif">
              StudySphere AI
            </span>
          </Link>

          {/* Nav Links (Single line, subtle hover) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-muted">
            <a href="#features" className="hover:text-main transition-colors whitespace-nowrap">Features</a>
            <a href="#how-it-works" className="hover:text-main transition-colors whitespace-nowrap">How it works</a>
            <a href="#demo" className="hover:text-main transition-colors whitespace-nowrap">Interactive Demo</a>
            <a href="#learner-model" className="hover:text-main transition-colors whitespace-nowrap">Learner Model</a>
            <a href="#trust" className="hover:text-main transition-colors whitespace-nowrap">Trust & Rigor</a>
            <a href="#faq" className="hover:text-main transition-colors whitespace-nowrap">FAQ</a>
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface transition-colors cursor-pointer border border-border/60"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-accent" />}
            </button>

            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/app')}
              >
                Go to Dashboard
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Link to="/login" className="hidden sm:inline-block">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Get started
                  </Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted hover:text-main hover:bg-surface md:hidden cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-card px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-muted hover:text-main">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-muted hover:text-main">How it works</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-muted hover:text-main">Interactive Demo</a>
            <a href="#learner-model" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-muted hover:text-main">Learner Model</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-xs font-medium text-muted hover:text-main">FAQ</a>
            <div className="pt-2 border-t border-border flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" size="sm" className="w-full">Log in</Button>
              </Link>
              <Link to="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">Sign up</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-medium border border-accent/25">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multimodal AI Hackathon 2026 · Track D</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold tracking-tight text-main leading-[1.15] text-balance">
                Study from your own material. <br className="hidden sm:inline" />
                <span className="italic font-normal text-accent">Trust every answer.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted max-w-xl leading-relaxed">
                Upload your textbooks, lecture slides, and video recordings once.
                StudySphere AI tutors you with exact page, slide, and timestamp citations,
                runs adaptive quizzes, and pinpoints weak prerequisite topics before exam day.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/signup">
                  <Button variant="primary" size="lg">
                    Start studying free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#demo">
                  <Button variant="secondary" size="lg">
                    Explore live citation demo
                  </Button>
                </a>
              </div>

              <p className="text-xs text-muted flex items-center gap-2 pt-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                <span>Every answer links to the exact PDF page, slide, or video timestamp.</span>
              </p>
            </div>

            {/* Right Column: In-Code Product Mockup */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-lg relative space-y-4">
                {/* Header bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/70">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-attention/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/60" />
                    <span className="text-xs font-mono font-medium text-main ml-1">
                      CS 201: Binary Search Trees
                    </span>
                  </div>
                  <Badge variant="accent" size="sm">
                    Grounded Tutor
                  </Badge>
                </div>

                {/* Question bubble */}
                <div className="p-3 bg-surface rounded-xl text-xs text-main border border-border/60">
                  <span className="text-[10px] font-semibold text-muted uppercase block mb-1">
                    Student Query
                  </span>
                  "Why does local check `left &lt; root &lt; right` fail to validate a BST?"
                </div>

                {/* Assistant response */}
                <div className="p-3.5 rounded-xl bg-card border border-border space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="accent" size="sm">
                      ● Source-backed (100%)
                    </Badge>
                    <span className="text-[10px] text-muted font-mono">Confidence: 0.98</span>
                  </div>

                  <p className="text-xs text-main leading-relaxed">
                    Local checks only inspect immediate parent-child pairs. A node deep inside the right subtree could be smaller than an ancestor higher up in the tree hierarchy [1].
                  </p>

                  {/* Citation chips */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-accent-subtle text-accent border border-accent/30 font-medium">
                      <Presentation className="w-3 h-3" />
                      Slide 12
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-full bg-accent-subtle text-accent border border-accent/30 font-medium">
                      <Video className="w-3 h-3" />
                      Lecture 28:15
                    </span>
                  </div>
                </div>

                {/* Root-cause Diagnostic Pill */}
                <div className="p-3 bg-attention/10 border border-attention/25 rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-attention shrink-0 mt-0.5" />
                  <div className="text-[11px] text-main">
                    <span className="font-semibold text-attention block">Learner Root-Cause Insight:</span>
                    Trees errors correlate with Recursion (mastery 0.41). Strengthening call frame unwinding is recommended.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Section */}
      <section className="py-16 bg-surface/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              The Learning Crisis
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-main mt-2">
              Study material is scattered. AI answers are ungrounded.
            </h2>
            <p className="text-sm text-muted mt-2">
              Standard chatbots hallucinate plausible-sounding explanations disconnected from your actual exam syllabus, giving students false confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-attention mb-4 border border-border">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-main">Scattered Fragmented Media</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Textbook PDFs, 40-slide PowerPoint presentations, and 50-minute lecture videos live in different portals. Finding a single theorem definition takes 20 minutes of manual scrubbing.
              </p>
            </Card>

            <Card variant="default">
              <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-attention mb-4 border border-border">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-main">Ungrounded AI Hallucinations</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Generic LLMs guess algorithms outside your syllabus, cite non-existent page numbers, and confidently produce incorrect exam notation that costs marks on final tests.
              </p>
            </Card>

            <Card variant="default">
              <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center text-attention mb-4 border border-border">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-main">No Diagnostic Memory</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Chat sessions reset immediately. No model tracks what you forgot 4 days ago, nor detects that your tree traversal failures stem from a weak prerequisite in recursion.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Features Grid */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-serif font-semibold text-main mt-2">
              Engineered specifically for academic mastery
            </h2>
            <p className="text-sm text-muted mt-2">
              Everything you need to turn multi-gigabyte course drives into an adaptive, self-verifying tutor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Multimodal Knowledge Base</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Directly index textbook PDFs, PPTX slide decks, and MP4 video lectures with transcript alignment and diagram recognition without tedious manual data entry.
              </p>
            </Card>

            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Exact Coordinate Citations</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Every factual claim provides a clickable chip linking to the exact PDF page, slide card, or video playback second with verified highlighted text.
              </p>
            </Card>

            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-surface text-muted flex items-center justify-center mb-3 border border-border">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Honest Refusals for Off-Material</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                When a question falls outside your syllabus, StudySphere AI declines and visibly separates outside knowledge with clear dashed warning boundaries.
              </p>
            </Card>

            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Adaptive Assessments</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Generate practice and exam-mode quizzes across MCQ, short-answer, and numerical problems with misconception diagnostics on wrong options.
              </p>
            </Card>

            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-attention/15 text-attention flex items-center justify-center mb-3">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Prerequisite Root-Cause Analysis</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Bayesian Knowledge Tracing inspects prerequisite dependency edges to identify whether advanced errors stem from foundational weaknesses.
              </p>
            </Card>

            <Card variant="default" hoverEffect>
              <div className="w-9 h-9 rounded-lg bg-accent-subtle text-accent flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-main">Revision Packs & Study Calendar</h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Auto-generate interactive flashcard decks with citations for your weakest topics and schedule revision sessions timed against Ebbinghaus forgetting curves.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="py-20 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-main mt-2">
              From raw course files to exam readiness in four steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-card border-2 border-accent text-accent font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                1
              </div>
              <h3 className="text-base font-semibold text-main">Upload Materials</h3>
              <p className="text-xs text-muted leading-relaxed">
                Drag and drop your textbooks, slide presentations, and lecture MP4 files into the source library.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-card border-2 border-accent text-accent font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                2
              </div>
              <h3 className="text-base font-semibold text-main">Ask with Citations</h3>
              <p className="text-xs text-muted leading-relaxed">
                Query tricky algorithms. The tutor quotes verified paragraphs and provides instant links to source pages.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-card border-2 border-accent text-accent font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                3
              </div>
              <h3 className="text-base font-semibold text-main">Take Adaptive Quizzes</h3>
              <p className="text-xs text-muted leading-relaxed">
                Test yourself against MCQ, numerical, and short-answer prompts. Each incorrect distractor flags specific misconceptions.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-full bg-card border-2 border-accent text-accent font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                4
              </div>
              <h3 className="text-base font-semibold text-main">Follow Targeted Plan</h3>
              <p className="text-xs text-muted leading-relaxed">
                Mastery updates dynamically. The schedule flags prerequisite gaps and reviews topics right before you forget them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Citation Demo */}
      <section id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Hands-On Verification
            </span>
            <h2 className="text-3xl font-serif font-semibold text-main mt-2">
              Interactive Citation & Grounding Demo
            </h2>
            <p className="text-sm text-muted mt-2">
              Click the three grounding states below to see how StudySphere AI verifies claims and handles off-material queries.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1 bg-surface border border-border rounded-xl gap-1">
              <button
                onClick={() => setActiveDemoTab('backed')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDemoTab === 'backed' ? 'bg-card text-accent font-semibold shadow-xs' : 'text-muted hover:text-main'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Source-Backed
              </button>
              <button
                onClick={() => setActiveDemoTab('partial')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDemoTab === 'partial' ? 'bg-card text-attention font-semibold shadow-xs' : 'text-muted hover:text-main'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Partially Supported
              </button>
              <button
                onClick={() => setActiveDemoTab('outside')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeDemoTab === 'outside' ? 'bg-card text-main font-semibold shadow-xs' : 'text-muted hover:text-main'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Outside Your Material
              </button>
            </div>
          </div>

          {/* Demo Display Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Chat Answer Preview */}
            <div className="lg:col-span-6 space-y-4">
              <Card variant={activeDemoTab === 'outside' ? 'dashed' : 'default'} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="text-xs font-mono text-muted">
                    {activeDemoTab === 'backed' && 'Query: "How does binary search prevent overflow?"'}
                    {activeDemoTab === 'partial' && 'Query: "Compare Stack and Queue internals"'}
                    {activeDemoTab === 'outside' && 'Query: "What is the capital of France?"'}
                  </span>
                  {activeDemoTab === 'backed' && (
                    <Badge variant="accent" size="sm">Source-backed</Badge>
                  )}
                  {activeDemoTab === 'partial' && (
                    <Badge variant="attention" size="sm">Partially supported</Badge>
                  )}
                  {activeDemoTab === 'outside' && (
                    <Badge variant="outside" size="sm">Outside your material</Badge>
                  )}
                </div>

                {activeDemoTab === 'backed' && (
                  <div className="space-y-3 text-xs leading-relaxed text-main">
                    <p>
                      Binary search avoids signed 32-bit integer overflow by evaluating the midpoint using <code className="bg-surface px-1.5 py-0.5 rounded font-mono">mid = low + ((high - low) &gt;&gt; 1)</code> rather than addition [1].
                    </p>
                    <p>
                      If the target is smaller, the invariant halves the remaining search window to <code className="bg-surface px-1.5 py-0.5 rounded font-mono">low = mid + 1</code>, preserving worst-case $O(\log n)$ comparisons [2].
                    </p>

                    <div className="pt-2 border-t border-border/60">
                      <span className="text-[11px] font-semibold text-muted block mb-2">Click a citation to inspect source:</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedDemoCitation('pdf')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                            selectedDemoCitation === 'pdf' ? 'bg-accent text-accent-fg border-accent' : 'bg-accent-subtle text-accent border-accent/30'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Textbook p.24 [1]
                        </button>
                        <button
                          onClick={() => setSelectedDemoCitation('slide')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                            selectedDemoCitation === 'slide' ? 'bg-accent text-accent-fg border-accent' : 'bg-accent-subtle text-accent border-accent/30'
                          }`}
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          Slide 12 [2]
                        </button>
                        <button
                          onClick={() => setSelectedDemoCitation('video')}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 cursor-pointer ${
                            selectedDemoCitation === 'video' ? 'bg-accent text-accent-fg border-accent' : 'bg-accent-subtle text-accent border-accent/30'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          Lecture 14:32 [3]
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeDemoTab === 'partial' && (
                  <div className="space-y-3 text-xs leading-relaxed text-main">
                    <p>
                      Your uploaded materials define node pointer linkages for LIFO (Stack) and FIFO (Queue) structures [1]. However, dynamic circular ring-buffer resizing is not present in your slides.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-dashed border-border text-muted">
                      <span className="font-semibold text-attention text-[11px] block">Unverified Supplemental Information:</span>
                      Standard library implementations use amortized doubling arrays, but this detail is not tested in CS 201 syllabus.
                    </div>
                  </div>
                )}

                {activeDemoTab === 'outside' && (
                  <div className="space-y-3 text-xs leading-relaxed text-main">
                    <p className="text-muted">
                      I cannot answer this question using your uploaded course material. Your library contains content exclusively for CS 201: Data Structures & Algorithms. European geography is not part of this syllabus.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-dashed border-border text-muted">
                      <span className="font-semibold text-muted text-[11px] block">Honest Refusal Invariant:</span>
                      StudySphere AI refuses off-curriculum questions to ensure students are not led astray by unverified outside trivia.
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Source Document Preview */}
            <div className="lg:col-span-6">
              <Card variant="surface" className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-card text-accent border border-border">
                      {selectedDemoCitation === 'pdf' && <FileText className="w-4 h-4" />}
                      {selectedDemoCitation === 'slide' && <Presentation className="w-4 h-4" />}
                      {selectedDemoCitation === 'video' && <Video className="w-4 h-4" />}
                    </span>
                    <span className="text-xs font-semibold text-main">
                      {selectedDemoCitation === 'pdf' && 'Introduction to Algorithms (4th Ed.) · Page 24'}
                      {selectedDemoCitation === 'slide' && 'CS 201 Lecture Slides · Slide 12'}
                      {selectedDemoCitation === 'video' && 'Lecture 08: Recursive Thinking · 14:32'}
                    </span>
                  </div>
                  <Badge variant="accent" size="sm">Verified Match</Badge>
                </div>

                <div className="p-4 bg-card rounded-xl border border-border space-y-2 text-xs leading-relaxed">
                  <div className="text-[10px] uppercase font-mono text-muted">Original Excerpt:</div>
                  <div className="p-3 bg-accent-subtle rounded-lg border border-accent/30 text-main font-sans">
                    {selectedDemoCitation === 'pdf' && (
                      '"In each iteration, we evaluate midpoint mid = low + ((high - low) >> 1) to prevent integer overflow. If A[mid] equals target, the index is found. Otherwise recurrence yields worst-case O(log n)."'
                    )}
                    {selectedDemoCitation === 'slide' && (
                      '"WARNING COMMON MISTAKE: Checking only node.left.val < node.val and node.right.val > node.val locally is INVALID! You must enforce a valid range [minVal, maxVal] across the entire recursive descent."'
                    )}
                    {selectedDemoCitation === 'video' && (
                      '"Look at timestamp 14:32 on the board. When calculating tree height: maxDepth(root) = 1 + max(maxDepth(root.left), maxDepth(root.right)). Assume the recursive call returns valid height."'
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted pt-2 font-mono">
                    <span>Semantic Similarity: 0.96</span>
                    <span className="text-accent font-semibold">Coordinates Verified</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Learner Model & Prerequisite Root-Cause */}
      <section id="learner-model" className="py-20 bg-surface/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Learner Cognitive Architecture
              </span>
              <h2 className="text-3xl font-serif font-semibold text-main">
                Don't just drill mistakes. <br />
                Fix the root-cause prerequisite.
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                When students struggle with complex structures like Trees or Dynamic Programming, typical tutors keep throwing more tree problems at them.
              </p>
              <p className="text-sm text-muted leading-relaxed">
                StudySphere AI inspects the foundational concept graph. If your Recursion mastery is only 0.41, struggling with Tree traversals is an inevitable symptom. Our system prescribes 15 minutes of recursive stack tracing first, boosting tree mastery twice as fast.
              </p>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-main">
                  <span>Prerequisite Diagnosis Example:</span>
                  <span className="text-attention font-mono">Recursion (0.41) → Trees (0.32)</span>
                </div>
                <p className="text-xs text-muted">
                  "Your Tree validation errors stem from call-frame unwinding misconceptions. Starting here provides immediate leverage."
                </p>
              </div>
            </div>

            {/* Visual SVG Mini Course Map */}
            <div className="lg:col-span-6">
              <div className="p-6 bg-card rounded-2xl border border-border shadow-sm">
                <div className="text-xs font-mono text-muted mb-4 flex justify-between items-center">
                  <span>Concept Graph Slice</span>
                  <span className="text-accent font-semibold">Live Mastery Heatmap</span>
                </div>

                <svg viewBox="0 0 400 220" className="w-full h-auto text-xs font-sans">
                  {/* Edges */}
                  <line x1="80" y1="60" x2="200" y2="60" stroke="var(--border)" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="80" y1="160" x2="200" y2="160" stroke="var(--accent)" strokeWidth="2" />
                  <line x1="200" y1="60" x2="320" y2="60" stroke="var(--border)" strokeWidth="2" strokeDasharray="3 3" />
                  <line x1="200" y1="60" x2="320" y2="160" stroke="var(--attention)" strokeWidth="2" />

                  {/* Node: Recursion (Weak - Attention) */}
                  <g transform="translate(80, 60)">
                    <circle r="26" fill="var(--attention)" fillOpacity="0.15" stroke="var(--attention)" strokeWidth="2" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Recursion</text>
                    <text textAnchor="middle" dy="38" fill="var(--attention)" fontSize="10" fontFamily="monospace">41%</text>
                  </g>

                  {/* Node: Arrays (Strong - Accent) */}
                  <g transform="translate(80, 160)">
                    <circle r="26" fill="var(--accent-subtle)" stroke="var(--accent)" strokeWidth="2" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Arrays</text>
                    <text textAnchor="middle" dy="38" fill="var(--accent)" fontSize="10" fontFamily="monospace">88%</text>
                  </g>

                  {/* Node: Trees (Critical - Attention) */}
                  <g transform="translate(200, 60)">
                    <circle r="26" fill="var(--attention)" fillOpacity="0.25" stroke="var(--attention)" strokeWidth="2.5" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Trees</text>
                    <text textAnchor="middle" dy="38" fill="var(--attention)" fontSize="10" fontFamily="monospace">32%</text>
                  </g>

                  {/* Node: Binary Search (Strong - Accent) */}
                  <g transform="translate(200, 160)">
                    <circle r="26" fill="var(--accent-subtle)" stroke="var(--accent)" strokeWidth="2" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Binary Search</text>
                    <text textAnchor="middle" dy="38" fill="var(--accent)" fontSize="10" fontFamily="monospace">82%</text>
                  </g>

                  {/* Node: Graphs */}
                  <g transform="translate(320, 60)">
                    <circle r="26" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Graphs</text>
                    <text textAnchor="middle" dy="38" fill="var(--text-muted)" fontSize="10" fontFamily="monospace">46%</text>
                  </g>

                  {/* Node: Dynamic Prog */}
                  <g transform="translate(320, 160)">
                    <circle r="26" fill="var(--attention)" fillOpacity="0.2" stroke="var(--attention)" strokeWidth="2" />
                    <text textAnchor="middle" dy="4" fill="var(--text)" fontSize="11" fontWeight="600">Dyn Prog</text>
                    <text textAnchor="middle" dy="38" fill="var(--attention)" fontSize="10" fontFamily="monospace">28%</text>
                  </g>
                </svg>

                <div className="flex items-center justify-between text-[11px] text-muted pt-3 border-t border-border font-mono">
                  <span>● Attention: Needs Revision</span>
                  <span>● Accent: Mastered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Trust and Transparency & Evaluation Strip */}
      <section id="trust" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Rigor & Verifiability
            </span>
            <h2 className="text-3xl font-serif font-semibold text-main mt-2">
              Transparent Evaluation Metrics
            </h2>
            <p className="text-sm text-muted mt-2">
              Tested against industry-standard RAGAS and simulated learner benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">96.4%</div>
              <div className="text-xs font-semibold text-main">Faithfulness</div>
              <div className="text-[10px] text-muted">Benchmark &gt; 90%</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">94.8%</div>
              <div className="text-xs font-semibold text-main">Answer Relevancy</div>
              <div className="text-[10px] text-muted">Benchmark &gt; 90%</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">92.1%</div>
              <div className="text-xs font-semibold text-main">Context Precision</div>
              <div className="text-[10px] text-muted">Benchmark &gt; 85%</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">91.5%</div>
              <div className="text-xs font-semibold text-main">Context Recall</div>
              <div className="text-[10px] text-muted">Benchmark &gt; 85%</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">98.2%</div>
              <div className="text-xs font-semibold text-main">Refusal Precision</div>
              <div className="text-[10px] text-muted">Benchmark &gt; 95%</div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center space-y-1">
              <div className="text-2xl font-bold font-mono text-accent">1.2%</div>
              <div className="text-xs font-semibold text-main">Repetition Rate</div>
              <div className="text-[10px] text-muted">Benchmark &lt; 5%</div>
            </div>
          </div>
          <p className="text-center text-xs text-muted mt-3 font-mono">
            *Example values from demo evaluation suite run on CS 201 test questions.
          </p>
        </div>
      </section>

      {/* 9. Who It Is For */}
      <section className="py-16 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Audience
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-main mt-2">
              Built for every learning context
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <h3 className="text-base font-semibold text-main">University Students</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Exam cramming with peace of mind. Study only what your specific professor covered without wasting hours on conflicting internet blogs.
              </p>
            </Card>
            <Card variant="default">
              <h3 className="text-base font-semibold text-main">Self-Directed Learners</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Take dense MIT OpenCourseWare textbooks or NPTEL courses and get a personal tutor that tests your comprehension adaptively.
              </p>
            </Card>
            <Card variant="default">
              <h3 className="text-base font-semibold text-main">Teaching Assistants</h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">
                Provide automated 24/7 grounded office hours to students without risking unverified misinformation or invented homework solutions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 10. Supported Formats Strip */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-medium text-main">
                <FileText className="w-4 h-4 text-accent" />
                <span>Textbook PDFs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-main">
                <Presentation className="w-4 h-4 text-accent" />
                <span>PowerPoint PPTX</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-main">
                <Video className="w-4 h-4 text-accent" />
                <span>MP4 Lectures & Captions</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted bg-surface px-3 py-1.5 rounded-lg border border-border">
              <Languages className="w-4 h-4 text-accent" />
              <span>Mixed-language Indian support: English slides with Hindi conceptual explanations</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ Accordion */}
      <section id="faq" className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Answers
            </span>
            <h2 className="text-3xl font-serif font-semibold text-main mt-2">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-surface/50"
                  >
                    <span className="text-sm font-semibold text-main">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-muted leading-relaxed border-t border-border/40 bg-surface/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 12. About the Project & Hackathon Team */}
      <section className="py-20 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Multimodal AI Hackathon 2026
            </span>
            <h2 className="text-3xl font-serif font-semibold text-main mt-2">
              Track D: Personalized Tutoring & Adaptive Learning
            </h2>
            <p className="text-sm text-muted mt-2">
              Conceived and built to solve hallucinated tutoring through strict multimodal grounding and prerequisite modeling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM_MEMBERS.map((member) => (
              <Card key={member.name} variant="default">
                <div className="w-10 h-10 rounded-full bg-accent-subtle text-accent font-semibold flex items-center justify-center text-sm font-mono mb-3">
                  {member.name[0]}
                </div>
                <h3 className="text-sm font-semibold text-main">{member.name}</h3>
                <div className="text-xs font-medium text-accent mt-0.5">{member.role}</div>
                <p className="text-xs text-muted mt-2 leading-relaxed">
                  {member.contributions}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Final CTA Band */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-main">
            Ready to study with absolute confidence?
          </h2>
          <p className="text-base text-muted max-w-lg mx-auto">
            Experience an AI tutor that knows exactly what you uploaded, refuses what it doesn't know, and proves every claim with a verified page citation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/signup">
              <Button variant="primary" size="lg">
                Start studying now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Try demo student account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="border-t border-border bg-card py-12 text-xs text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-accent text-accent-fg flex items-center justify-center font-serif font-bold text-xs">
              S
            </div>
            <span className="font-semibold text-main font-serif">StudySphere AI</span>
            <span>·</span>
            <span>Multimodal AI Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-main">Features</a>
            <a href="#demo" className="hover:text-main">Demo</a>
            <a href="#faq" className="hover:text-main">FAQ</a>
            <Link to="/login" className="hover:text-main">Log in</Link>
          </div>

          <div className="flex items-center gap-3">
            <span>© 2026 StudySphere AI. All rights reserved.</span>
            <button
              onClick={toggleTheme}
              className="p-1 rounded text-muted hover:text-main cursor-pointer"
              aria-label="Toggle theme in footer"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
