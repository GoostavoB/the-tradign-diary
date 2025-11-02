// src/components/SEO/SchemaMarkup.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SchemaMarkupProps {
  type?: 'product' | 'article' | 'faq' | 'breadcrumb';
  data?: any;
}

const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ type = 'product', data }) => {
  const location = useLocation();
  const baseUrl = 'https://www.thetradingdiary.com';
  
  // Default Product Schema (for homepage and main pages)
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "The Trading Diary",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/InStock",
      "url": `${baseUrl}/pricing`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "156",
      "bestRating": "5",
      "worstRating": "1"
    },
    "description": "Multi-exchange crypto trading journal with automated trade tracking, AI-powered insights, and gamified performance analytics.",
    "featureList": [
      "Multi-exchange integration (Binance, Bybit, Coinbase, Kraken)",
      "Automated trade import",
      "AI-powered trading insights",
      "XP and gamification system",
      "Performance analytics",
      "Risk management tools",
      "Tax report generation",
      "Mobile and web access"
    ],
    "screenshot": `${baseUrl}/images/dashboard-screenshot.png`,
    "softwareVersion": "2.0",
    "datePublished": "2024-01-01",
    "provider": {
      "@type": "Organization",
      "name": "The Trading Diary",
      "url": baseUrl,
      "logo": `${baseUrl}/logo.png`,
      "sameAs": [
        "https://twitter.com/thetradingdiary",
        "https://linkedin.com/company/thetradingdiary"
      ]
    }
  };

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Trading Diary",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Leading crypto trading journal platform with multi-exchange integration",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Support",
      "email": "support@thetradingdiary.com",
      "availableLanguage": ["English", "Spanish", "Portuguese", "Arabic", "Vietnamese"]
    },
    "sameAs": [
      "https://twitter.com/thetradingdiary",
      "https://linkedin.com/company/thetradingdiary"
    ]
  };

  // Breadcrumb Schema (for navigation)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Features",
        "item": `${baseUrl}/features`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Pricing",
        "item": `${baseUrl}/pricing`
      }
    ]
  };

  // FAQ Schema (for FAQ pages)
  const faqSchemaExample = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What exchanges does The Trading Diary support?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The Trading Diary supports Binance, Bybit, Coinbase, Kraken, and many other major cryptocurrency exchanges through API integration."
        }
      },
      {
        "@type": "Question",
        "name": "Is The Trading Diary free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, The Trading Diary offers a free tier with basic features. Premium plans start at $9.99/month with advanced analytics and unlimited trade tracking."
        }
      },
      {
        "@type": "Question",
        "name": "How does automated trade tracking work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply connect your exchange API (read-only permissions) and The Trading Diary automatically imports all your trades, calculates P&L, and generates performance analytics."
        }
      }
    ]
  };

  // Article Schema (for blog posts)
  const articleSchemaExample = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "How to Track Crypto Trades Effectively",
    "image": `${baseUrl}/images/blog/trade-tracking-guide.png`,
    "author": {
      "@type": "Person",
      "name": "The Trading Diary Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Trading Diary",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "datePublished": "2025-11-02",
    "dateModified": "2025-11-02",
    "description": "Complete guide to tracking cryptocurrency trades across multiple exchanges with automated tools and performance analytics."
  };

  // Select schema based on type and data
  let schema;
  if (data) {
    schema = data;
  } else {
    switch (type) {
      case 'article':
        schema = articleSchemaExample;
        break;
      case 'faq':
        schema = faqSchemaExample;
        break;
      case 'breadcrumb':
        schema = breadcrumbSchema;
        break;
      default:
        schema = productSchema;
    }
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
      {/* Always include organization schema */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
};

export default SchemaMarkup;

// Helper function to create FAQ schema dynamically
export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

// Helper function to create Article schema dynamically
export const createArticleSchema = (article: {
  title: string;
  description: string;
  image: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  url: string;
}) => {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Trading Diary",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.thetradingdiary.com/logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "description": article.description,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
};

// Example usage:
/*
// Homepage - use default product schema
<SchemaMarkup />

// Blog post with custom article data
<SchemaMarkup 
  type="article"
  data={createArticleSchema({
    title: "How to Track Crypto Trades",
    description: "Complete guide to crypto trade tracking",
    image: "https://www.thetradingdiary.com/images/blog/guide.png",
    author: "Trading Diary Team",
    datePublished: "2025-11-02",
    url: "https://www.thetradingdiary.com/blog/how-to-track-crypto-trades"
  })}
/>

// FAQ page with dynamic questions
<SchemaMarkup 
  type="faq"
  data={createFAQSchema([
    {
      question: "What exchanges are supported?",
      answer: "Binance, Bybit, Coinbase, Kraken, and more."
    },
    {
      question: "Is it free?",
      answer: "Yes, we offer a free tier with basic features."
    }
  ])}
/>
*/
