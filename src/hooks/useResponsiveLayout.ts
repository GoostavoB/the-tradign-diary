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
      
      // Enable compact mode for screens between 1024px and 1599px
      const isCompact = width >= 1024 && width < 1600;
      
      // Calculate compact scale (10-15% reduction)
      const compactScale = isCompact ? 0.88 : 1;
      
      // Dynamic column system
      let columns = 12;
      if (isMobile) {
        columns = 4;
      } else if (isTablet) {
        columns = 8;
      } else if (width >= 1024 && width < 1280) {
        columns = 10;
      }
      
      // Row height adjusts based on compact mode
      const rowHeight = isCompact ? 0.88 : 1;

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
