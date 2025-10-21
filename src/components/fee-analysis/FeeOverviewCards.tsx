import { memo } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { Receipt, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FeeOverviewCardsProps {
  totalFeesPaid: number;
  avgFeePercent: number;
  bestExchange: { name: string; feePercent: number } | null;
  worstExchange: { name: string; feePercent: number } | null;
}

export const FeeOverviewCards = memo(({ 
  totalFeesPaid, 
  avgFeePercent, 
  bestExchange, 
  worstExchange 
}: FeeOverviewCardsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <GlassCard>
        <div className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm text-muted-foreground">{t('feeAnalysis.totalFees')}</p>
            <AnimatedCounter 
              value={totalFeesPaid} 
              prefix="$" 
              decimals={2} 
              className="text-3xl font-bold text-red-500" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('feeAnalysis.feeImpact')}: <span className="text-amber-500">{avgFeePercent.toFixed(3)}%</span> {t('feeAnalysis.ofVolume')}
            </p>
          </div>
          <Receipt className="h-10 w-10 text-red-500/50" />
        </div>
      </GlassCard>
      
      {bestExchange && (
        <GlassCard>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">{t('feeAnalysis.mostEfficient')}</p>
              <p className="text-2xl font-bold text-green-500">{bestExchange.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {bestExchange.feePercent.toFixed(3)}% {t('feeAnalysis.avgFee')}
              </p>
            </div>
            <TrendingDown className="h-10 w-10 text-green-500/50" />
          </div>
        </GlassCard>
      )}
      
      {worstExchange && (
        <GlassCard>
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-muted-foreground">{t('feeAnalysis.leastEfficient')}</p>
              <p className="text-2xl font-bold text-amber-500">{worstExchange.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {worstExchange.feePercent.toFixed(3)}% {t('feeAnalysis.avgFee')}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-amber-500/50" />
          </div>
        </GlassCard>
      )}
    </div>
  );
});

FeeOverviewCards.displayName = 'FeeOverviewCards';
