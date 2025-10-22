#!/usr/bin/env node
/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml with up-to-date blog articles and pages
 * Run: npm run generate-sitemap
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Import blog articles data
const blogArticles = [
  {
    slug: 'ai-tools-for-crypto-trading',
    lastmod: '2025-10-22',
    language: 'en',
    alternates: {
      pt: 'ferramentas-ia-trading-cripto',
      es: 'herramientas-ia-trading-cripto',
      ar: 'adawat-ai-trading-crypto-ar',
      vi: 'cong-cu-ai-giao-dich-crypto-vi',
    }
  },
  {
    slug: 'trading-journal-for-crypto',
    lastmod: '2025-10-20',
    language: 'en',
    alternates: {
      pt: 'diario-trading-cripto',
      es: 'diario-trading-cripto-es',
      ar: 'daftar-trading-crypto-ar',
      vi: 'nhat-ky-giao-dich-crypto-vi',
    }
  },
  {
    slug: 'trading-psychology-control-emotions',
    lastmod: '2025-10-17',
    language: 'en',
    alternates: {
      pt: 'psicologia-trading-controlar-emocoes',
      es: 'psicologia-trading-controlar-emocoes-es',
      ar: 'nafsia-trading-ar',
      vi: 'tam-ly-giao-dich-vi',
    }
  },
  {
    slug: 'data-driven-trading',
    lastmod: '2025-10-15',
    language: 'en',
    alternates: {
      pt: 'trading-orientado-dados',
      es: 'trading-basado-datos-es',
      ar: 'trading-bayanat-ar',
      vi: 'giao-dich-du-lieu-vi',
    }
  },
  {
    slug: 'ai-powered-trading-journal',
    lastmod: '2025-10-13',
    language: 'en',
    alternates: {
      pt: 'diario-trading-ia',
      es: 'diario-trading-ia-es',
      ar: 'daftar-ai-ar',
      vi: 'nhat-ky-ai-vi',
    }
  }
];

const staticPages = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/pt', priority: '1.0', changefreq: 'weekly' },
  { loc: '/es', priority: '1.0', changefreq: 'weekly' },
  { loc: '/ar', priority: '1.0', changefreq: 'weekly' },
  { loc: '/vi', priority: '1.0', changefreq: 'weekly' },
  { loc: '/auth', priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  { loc: '/crypto-trading-faq', priority: '0.7', changefreq: 'monthly' },
  { loc: '/logo-download', priority: '0.5', changefreq: 'yearly' },
];

function generateHreflangLinks(article: typeof blogArticles[0]) {
  const baseUrl = 'https://www.thetradingdiary.com/blog';
  let links = '';
  
  // English
  links += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/${article.slug}" />\n`;
  
  // Other languages
  Object.entries(article.alternates).forEach(([lang, slug]) => {
    links += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/${slug}" />\n`;
  });
  
  return links;
}

function generateLandingHreflang() {
  return `    <xhtml:link rel="alternate" hreflang="en" href="https://www.thetradingdiary.com/" />
    <xhtml:link rel="alternate" hreflang="pt" href="https://www.thetradingdiary.com/pt" />
    <xhtml:link rel="alternate" hreflang="es" href="https://www.thetradingdiary.com/es" />
    <xhtml:link rel="alternate" hreflang="ar" href="https://www.thetradingdiary.com/ar" />
    <xhtml:link rel="alternate" hreflang="vi" href="https://www.thetradingdiary.com/vi" />
    <xhtml:link rel="alternate" hreflang="x-default" href="https://www.thetradingdiary.com/" />`;
}

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  
`;

  // Add landing pages with hreflang
  const landingPages = ['/', '/pt', '/es', '/ar', '/vi'];
  landingPages.forEach(page => {
    const pageMeta = staticPages.find(p => p.loc === page);
    xml += `  <url>
    <loc>https://www.thetradingdiary.com${page === '/' ? '' : page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${pageMeta?.changefreq || 'weekly'}</changefreq>
    <priority>${pageMeta?.priority || '1.0'}</priority>
${generateLandingHreflang()}
  </url>
  
`;
  });

  // Add other static pages
  staticPages
    .filter(p => !landingPages.includes(p.loc))
    .forEach(page => {
      xml += `  <url>
    <loc>https://www.thetradingdiary.com${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
  
`;
    });

  // Add blog articles with hreflang
  blogArticles.forEach(article => {
    xml += `  <!-- Blog: ${article.slug} -->
  <url>
    <loc>https://www.thetradingdiary.com/blog/${article.slug}</loc>
    <lastmod>${article.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
${generateHreflangLinks(article)}
  </url>
  
`;
  });

  xml += `</urlset>`;

  return xml;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = join(process.cwd(), 'public', 'sitemap.xml');

try {
  writeFileSync(outputPath, sitemap, 'utf8');
  console.log('✅ Sitemap generated successfully at:', outputPath);
  console.log(`📊 Total URLs: ${blogArticles.length + staticPages.length}`);
} catch (error) {
  console.error('❌ Error generating sitemap:', error);
  process.exit(1);
}
