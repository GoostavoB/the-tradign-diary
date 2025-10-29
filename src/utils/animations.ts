/**
 * Shared animation variants for consistent motion across the app
 * Uses design tokens for timing and easing
 */

import { Variants } from 'framer-motion';
import { animation } from './designTokens';

// Parse timing values from design tokens
const timings = {
  instant: parseInt(animation.instant),
  fast: parseInt(animation.fast),
  normal: parseInt(animation.normal),
  slow: parseInt(animation.slow),
};

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: timings.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { opacity: 0, y: -10 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: timings.fast / 1000,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { opacity: 0, scale: 0.95 },
};

export const springIn: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20,
    }
  },
  exit: { opacity: 0, scale: 0.8 },
};

export const slideInRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: timings.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { x: 100, opacity: 0 },
};

export const slideInLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { 
    x: 0, 
    opacity: 1,
    transition: {
      duration: timings.normal / 1000,
      ease: [0.4, 0, 0.2, 1],
    }
  },
  exit: { x: -100, opacity: 0 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    }
  },
  exit: {},
};

export const cardHover = {
  scale: 1.02,
  y: -4,
  transition: {
    duration: timings.fast / 1000,
    ease: [0.4, 0, 0.2, 1],
  }
};

export const cardTap = {
  scale: 0.98,
  transition: {
    duration: timings.instant / 1000,
  }
};

export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      duration: timings.fast / 1000,
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: timings.fast / 1000,
    }
  },
};

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: {
      duration: timings.fast / 1000,
    }
  },
};

/**
 * Respect user's motion preferences
 */
export const getReducedMotionVariants = (variants: Variants): Variants => {
  if (typeof window === 'undefined') return variants;
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) return variants;
  
  // Simplify animations for reduced motion
  return Object.keys(variants).reduce((acc, key) => {
    const state = variants[key];
    if (typeof state === 'object') {
      acc[key] = { ...state, transition: { duration: 0.01 } };
    }
    return acc;
  }, {} as Variants);
};
