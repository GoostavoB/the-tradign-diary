import { memo } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { formatPercent } from '@/utils/formatNumber';
import { TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AvgROIPerTradeWidgetProps {
  id: string;
  isEditMode?: boolean;
  onRemove?: () => void;
  avgROIPerTrade: number;
  totalTrades: number;
}

export const AvgROIPerTradeWidget = memo(({
  id,
  isEditMode,
  onRemove,
  avgROIPerTrade,
  totalTrades,
}: AvgROIPerTradeWidgetProps) => {
  const { t } = useTranslation();
  const isPositive = avgROIPerTrade >= 0;

  return (
    <WidgetWrapper
      id={id}
      title={t('widgets.avgROIPerTrade.title')}
      isEditMode={isEditMode}
      onRemove={onRemove}
    >
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <AnimatedCounter
            value={Math.abs(avgROIPerTrade)}
            className={`text-3xl font-bold ${isPositive ? 'text-profit' : 'text-loss'}`}
            suffix="%"
            prefix={isPositive ? '' : '-'}
          />
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-profit" />
          ) : (
            <TrendingDown className="h-5 w-5 text-loss" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {t('widgets.avgROIAcross', { count: totalTrades })}
        </p>
      </div>
    </WidgetWrapper>
  );
});

AvgROIPerTradeWidget.displayName = 'AvgROIPerTradeWidget';
