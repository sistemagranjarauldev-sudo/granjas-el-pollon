import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden', className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, description, action, className, children }) => {
  if (children) {
    return <div className={cn('px-6 py-4 border-b border-slate-100', className)}>{children}</div>;
  }

  return (
    <div className={cn('px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4', className)}>
      <div>
        {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return <div className={cn('px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between', className)}>{children}</div>;
};
