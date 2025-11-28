import { useEffect } from 'react';
import { 
  AccessibilityPreset, 
  ACCESSIBILITY_PRESETS, 
  getAccessibilityPreset,
} from '@/utils/accessibilityPresets';
import { ColorMode } from './useThemeMode';
import { useAccessibilityStore } from '@/stores/accessibility';

export function useAccessibilityMode() {
  const {
    preset,
    showIconsWithColor,
    linkUnderlines,
    simulation,
    applyPresetColors,
    setPreset,
    clearPreset,
    setShowIconsWithColor,
    setLinkUnderlines,
    setSimulation,
    setApplyPresetColors,
  } = useAccessibilityStore();

  // Apply link underlines setting
  useEffect(() => {
    if (linkUnderlines) {
      document.documentElement.classList.add('accessibility-link-underlines');
    } else {
      document.documentElement.classList.remove('accessibility-link-underlines');
    }
  }, [linkUnderlines]);

  // Apply simulation filter
  useEffect(() => {
    const root = document.documentElement;
    if (simulation) {
      root.setAttribute('data-color-simulation', simulation);
    } else {
      root.removeAttribute('data-color-simulation');
    }
  }, [simulation]);

  const getActivePresetTheme = (): ColorMode | null => {
    if (!preset) return null;
    return getAccessibilityPreset(preset) || null;
  };

  return {
    settings: {
      preset,
      showIconsWithColor,
      linkUnderlines,
      simulation,
      applyPresetColors,
    },
    presets: ACCESSIBILITY_PRESETS,
    activePreset: preset,
    activePresetTheme: getActivePresetTheme(),
    setPreset,
    clearPreset,
    showIconsWithColor,
    setShowIconsWithColor,
    linkUnderlines,
    setLinkUnderlines,
    simulation,
    setSimulation,
    applyPresetColors,
    setApplyPresetColors,
  };
}
