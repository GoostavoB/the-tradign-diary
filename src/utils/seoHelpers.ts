/**
 * SEO helper utilities for dynamic meta tags and structured data
 */

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export interface PageMeta {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
}

/**
 * Update page meta tags dynamically
 */
export const updatePageMeta = (meta: PageMeta) => {
  // Update title
  document.title = meta.title;

  // Update or create meta tags
  const metaTags: MetaTag[] = [
    { name: 'description', content: meta.description },
    { property: 'og:title', content: meta.title },
    { property: 'og:description', content: meta.description },
    { name: 'twitter:title', content: meta.title },
    { name: 'twitter:description', content: meta.description },
  ];

  if (meta.keywords) {
    metaTags.push({ name: 'keywords', content: meta.keywords });
  }

  if (meta.ogImage) {
    metaTags.push(
      { property: 'og:image', content: meta.ogImage },
      { name: 'twitter:image', content: meta.ogImage }
    );
  }

  if (meta.ogType) {
    metaTags.push({ property: 'og:type', content: meta.ogType });
  }

  if (meta.robots) {
    metaTags.push({ name: 'robots', content: meta.robots });
  }

  metaTags.forEach(({ name, property, content }) => {
    const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
    let element = document.querySelector(selector);

    if (!element) {
      element = document.createElement('meta');
      if (name) element.setAttribute('name', name);
      if (property) element.setAttribute('property', property);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  });

  // Update canonical URL
  if (meta.canonical) {
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = meta.canonical;
  }
};

/**
 * Add structured data (JSON-LD) to page
 */
export const addStructuredData = (data: object, id: string = 'structured-data') => {
  // Remove existing script if present
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script tag
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Page-specific meta configurations
 */
export const pageMeta = {
  dashboard: {
    title: 'Dashboard - The Trading Diary',
    description: 'Your personalized trading analytics dashboard with real-time performance tracking and insights.',
    keywords: 'trading dashboard, analytics, performance tracking, trading metrics',
    canonical: 'https://www.thetradingdiary.com/dashboard',
    robots: 'noindex,nofollow',
  },
  upload: {
    title: 'Upload Trades - The Trading Diary',
    description: 'Upload and analyze your trading data with our advanced trade import system.',
    keywords: 'upload trades, import trades, trade data, csv import',
    canonical: 'https://www.thetradingdiary.com/upload',
    robots: 'noindex,nofollow',
  },
  analytics: {
    title: 'Advanced Analytics - The Trading Diary',
    description: 'Deep dive into your trading performance with comprehensive analytics and visualizations.',
    keywords: 'trading analytics, performance analysis, trading statistics, trade insights',
    canonical: 'https://www.thetradingdiary.com/analytics',
    robots: 'noindex,nofollow',
  },
  tools: {
    title: 'Trading Tools - The Trading Diary',
    description: 'Access powerful trading tools including risk calculators, forecasts, and market data.',
    keywords: 'trading tools, risk calculator, trading forecast, market analysis',
    canonical: 'https://www.thetradingdiary.com/tools',
    robots: 'noindex,nofollow',
  },
};
