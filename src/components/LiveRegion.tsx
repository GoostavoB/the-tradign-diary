import { memo, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface LiveRegionProps {
  children: ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

/**
 * ARIA live region for announcing dynamic content updates
 * Screen readers will announce changes based on politeness level
 * 
 * @param politeness - How urgently screen reader should announce
 *   - 'polite': Wait for idle time (default, non-urgent updates)
 *   - 'assertive': Interrupt immediately (urgent updates)
 *   - 'off': No announcements
 * @param atomic - Whether to read entire region or just changes
 * @param relevant - What types of changes to announce
 */
const LiveRegionComponent = ({
  children,
  politeness = 'polite',
  atomic = true,
  relevant = 'all',
  className,
}: LiveRegionProps) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={cn('sr-only', className)}
      role="status"
    >
      {children}
    </div>
  );
};

export const LiveRegion = memo(LiveRegionComponent);
LiveRegion.displayName = 'LiveRegion';
