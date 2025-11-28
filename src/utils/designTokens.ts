/**
 * Design Tokens - 8px Grid System
 * All spacing should use these values to maintain consistency
 */

export const spacing = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
} as const;

export const layout = {
  // Section spacing
  sectionPaddingMobile: '24px',
  sectionPaddingTablet: '28px',
  sectionPaddingDesktop: '32px',
  
  // Content widths
  maxContentWidth: '640px',
  maxContainerWidth: '1280px',
  maxWideWidth: '1440px',
  
  // Card spacing
  cardPaddingSm: '16px',
  cardPaddingMd: '24px',
  cardPaddingLg: '32px',
  
  // Component gaps
  gapXs: '8px',
  gapSm: '12px',
  gapMd: '16px',
  gapLg: '24px',
  gapXl: '32px',
} as const;

export const accessibility = {
  // Minimum tap target sizes (WCAG)
  minTouchTarget: '44px',
  recommendedTouchTarget: '48px',
  
  // Spacing between interactive elements
  minInteractiveSpacing: '8px',
  recommendedInteractiveSpacing: '12px',
  
  // Focus ring
  focusRingWidth: '2px',
  focusRingOffset: '2px',
} as const;

export const typography = {
  // Responsive text sizes
  h1Min: '28px',
  h1Preferred: '4.5vw',
  h1Max: '40px',
  
  bodyMin: '16px',
  bodyPreferred: '1rem',
  bodyMax: '18px',
  
  // Line heights
  headingLineHeight: 1.2,
  bodyLineHeight: 1.5,
  compactLineHeight: 1.45,
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  full: '9999px',
} as const;

export const animation = {
  // Durations
  instant: '100ms',
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  
  // Easing
  easeOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
