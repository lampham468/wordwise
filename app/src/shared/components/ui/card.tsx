/**
 * Card components - Simple card UI components
 */

import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`bg-white border border-neutral-200 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`px-6 py-4 border-b border-neutral-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3 
      className={`text-lg font-semibold text-neutral-900 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`px-6 py-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
} 
