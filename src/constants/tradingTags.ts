/**
 * Predefined multilingual trading tags for emotions and errors
 */

export const EMOTION_TAGS = [
  'Confident',
  'Fearful',
  'Greedy',
  'Calm',
  'Anxious',
  'FOMO',
  'Revenge Trading',
  'Overconfident',
  'Patient',
  'Disciplined',
  'Impulsive',
  'Stressed',
  'Excited',
  'Frustrated',
  'Euphoric',
] as const;

export const ERROR_TAGS = [
  'No Stop Loss',
  'Overleveraged',
  'Chased Entry',
  'Ignored Setup',
  'Took Profit Too Early',
  'Held Too Long',
  'Averaged Down',
  'Broke Trading Plan',
  'Traded Against Trend',
  'Poor Risk Management',
  'Emotional Entry',
  'Revenge Trade',
  'Overtraded',
  'Wrong Position Size',
  'Ignored Timeframe',
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];
export type ErrorTag = typeof ERROR_TAGS[number];

// Accept any string for custom tags, not just predefined ones
export const getTagColor = (tag: string, type: 'emotion' | 'error'): string => {
  if (type === 'emotion') {
    // Positive emotions - green/blue
    if (['Confident', 'Calm', 'Patient', 'Disciplined'].includes(tag)) {
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    }
    // Negative emotions - red/orange
    if (['Fearful', 'Anxious', 'Stressed', 'Frustrated'].includes(tag)) {
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    }
    // Warning emotions - yellow/orange
    if (['Greedy', 'FOMO', 'Revenge Trading', 'Overconfident', 'Impulsive', 'Excited', 'Euphoric'].includes(tag)) {
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    }
    return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
  }
  
  // All errors (including custom ones) are red/critical
  return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
};
