/**
 * Resource preloading strategies
 * Optimize initial load and user experience
 */

/**
 * Preload critical fonts
 */
export const preloadFonts = (fonts: string[]) => {
  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.href = fontUrl;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Preload critical images
 */
export const preloadImages = (imageUrls: string[]) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Prefetch route for navigation
 */
export const prefetchRoute = (route: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
};

/**
 * Preconnect to external domains
 */
export const preconnectDomains = (domains: string[]) => {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Prefetch data for likely next navigation
 */
export const prefetchData = async (url: string) => {
  try {
    const response = await fetch(url, { 
      priority: 'low' as RequestPriority 
    });
    return response;
  } catch (error) {
    console.warn('Failed to prefetch:', url, error);
  }
};

/**
 * Intelligent prefetching based on user behavior
 */
export const setupIntelligentPrefetch = () => {
  // Track hover events on links
  const links = document.querySelectorAll('a[href^="/"]');
  
  links.forEach(link => {
    let timeoutId: NodeJS.Timeout;
    
    link.addEventListener('mouseenter', () => {
      // Prefetch after 200ms hover
      timeoutId = setTimeout(() => {
        const href = link.getAttribute('href');
        if (href) prefetchRoute(href);
      }, 200);
    });
    
    link.addEventListener('mouseleave', () => {
      clearTimeout(timeoutId);
    });
  });
};

/**
 * Priority hints for fetch requests
 */
export const fetchWithPriority = async (
  url: string, 
  priority: 'high' | 'low' | 'auto' = 'auto',
  options: RequestInit = {}
) => {
  return fetch(url, {
    ...options,
    priority: priority as RequestPriority,
  });
};
