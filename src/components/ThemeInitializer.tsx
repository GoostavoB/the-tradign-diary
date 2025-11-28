import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { UNIFIED_THEMES } from '@/utils/unifiedThemes';
import { ColorMode } from '@/hooks/useThemeMode';

/**
 * ThemeInitializer - Applies saved theme colors immediately on app load
 * This component runs at the app root level to ensure theme colors are
 * applied before any pages render, preventing color flashing.
 * 
 * NOTE: Custom themes are ONLY applied on authenticated routes.
 * Public pages (landing, blog, pricing) always use default theme.
 */
export const ThemeInitializer = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Define public routes that should always use default theme
    const publicRoutes = [
      '/', '/pt', '/es', '/ar', '/vi',
      '/pricing', '/contact', '/legal', '/terms', '/privacy',
      '/blog', '/about', '/testimonials', '/how-it-works', '/features',
      '/changelog', '/cookie-policy', '/sitemap', '/logo-download', 
      '/logo-generator', '/crypto-trading-faq', '/seo-dashboard', '/author'
    ];
    
    // Check if current route is public or a blog/author post
    const isPublicRoute = publicRoutes.some(route => 
      location.pathname === route || 
      location.pathname.startsWith('/blog/') ||
      location.pathname.startsWith('/author/') ||
      location.pathname.match(/^\/(pt|es|ar|vi)\/(pricing|contact|legal|terms|privacy|blog|about|cookie-policy)/)
    );
    
    // If on public route, skip custom theme application (PublicPageThemeWrapper handles it)
    if (isPublicRoute) {
      return;
    }
    
    // Load and apply theme synchronously on mount for authenticated routes
    const savedMode = localStorage.getItem('theme:mode') || 'default';
    const savedCustomModes = localStorage.getItem('theme:custom-modes');
    
    let customModes: ColorMode[] = [];
    if (savedCustomModes) {
      try {
        customModes = JSON.parse(savedCustomModes);
      } catch (e) {
        console.error('Failed to parse custom modes', e);
      }
    }
    
    // Find and apply the theme immediately
    const allModes = [...UNIFIED_THEMES, ...customModes];
    const mode = allModes.find(m => m.id === savedMode);
    
    if (mode) {
      // Apply theme colors without transition for instant effect
      const root = document.documentElement;
      root.style.setProperty('--primary', mode.primary);
      root.style.setProperty('--secondary', mode.secondary);
      root.style.setProperty('--accent', mode.accent);
      root.style.setProperty('--profit', mode.profit);
      root.style.setProperty('--loss', mode.loss);
      root.style.setProperty('--chart-1', mode.accent);
      root.style.setProperty('--chart-2', mode.primary);
      root.style.setProperty('--chart-3', mode.secondary);
      root.style.setProperty('--neon-green', mode.profit);
      root.style.setProperty('--neon-red', mode.loss);
      
      console.log('✅ Theme initialized:', savedMode, 'Colors:', {
        primary: mode.primary,
        profit: mode.profit,
        loss: mode.loss
      });
    } else {
      console.warn('⚠️ Theme not found, using default:', savedMode);
    }
  }, [location.pathname]); // Re-run when route changes
  
  // This component doesn't render anything
  return null;
};
