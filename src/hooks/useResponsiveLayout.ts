import { useState, useEffect } from 'react';

interface ResponsiveLayoutConfig {
  isCompact: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  columns: number;
  containerWidth: number;
  rowHeight: number;
  compactScale: number;
}

export const useResponsiveLayout = (containerWidth: number = 1200) => {
  const [config, setConfig] = useState<ResponsiveLayoutConfig>({
    isCompact: false,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    columns: 12,
    containerWidth,
    rowHeight: 1,
    compactScale: 1,
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = containerWidth || window.innerWidth;
      
      // Determine device type and layout strategy
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Disable compact mode - let widgets use full width on all screens
      const isCompact = false;
      
      // No scaling - use full available space
      const compactScale = 1;
      
      // Dynamic column system - keep 12 columns for desktop to maximize space usage
      let columns = 12;
      if (isMobile) {
        columns = 4;
      } else if (isTablet) {
        columns = 8;
      }
      // Desktop (1024+) keeps full 12 columns to utilize wider screens
      
      // Standard row height
      const rowHeight = 1;

      setConfig({
        isCompact,
        isMobile,
        isTablet,
        isDesktop,
        columns,
        containerWidth: width,
        rowHeight,
        compactScale,
      });
    };

    updateConfig();

    // Listen for window resize
    const handleResize = () => {
      updateConfig();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [containerWidth]);

  // Helper function to scale widget dimensions
  const scaleHeight = (height: number) => {
    return Math.round(height * config.compactScale);
  };

  const scaleWidth = (width: number) => {
    // Adjust width based on column system
    if (config.isMobile) {
      return 4; // Full width on mobile
    }
    if (config.isTablet) {
      return Math.min(width, 8);
    }
    return Math.min(width, config.columns);
  };

  return {
    ...config,
    scaleHeight,
    scaleWidth,
  };
};
