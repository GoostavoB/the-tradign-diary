import { create } from 'zustand';
import { AccessibilityPreset, ACCESSIBILITY_STORAGE_KEYS } from '@/utils/accessibilityPresets';

interface AccessibilityState {
  preset: AccessibilityPreset | null;
  showIconsWithColor: boolean;
  linkUnderlines: boolean;
  simulation: AccessibilityPreset | null;
  applyPresetColors: boolean;
  setPreset: (preset: AccessibilityPreset | null) => void;
  clearPreset: () => void;
  setShowIconsWithColor: (show: boolean) => void;
  setLinkUnderlines: (underline: boolean) => void;
  setSimulation: (simulation: AccessibilityPreset | null) => void;
  setApplyPresetColors: (apply: boolean) => void;
}

// Initialize from localStorage
const getInitialPreset = (): AccessibilityPreset | null => {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEYS.PRESET);
  if (saved && ['deuteranopia', 'protanopia', 'tritanopia', 'high-contrast'].includes(saved)) {
    return saved as AccessibilityPreset;
  }
  return null;
};

const getInitialShowIcons = (): boolean => {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEYS.SHOW_ICONS);
  return saved !== 'false'; // default true
};

const getInitialLinkUnderlines = (): boolean => {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEYS.LINK_UNDERLINES);
  return saved !== 'false'; // default true
};

const getInitialSimulation = (): AccessibilityPreset | null => {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEYS.SIMULATION);
  if (saved && ['deuteranopia', 'protanopia', 'tritanopia', 'high-contrast'].includes(saved)) {
    return saved as AccessibilityPreset;
  }
  return null;
};

const getInitialApplyColors = (): boolean => {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEYS.APPLY_COLORS);
  return saved === 'true'; // default false
};

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  preset: getInitialPreset(),
  showIconsWithColor: getInitialShowIcons(),
  linkUnderlines: getInitialLinkUnderlines(),
  simulation: getInitialSimulation(),
  applyPresetColors: getInitialApplyColors(),
  
  setPreset: (preset) => {
    set({ preset });
    if (preset) {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEYS.PRESET, preset);
    } else {
      localStorage.removeItem(ACCESSIBILITY_STORAGE_KEYS.PRESET);
    }
  },
  
  clearPreset: () => {
    set({ preset: null });
    localStorage.removeItem(ACCESSIBILITY_STORAGE_KEYS.PRESET);
  },
  
  setShowIconsWithColor: (show) => {
    set({ showIconsWithColor: show });
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEYS.SHOW_ICONS, String(show));
  },
  
  setLinkUnderlines: (underline) => {
    set({ linkUnderlines: underline });
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEYS.LINK_UNDERLINES, String(underline));
  },
  
  setSimulation: (simulation) => {
    set({ simulation });
    if (simulation) {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEYS.SIMULATION, simulation);
    } else {
      localStorage.removeItem(ACCESSIBILITY_STORAGE_KEYS.SIMULATION);
    }
  },
  
  setApplyPresetColors: (apply) => {
    set({ applyPresetColors: apply });
    localStorage.setItem(ACCESSIBILITY_STORAGE_KEYS.APPLY_COLORS, String(apply));
  },
}));
