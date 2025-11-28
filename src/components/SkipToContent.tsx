import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SkipToContentProps {
  targetId?: string;
  className?: string;
}

/**
 * Accessibility component for keyboard navigation
 * Provides skip link to main content for screen readers and keyboard users
 */
const SkipToContentComponent = ({ 
  targetId = 'main-content',
  className 
}: SkipToContentProps) => {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        // Hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        // Styling
        "focus:z-[100] focus:px-6 focus:py-3",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-lg focus:shadow-lg",
        "focus:font-semibold focus:text-sm",
        // Animation
        "focus:animate-slide-up",
        // Ensure it's above all content
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        className
      )}
    >
      Skip to main content
    </a>
  );
};

export const SkipToContent = memo(SkipToContentComponent);
SkipToContent.displayName = 'SkipToContent';
