import React from 'react';
import { Citation } from '../../types';
import { FileText, Presentation, Video } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Tooltip } from '../ui/Toast';

export const CitationChip: React.FC<{
  citation: Citation;
  index?: number;
  className?: string;
}> = ({ citation, index, className = '' }) => {
  const { openSourceDrawer } = useApp();

  const getLabel = () => {
    if (citation.source_type === 'pdf') {
      return `Textbook p.${citation.page_number || 1}`;
    }
    if (citation.source_type === 'pptx') {
      return `Slide ${citation.slide_number || 1}`;
    }
    return `Lecture ${citation.timestamp_label || '00:00'}`;
  };

  const getIcon = () => {
    if (citation.source_type === 'pdf') return <FileText className="w-3.5 h-3.5 text-accent" />;
    if (citation.source_type === 'pptx') return <Presentation className="w-3.5 h-3.5 text-accent" />;
    return <Video className="w-3.5 h-3.5 text-accent" />;
  };

  const tooltipPreview = (
    <div className="max-w-xs text-left p-1">
      <div className="text-[11px] font-semibold text-accent mb-1 flex items-center gap-1">
        {getIcon()}
        <span>{citation.source_title}</span>
      </div>
      <p className="text-[11px] text-muted italic line-clamp-3">
        "{citation.excerpt}"
      </p>
      <div className="text-[10px] text-muted/70 mt-1 font-mono">
        Click to open verified excerpt
      </div>
    </div>
  );

  return (
    <Tooltip content={tooltipPreview}>
      <button
        onClick={() => openSourceDrawer(citation)}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-accent-subtle text-accent border border-accent/30 hover:border-accent hover:shadow-xs transition-all duration-150 cursor-pointer ${className}`}
      >
        {getIcon()}
        <span>{getLabel()}</span>
        {index !== undefined && (
          <span className="text-[10px] px-1 py-0.2 rounded-full bg-accent text-accent-fg font-mono font-bold">
            [{index + 1}]
          </span>
        )}
      </button>
    </Tooltip>
  );
};
