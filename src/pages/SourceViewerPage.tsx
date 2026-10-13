import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import {
  FileText,
  Presentation,
  Video,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Highlighter,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Card';

export const SourceViewerPage: React.FC = () => {
  const { sourceId } = useParams<{ sourceId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { sources } = useApp();

  const source = sources.find((s) => s.id === sourceId) || sources[0];

  // Deep link params
  const paramPage = searchParams.get('page');
  const paramSlide = searchParams.get('slide');
  const paramTime = searchParams.get('t');
  const highlightQuery = searchParams.get('highlight');

  // Viewer state
  const [activePage, setActivePage] = useState<number>(paramPage ? parseInt(paramPage) : 24);
  const [activeSlide, setActiveSlide] = useState<number>(paramSlide ? parseInt(paramSlide) : 12);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(paramTime ? parseInt(paramTime) : 872);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (paramPage) setActivePage(parseInt(paramPage));
    if (paramSlide) setActiveSlide(parseInt(paramSlide));
    if (paramTime) setCurrentTimeSec(parseInt(paramTime));
  }, [paramPage, paramSlide, paramTime]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentUnit =
    source.content.units.find(
      (u) =>
        (source.type === 'pdf' && u.number === activePage) ||
        (source.type === 'pptx' && u.number === activeSlide)
    ) || source.content.units[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app/library')}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>

          <div className="h-4 w-px bg-border" />

          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-accent-subtle text-accent">
                {source.type === 'pdf' && <FileText className="w-3.5 h-3.5" />}
                {source.type === 'pptx' && <Presentation className="w-3.5 h-3.5" />}
                {source.type === 'video' && <Video className="w-3.5 h-3.5" />}
              </span>
              <h1 className="text-sm font-semibold text-main truncate max-w-md">
                {source.title}
              </h1>
            </div>
            <span className="text-[11px] text-muted font-mono">
              {source.type.toUpperCase()} · Verified Ingestion
            </span>
          </div>
        </div>

        {/* Page / Slide Pager */}
        {source.type !== 'video' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (source.type === 'pdf') setActivePage(Math.max(1, activePage - 1));
                else setActiveSlide(Math.max(1, activeSlide - 1));
              }}
              disabled={source.type === 'pdf' ? activePage <= 1 : activeSlide <= 1}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs font-mono font-medium px-2 text-main">
              {source.type === 'pdf' ? `Page ${activePage} / ${source.unitCount}` : `Slide ${activeSlide} / ${source.unitCount}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (source.type === 'pdf') setActivePage(Math.min(source.unitCount, activePage + 1));
                else setActiveSlide(Math.min(source.unitCount, activeSlide + 1));
              }}
              disabled={source.type === 'pdf' ? activePage >= source.unitCount : activeSlide >= source.unitCount}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Main Viewer Body */}
      {source.type === 'pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main PDF Page Render */}
          <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-sm space-y-6">
            <div className="flex justify-between items-center text-xs text-muted border-b border-border/60 pb-3 font-mono">
              <span>Introduction to Algorithms · Fourth Edition</span>
              <span>Chapter 2.3 · Page {activePage}</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-serif font-bold text-main">
                {currentUnit.title}
              </h2>

              <p className="text-sm leading-relaxed text-main font-serif">
                In computational problem formulation, divide-and-conquer recurrences yield subproblems of fractional scale. When the underlying dataset is monotonic, random access indexing provides immediate pruning of unfeasible intervals.
              </p>

              {/* Highlighted Cited Segment */}
              <div className="p-4 rounded-xl bg-accent-subtle border border-accent/40 text-main text-sm font-sans leading-relaxed shadow-xs relative">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent mb-1 font-mono">
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Verified Cited Text Segment</span>
                </div>
                <p>"{currentUnit.text}"</p>
              </div>

              <p className="text-sm leading-relaxed text-main font-serif">
                Notice that the recurrence relation preserves invariance across bounded arrays. Consequently, boundary contraction guarantees logarithmic convergence toward base termination conditions.
              </p>

              {/* Diagram Render */}
              {currentUnit.diagramTitle && (
                <div className="p-5 rounded-xl bg-surface border border-border space-y-2 mt-4">
                  <div className="text-xs font-semibold text-main font-mono">
                    {currentUnit.diagramTitle}
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    {currentUnit.diagramDescription}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Table of Contents / Units sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <Card variant="surface" className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
                Indexed Textbook Units
              </h3>
              <div className="space-y-2">
                {source.content.units.map((unit) => (
                  <button
                    key={unit.number}
                    onClick={() => setActivePage(unit.number)}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-colors cursor-pointer ${
                      activePage === unit.number
                        ? 'bg-card border-accent text-accent font-semibold shadow-xs'
                        : 'bg-card/40 border-border text-muted hover:text-main'
                    }`}
                  >
                    <div className="flex justify-between font-mono text-[10px] text-muted mb-0.5">
                      <span>{unit.label}</span>
                      <span>{unit.topics.join(', ')}</span>
                    </div>
                    <div className="truncate font-medium">{unit.title}</div>
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* PPTX Slide Viewer */}
      {source.type === 'pptx' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Slide Stage */}
          <div className="lg:col-span-9 space-y-4">
            <div className="aspect-16/9 bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-md flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs text-muted font-mono border-b border-border/60 pb-2">
                <span>CS 201: Trees, Graphs & Dynamic Programming</span>
                <span>Slide {activeSlide} of {source.unitCount}</span>
              </div>

              <div className="space-y-4 max-w-2xl mx-auto w-full my-auto">
                <h2 className="text-2xl font-bold text-main tracking-tight font-serif">
                  {currentUnit.title}
                </h2>

                <div className="p-4 rounded-xl bg-accent-subtle border border-accent/40 text-main text-sm leading-relaxed">
                  <div className="text-xs font-semibold text-accent mb-1 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Cited Slide Invariant
                  </div>
                  {currentUnit.text}
                </div>

                {currentUnit.diagramTitle && (
                  <div className="p-4 rounded-lg bg-surface border border-border text-xs text-muted">
                    <span className="font-semibold text-main block mb-1">
                      {currentUnit.diagramTitle}
                    </span>
                    {currentUnit.diagramDescription}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted flex justify-between font-mono">
                <span>Course Instructor: Prof. Marcus Vance</span>
                <span>Term: Fall 2026</span>
              </div>
            </div>
          </div>

          {/* Slide Thumbnails Column */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Slide Deck Thumbnails
            </span>
            <div className="space-y-2">
              {source.content.units.map((unit) => (
                <button
                  key={unit.number}
                  onClick={() => setActiveSlide(unit.number)}
                  className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer transition-colors ${
                    activeSlide === unit.number
                      ? 'bg-card border-accent text-accent font-semibold shadow-xs'
                      : 'bg-surface border-border text-muted hover:text-main'
                  }`}
                >
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span>{unit.label}</span>
                    <span>{unit.topics[0]}</span>
                  </div>
                  <div className="truncate font-medium">{unit.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Video Player UI */}
      {source.type === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Video Stage */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-16/9 bg-[#0d1210] border border-border rounded-2xl flex flex-col justify-between p-6 relative overflow-hidden group shadow-lg text-white">
              {/* Top Watermark */}
              <div className="flex justify-between items-center text-xs opacity-80 font-mono">
                <span>Lecture 08: Recursive Thinking & Binary Trees</span>
                <span>Prof. Marcus Vance</span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="flex flex-col items-center justify-center my-auto">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  className="w-16 h-16 rounded-full bg-accent text-accent-fg flex items-center justify-center shadow-xl hover:scale-105 transition-transform cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <span className="text-xs mt-3 font-mono opacity-80">
                  {isPlaying ? 'Playing Transcript Audio' : 'Click to Toggle Video Sync'}
                </span>
              </div>

              {/* Bottom Custom Media Controls */}
              <div className="space-y-2 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10">
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-accent h-full transition-all duration-150"
                    style={{ width: `${(currentTimeSec / (48 * 60)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-accent cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setCurrentTimeSec(872)}
                      className="hover:text-accent cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <span>
                      {formatSeconds(currentTimeSec)} / 48:15
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">1.0x</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Active Subtitle Box */}
            <Card variant="accent" className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div className="text-xs text-main leading-relaxed">
                <span className="font-semibold block mb-0.5 font-mono">
                  Synchronized Transcript Excerpt ({formatSeconds(currentTimeSec)}):
                </span>
                "{source.content.units.find((u) => u.timestampSec === currentTimeSec)?.text ||
                  source.content.units[1].text}"
              </div>
            </Card>
          </div>

          {/* Synchronized Transcript Timeline */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Synchronized Transcript
            </span>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {source.content.units.map((unit) => {
                const isActive = unit.timestampSec === currentTimeSec;
                return (
                  <button
                    key={unit.number}
                    onClick={() => {
                      if (unit.timestampSec) setCurrentTimeSec(unit.timestampSec);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-accent-subtle border-accent text-main font-semibold shadow-xs'
                        : 'bg-card border-border text-muted hover:text-main'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono text-[11px] mb-1">
                      <span className="text-accent font-semibold">{unit.label}</span>
                      <span className="text-muted">{unit.topics[0]}</span>
                    </div>
                    <div className="text-main font-medium mb-1 line-clamp-1">{unit.title}</div>
                    <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                      {unit.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
