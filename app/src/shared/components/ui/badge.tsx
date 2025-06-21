/**
 * Badge component - Simple badge UI component
 */

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full';
  
  const variantClasses = {
    default: 'bg-primary-100 text-primary-800',
    secondary: 'bg-neutral-100 text-neutral-800',
    outline: 'border border-neutral-200 text-neutral-700'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
} 
