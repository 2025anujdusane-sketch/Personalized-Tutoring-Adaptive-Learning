import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'attention';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-lg',
    md: 'px-3.5 py-2 text-sm font-medium rounded-lg',
    lg: 'px-5 py-2.5 text-base font-semibold rounded-lg',
  };

  const variantStyles = {
    // Primary: high-contrast text on primary accent
    primary:
      'bg-accent text-accent-fg hover:opacity-95 shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
    // Secondary: subtle secondary surface
    secondary:
      'bg-surface text-main hover:bg-border/60 border border-border/80 focus-visible:ring-2 focus-visible:ring-accent',
    // Outline: crisp border
    outline:
      'bg-transparent border border-border text-main hover:bg-surface/70 focus-visible:ring-2 focus-visible:ring-accent',
    // Ghost: quiet text
    ghost:
      'bg-transparent text-muted hover:text-main hover:bg-surface/60 focus-visible:ring-2 focus-visible:ring-accent',
    // Attention: review/weak topics
    attention:
      'bg-attention text-white dark:text-[#141A18] hover:opacity-90 shadow-sm focus-visible:ring-2 focus-visible:ring-attention',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
