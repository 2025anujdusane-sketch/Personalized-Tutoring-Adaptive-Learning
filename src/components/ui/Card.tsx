import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'dashed' | 'accent';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-card border border-border text-main shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    surface: 'bg-surface border border-border text-main',
    dashed: 'bg-surface border border-dashed border-border text-main',
    accent: 'bg-accent-subtle border border-accent/20 text-main',
  };

  const hoverClass = hoverEffect
    ? 'transition-all duration-150 hover:border-accent/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
    : '';

  return (
    <div
      className={`rounded-xl p-5 ${variantStyles[variant]} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'attention' | 'neutral' | 'outline' | 'outside';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    accent: 'bg-accent-subtle text-accent border border-accent/20 font-medium',
    attention: 'bg-attention/15 text-attention border border-attention/30 font-medium',
    neutral: 'bg-surface text-muted border border-border font-medium',
    outline: 'border border-border text-muted bg-transparent',
    outside: 'bg-surface border border-dashed border-border text-muted font-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-card border rounded-lg text-main placeholder:text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${
          error ? 'border-attention text-attention focus:ring-attention' : 'border-border'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-attention font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-muted">{helperText}</p>}
    </div>
  );
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthStyles[maxWidth]} bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || description) && (
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              {title && <h3 className="text-base font-semibold text-main">{title}</h3>}
              {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
            </div>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded-md text-muted hover:text-main hover:bg-surface transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export interface TabsProps {
  tabs: { id: string; label: string; count?: number }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center gap-1 p-1 bg-surface rounded-lg border border-border/60 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? 'bg-card text-main shadow-xs font-semibold'
                : 'text-muted hover:text-main'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-accent-subtle text-accent' : 'bg-border/60 text-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export interface ProgressBarProps {
  value: number; // 0 to 100 or 0 to 1
  max?: number;
  showLabel?: boolean;
  color?: 'accent' | 'attention' | 'interpolated';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  color = 'accent',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  // Interpolate between attention (low) and accent (high) strictly using the 3 allowed tokens
  const getInterpolatedBg = () => {
    if (color === 'attention') return 'bg-attention';
    if (color === 'accent') return 'bg-accent';
    if (percentage < 45) return 'bg-attention';
    if (percentage < 70) return 'bg-accent/70';
    return 'bg-accent';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-surface rounded-full overflow-hidden border border-border/40 ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${getInterpolatedBg()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] text-muted mt-1 font-mono">
          <span>{percentage.toFixed(0)}%</span>
          <span>{value}/{max}</span>
        </div>
      )}
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-surface rounded-md ${className}`} />
  );
};
