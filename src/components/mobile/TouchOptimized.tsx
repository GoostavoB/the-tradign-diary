/**
 * Touch-optimized wrapper component for mobile interactions
 * Ensures minimum touch target sizes and proper spacing
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TouchOptimizedProps {
  children: ReactNode;
  className?: string;
  minSize?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'min-h-[44px] min-w-[44px]',
  md: 'min-h-[48px] min-w-[48px]',
  lg: 'min-h-[56px] min-w-[56px]',
};

export const TouchOptimized = ({ 
  children, 
  className, 
  minSize = 'md' 
}: TouchOptimizedProps) => {
  return (
    <div className={cn(
      'flex items-center justify-center',
      sizeClasses[minSize],
      className
    )}>
      {children}
    </div>
  );
};
