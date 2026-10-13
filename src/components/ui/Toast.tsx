import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-card border border-border rounded-xl shadow-lg text-main text-xs transition-all animate-in slide-in-from-bottom-2 duration-150"
          >
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            )}
            {toast.type === 'attention' && (
              <AlertTriangle className="w-4 h-4 text-attention shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            )}
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted hover:text-main p-0.5 cursor-pointer rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </aside>
  );
};

export const Tooltip: React.FC<{
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ content, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 px-2.5 py-1.5 text-xs text-main bg-card border border-border rounded-lg shadow-md whitespace-nowrap pointer-events-none animate-in fade-in-50 zoom-in-95 duration-100">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-border" />
        </div>
      )}
    </div>
  );
};
