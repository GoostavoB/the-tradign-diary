export interface BlogArticle {
  title: string;
  description: string;
  readTime: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  tags?: string[];
  canonical?: string;
  language?: string;
  heroImage?: string;
  heroImageAlt?: string;
}

// Import language-specific articles
import { englishArticles } from './blogArticles/englishArticles';
import { portugueseArticles } from './blogArticles/portugueseArticles';
import { spanishArticles } from './blogArticles/spanishArticles';
import { arabicArticles } from './blogArticles/arabicArticles';
import { vietnameseArticles } from './blogArticles/vietnameseArticles';

// Combine all articles
export const blogArticles: BlogArticle[] = [
  ...englishArticles,
  ...portugueseArticles,
  ...spanishArticles,
  ...arabicArticles,
  ...vietnameseArticles,
];

// Helper function to get articles by language
export const getArticlesByLanguage = (language: string): BlogArticle[] => {
  return blogArticles.filter(article => article.language === language);
};

// Helper function to get article by slug
export const getArticleBySlug = (slug: string): BlogArticle | undefined => {
  return blogArticles.find(article => article.slug === slug);
};

// Helper function to get related articles
export const getRelatedArticles = (currentSlug: string, limit: number = 3): BlogArticle[] => {
  const currentArticle = getArticleBySlug(currentSlug);
  if (!currentArticle) return [];
  
  return blogArticles
    .filter(article => 
      article.slug !== currentSlug && 
      article.language === currentArticle.language
    )
    .slice(0, limit);
};
