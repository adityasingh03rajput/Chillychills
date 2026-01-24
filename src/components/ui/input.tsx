import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={`flex h-14 w-full rounded-2xl border border-[var(--border-color)] bg-[var(--input-bg)] px-6 py-3 text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-orange)] focus:ring-4 focus:ring-[var(--accent-orange)]/10 outline-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';
