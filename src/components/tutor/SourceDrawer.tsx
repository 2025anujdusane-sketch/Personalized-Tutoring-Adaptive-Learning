import React from 'react';
import { useApp } from '../../store/AppContext';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, FileText, Presentation, Video, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Card';

export const SourceDrawer: React.FC = () => {
  const { activeDrawerCitation, closeSourceDrawer } = useApp();
  const navigate = useNavigate();

  if (!activeDrawerCitation) return null;

  const {
    source_id,
    source_title,
    source_type,
    page_number,
    slide_number,
    timestamp_label,
    start_seconds,
    excerpt,
    section_heading,
  } = activeDrawerCitation;

  const handleOpenViewer = () => {
    closeSourceDrawer();
    let query = '';
    if (page_number) query = `?page=${page_number}&highlight=${encodeURIComponent(excerpt.slice(0, 30))}`;
    else if (slide_number) query = `?slide=${slide_number}`;
    else if (start_seconds) query = `?t=${start_seconds}`;

    navigate(`/app/library/${source_id}${query}`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-preview-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeSourceDrawer}
    >
      <div
        className="w-full max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-border flex items-start justify-between bg-surface/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-accent-subtle text-accent">
                {source_type === 'pdf' && <FileText className="w-4 h-4" />}
                {source_type === 'pptx' && <Presentation className="w-4 h-4" />}
                {source_type === 'video' && <Video className="w-4 h-4" />}
              </span>
              <Badge variant="accent" size="sm">
                Verified Grounding
              </Badge>
              <span className="text-xs text-muted font-mono">
                {source_type.toUpperCase()}
              </span>
            </div>
            <h2 id="source-preview-title" className="text-base font-semibold text-main line-clamp-1">
              {source_title}
            </h2>
          </div>
          <button
            onClick={closeSourceDrawer}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Target location tag */}
          <div className="flex items-center justify-between p-3 bg-surface rounded-lg border border-border">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Origin Location
            </span>
            <span className="text-xs font-mono font-medium text-main">
              {page_number && `Page ${page_number}`}
              {slide_number && `Slide ${slide_number}`}
              {timestamp_label && `Timestamp ${timestamp_label}`}
            </span>
          </div>

          {section_heading && (
            <div>
              <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                Syllabus Section
              </span>
              <p className="text-sm font-medium text-main mt-0.5">{section_heading}</p>
            </div>
          )}

          {/* Highlighted Cited Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-muted font-semibold">
                Cited Text Segment
              </span>
              <span className="text-[11px] text-accent flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct match in material
              </span>
            </div>
            <div className="p-4 rounded-xl bg-accent-subtle/70 border border-accent/25 text-main text-sm leading-relaxed font-sans">
              "{excerpt}"
            </div>
          </div>

          {/* Media preview mockup */}
          {source_type === 'pdf' && (
            <div className="border border-border rounded-xl p-4 bg-bg space-y-3">
              <div className="flex items-center justify-between text-xs text-muted border-b border-border/60 pb-2">
                <span>PDF Document Excerpt Rendering</span>
                <span>Page {page_number || 24} of 142</span>
              </div>
              <div className="text-xs text-muted leading-relaxed font-serif space-y-2 select-none">
                <p>
                  ...in dividing the problem space, the binary search condition enforces strict ordering across the indexed subarray.
                </p>
                <div className="p-2.5 bg-accent-subtle/80 text-main rounded border border-accent/30 font-sans">
                  {excerpt}
                </div>
                <p>
                  Consequently, logarithmic contraction is preserved through monotonic indexing properties.
                </p>
              </div>
            </div>
          )}

          {source_type === 'pptx' && (
            <div className="border border-border rounded-xl p-4 bg-bg space-y-3">
              <div className="flex items-center justify-between text-xs text-muted border-b border-border/60 pb-2">
                <span>Slide Deck View</span>
                <span>Slide {slide_number || 12}</span>
              </div>
              <div className="aspect-16/9 bg-card border border-border rounded-lg p-4 flex flex-col justify-between shadow-xs">
                <div className="text-xs font-bold text-main border-b border-border/40 pb-1">
                  CS 201: Invariant Principles
                </div>
                <div className="p-2 bg-accent-subtle/90 text-main text-xs rounded border border-accent/30">
                  {excerpt}
                </div>
                <div className="text-[10px] text-muted flex justify-between">
                  <span>Instructor: Prof. Vance</span>
                  <span>Slide {slide_number || 12}</span>
                </div>
              </div>
            </div>
          )}

          {source_type === 'video' && (
            <div className="border border-border rounded-xl p-4 bg-bg space-y-3">
              <div className="flex items-center justify-between text-xs text-muted border-b border-border/60 pb-2">
                <span>Synchronized Video Timestamp</span>
                <span>{timestamp_label || '00:45'}</span>
              </div>
              <div className="aspect-16/9 bg-card border border-border rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="w-12 h-12 rounded-full bg-accent text-accent-fg flex items-center justify-center shadow-md">
                  <Video className="w-6 h-6" />
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-muted bg-card/90 px-2.5 py-1 rounded border border-border">
                  <span>Playback: {timestamp_label || '14:32'}</span>
                  <span>Audio Sync Verified</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={closeSourceDrawer}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleOpenViewer}>
            <ExternalLink className="w-4 h-4" />
            Open in Library Viewer
          </Button>
        </div>
      </div>
    </div>
  );
};
