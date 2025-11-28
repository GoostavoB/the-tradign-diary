import { memo } from 'react';
import { useTokenIcon } from '@/hooks/useTokenIcon';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokenIconProps {
  symbol: string | null | undefined;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showFallback?: boolean;
}

const sizeClasses = {
  xs: 'w-4 h-4',
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

/**
 * Reusable component to display token icons
 * Automatically fetches and caches icon from CoinGecko
 */
export const TokenIcon = memo(({ 
  symbol, 
  size = 'md', 
  className,
  showFallback = true 
}: TokenIconProps) => {
  const { iconUrl, loading } = useTokenIcon(symbol);

  const sizeClass = sizeClasses[size];

  if (loading) {
    return (
      <div 
        className={cn(
          sizeClass,
          'rounded-full bg-accent animate-pulse',
          className
        )}
      />
    );
  }

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={symbol || 'Token'}
        className={cn(
          sizeClass,
          'rounded-full object-cover',
          className
        )}
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    );
  }

  // Fallback icon
  if (showFallback) {
    return (
      <div 
        className={cn(
          sizeClass,
          'rounded-full bg-primary/10 flex items-center justify-center',
          className
        )}
      >
        <Coins className={cn(
          size === 'xs' && 'w-2.5 h-2.5',
          size === 'sm' && 'w-3.5 h-3.5',
          size === 'md' && 'w-5 h-5',
          size === 'lg' && 'w-6 h-6',
          'text-primary/60'
        )} />
      </div>
    );
  }

  return null;
});

TokenIcon.displayName = 'TokenIcon';
