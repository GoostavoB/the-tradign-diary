// src/components/SEO/MetaTags.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonicalUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  keywords,
  image,
  article = false,
  publishedTime,
  modifiedTime,
  author,
  canonicalUrl,
}) => {
  const location = useLocation();
  const baseUrl = 'https://www.thetradingdiary.com';
  
  // Default values
  const defaultTitle = 'Best Crypto Trading Journal | Multi-Exchange Tracking';
  const defaultDescription = 'Track trades from Binance, Bybit, Coinbase, Kraken automatically. AI-powered insights, XP gamification, and performance analytics for crypto traders.';
  const defaultImage = `${baseUrl}/images/og-image.png`;
  const defaultKeywords = 'trading journal, crypto trading, trade tracker, binance journal, bybit tracking, trading analytics, trading diary';
  
  // Use provided values or defaults
  const pageTitle = title || defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = image || defaultImage;
  const pageKeywords = keywords || defaultKeywords;
  const pageUrl = canonicalUrl || `${baseUrl}${location.pathname}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content="The Trading Diary" />
      
      {article && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {article && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {article && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="The Trading Diary" />
      
      {/* Multilingual Support */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${location.pathname}`} />
      <link rel="alternate" hrefLang="es" href={`${baseUrl}/es${location.pathname}`} />
      <link rel="alternate" hrefLang="pt" href={`${baseUrl}/pt${location.pathname}`} />
      <link rel="alternate" hrefLang="ar" href={`${baseUrl}/ar${location.pathname}`} />
      <link rel="alternate" hrefLang="vi" href={`${baseUrl}/vi${location.pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${location.pathname}`} />
    </Helmet>
  );
};

export default MetaTags;

// Example usage in pages:
/*
// Homepage
<MetaTags 
  title="Best Crypto Trading Journal | Multi-Exchange Tracking"
  description="Track trades from Binance, Bybit, Coinbase, Kraken automatically. AI-powered insights, XP gamification, and performance analytics."
/>

// Blog post
<MetaTags 
  title="How to Track Crypto Trades Effectively | The Trading Diary"
  description="Complete guide to tracking cryptocurrency trades across multiple exchanges. Learn automated tracking methods and performance analytics."
  keywords="crypto trading, trade tracking, binance tracking, automated trading journal"
  article={true}
  publishedTime="2025-11-02T00:00:00Z"
  modifiedTime="2025-11-02T00:00:00Z"
  author="The Trading Diary Team"
  image="https://www.thetradingdiary.com/images/blog/trade-tracking-guide.png"
/>

// Landing page
<MetaTags 
  title="Best Trading Journal App 2025 | Compare Top Tools"
  description="Compare the best trading journal apps for crypto and stocks. See features, pricing, and real user reviews. Find the perfect trading diary."
  keywords="best trading journal, trading journal app, crypto journal, stock trading journal"
/>
*/
