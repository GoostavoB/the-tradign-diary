/**
 * Hook to track article reading behavior
 * Temporarily disabled due to TypeScript issues
 */
interface UseArticleTrackingProps {
  articleSlug: string;
  articleTitle: string;
  category: string;
}

export const useArticleTracking = ({ articleSlug, articleTitle, category }: UseArticleTrackingProps) => {
  // Analytics tracking temporarily disabled
};
