import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className,
  dot = false,
}) => {
  const variants = {
    brand: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    success: 'bg-green-50 text-green-700 border-green-200/60',
    warning: 'bg-amber-50 text-amber-800 border-amber-200/60',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
    info: 'bg-sky-50 text-sky-700 border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
  };

  const dotColors = {
    brand: 'bg-emerald-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
};
