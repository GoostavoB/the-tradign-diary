/**
 * WCAG AA Contrast Validation Utilities
 * Minimum contrast ratio: 4.5:1 for normal text
 */

export interface ContrastValidationResult {
  isValid: boolean;
  score: number;
  failedPairs: string[];
}

/**
 * Convert HSL string to RGB values
 */
const hslToRgb = (hsl: string): [number, number, number] => {
  const parts = hsl.split(' ');
  const h = parseFloat(parts[0]) / 360;
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

/**
 * Calculate relative luminance for WCAG
 */
const getLuminance = (rgb: [number, number, number]): number => {
  const [r, g, b] = rgb.map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Calculate contrast ratio between two colors
 * @returns Ratio from 1:1 to 21:1
 */
export const calculateContrast = (color1: string, color2: string): number => {
  const rgb1 = hslToRgb(color1);
  const rgb2 = hslToRgb(color2);

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Validate theme contrast against WCAG AA standards
 */
export const validateThemeContrast = (tokens: {
  primary: string;
  secondary: string;
  accent: string;
  profit: string;
  loss: string;
}): ContrastValidationResult => {
  const failedPairs: string[] = [];
  let minScore = 21; // Maximum possible

  // Assume background is light (white-ish: 0 0% 100%)
  const lightBg = '0 0% 100%';
  // Assume dark mode background (dark: 0 0% 9%)
  const darkBg = '0 0% 9%';

  // Check all colors against both backgrounds
  const colorsToCheck = [
    { name: 'primary', value: tokens.primary },
    { name: 'secondary', value: tokens.secondary },
    { name: 'accent', value: tokens.accent },
    { name: 'profit', value: tokens.profit },
    { name: 'loss', value: tokens.loss },
  ];

  colorsToCheck.forEach(color => {
    const lightContrast = calculateContrast(color.value, lightBg);
    const darkContrast = calculateContrast(color.value, darkBg);
    
    // Need good contrast in at least one mode
    const bestContrast = Math.max(lightContrast, darkContrast);
    
    if (bestContrast < 4.5) {
      failedPairs.push(`${color.name} (${bestContrast.toFixed(2)}:1)`);
    }
    
    minScore = Math.min(minScore, bestContrast);
  });

  return {
    isValid: failedPairs.length === 0,
    score: minScore,
    failedPairs,
  };
};

/**
 * Limit chroma (saturation) to reduce eye strain on large surfaces
 */
export const limitChroma = (hsl: string, maxSaturation: number = 60): string => {
  const parts = hsl.split(' ');
  const h = parts[0];
  const s = parseFloat(parts[1]);
  const l = parts[2];

  const limitedS = Math.min(s, maxSaturation);

  return `${h} ${limitedS}% ${l}`;
};

/**
 * Get contrast description for UI feedback
 */
export const getContrastDescription = (ratio: number): string => {
  if (ratio >= 7) return 'Excellent (AAA)';
  if (ratio >= 4.5) return 'Good (AA)';
  if (ratio >= 3) return 'Poor (below AA)';
  return 'Fail (unreadable)';
};
