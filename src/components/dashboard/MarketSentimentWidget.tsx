import { PremiumCard } from '@/components/ui/PremiumCard';
import { FearGreedIndex } from '@/components/FearGreedIndex';
import { useTranslation } from '@/hooks/useTranslation';
import { TrendingUp } from 'lucide-react';

export const MarketSentimentWidget = () => {
  const { t } = useTranslation();

  return (
    <PremiumCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold">{t('dashboard.marketSentiment')}</h2>
      </div>
      <FearGreedIndex />
    </PremiumCard>
  );
};
