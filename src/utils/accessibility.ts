/**
 * Accessibility utilities for improved user experience
 * Provides helpers for ARIA labels, keyboard navigation, and screen readers
 */

/**
 * Format currency for screen readers
 * Converts $1,234.56 to "1234 dollars and 56 cents"
 */
export const formatCurrencyForScreenReader = (value: number): string => {
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const dollars = Math.floor(absValue);
  const cents = Math.round((absValue - dollars) * 100);
  
  let result = `${dollars} dollar${dollars !== 1 ? 's' : ''}`;
  if (cents > 0) {
    result += ` and ${cents} cent${cents !== 1 ? 's' : ''}`;
  }
  
  return isNegative ? `negative ${result}` : result;
};

/**
 * Format percentage for screen readers
 * Converts 75.5% to "75.5 percent"
 */
export const formatPercentForScreenReader = (value: number): string => {
  return `${value.toFixed(1)} percent`;
};

/**
 * Generate descriptive label for trade card
 */
export const getTradeAriaLabel = (trade: {
  symbol?: string;
  pnl?: number;
  side?: string;
  trade_date?: string;
}): string => {
  const symbol = trade.symbol || 'Unknown';
  const pnl = trade.pnl || 0;
  const side = trade.side === 'long' ? 'Long' : 'Short';
  const result = pnl >= 0 ? 'winning' : 'losing';
  const pnlText = formatCurrencyForScreenReader(pnl);
  
  return `${side} trade on ${symbol}, ${result} trade with ${pnlText}`;
};

/**
 * Generate descriptive label for stat card
 */
export const getStatAriaLabel = (
  title: string,
  value: string | number,
  trend?: { value: number; isPositive: boolean }
): string => {
  let label = `${title}: ${value}`;
  
  if (trend) {
    const direction = trend.isPositive ? 'up' : 'down';
    label += `, ${direction} ${Math.abs(trend.value)} percent`;
  }
  
  return label;
};

/**
 * Create announcement for screen readers
 * Used with LiveRegion component
 */
export const createAnnouncement = (
  type: 'success' | 'error' | 'info' | 'warning',
  message: string
): string => {
  const prefix = {
    success: 'Success:',
    error: 'Error:',
    info: 'Information:',
    warning: 'Warning:',
  }[type];
  
  return `${prefix} ${message}`;
};

/**
 * Get keyboard shortcut description
 */
export const getShortcutAriaLabel = (keys: string[]): string => {
  const keyNames = keys.map(key => {
    const mappings: Record<string, string> = {
      'Alt': 'Alt',
      'Ctrl': 'Control',
      'Shift': 'Shift',
      'Enter': 'Enter',
      'Esc': 'Escape',
      '/': 'Forward slash',
      '?': 'Question mark',
    };
    return mappings[key] || key;
  });
  
  return keyNames.join(' plus ');
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Set focus trap for modals and dialogs
   */
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  },
  
  /**
   * Restore focus to previous element
   */
  saveFocus: () => {
    const activeElement = document.activeElement as HTMLElement;
    return () => activeElement?.focus();
  },
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get animation duration based on user preference
 */
export const getAnimationDuration = (defaultMs: number): number => {
  return prefersReducedMotion() ? 0 : defaultMs;
};
