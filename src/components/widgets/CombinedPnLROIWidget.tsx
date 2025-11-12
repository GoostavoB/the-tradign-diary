import { memo } from 'react';
import { WidgetWrapper } from './WidgetWrapper';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { BlurredCurrency } from '@/components/ui/BlurredValue';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface CombinedPnLROIWidgetProps {
  id: string;
  isEditMode?: boolean;
  onRemove?: () => void;
  avgPnLPerTrade: number;
  avgROIPerTrade: number;
}

export const CombinedPnLROIWidget = memo(({
  id,
  isEditMode,
  onRemove,
  avgPnLPerTrade,
  avgROIPerTrade,
}: CombinedPnLROIWidgetProps) => {
  const { t } = useTranslation();
  const isPnLPositive = avgPnLPerTrade >= 0;
  const isROIPositive = avgROIPerTrade >= 0;

  return (
    <TooltipProvider>
      <WidgetWrapper
        id={id}
        title={t('widgets.avgMetrics.title')}
        isEditMode={isEditMode}
        onRemove={onRemove}
        headerActions={
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px]">
              <p className="text-xs leading-relaxed">
                <strong>Note:</strong> Avg P&L can be positive while Avg ROI is negative (or vice versa) if you have different position sizes.
                <br /><br />
                Small losing trades with high negative ROI% can outweigh large winning trades with modest positive ROI%.
              </p>
            </TooltipContent>
          </Tooltip>
        }
      >
        <div className="space-y-4">
          {/* Avg P&L Per Trade */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('widgets.avgPnLPerTrade.title')}</p>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${isPnLPositive ? 'text-profit' : 'text-loss'}`}>
                {isPnLPositive ? '' : '-'}
                <BlurredCurrency amount={Math.abs(avgPnLPerTrade)} className="inline" />
              </div>
              {isPnLPositive ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-border" />

          {/* Avg ROI Per Trade */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{t('widgets.avgROIPerTrade.title')}</p>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${isROIPositive ? 'text-profit' : 'text-loss'}`}>
                {isROIPositive ? '' : '-'}
                {Math.abs(avgROIPerTrade).toFixed(2)}%
              </div>
              {isROIPositive ? (
                <TrendingUp className="h-4 w-4 text-profit" />
              ) : (
                <TrendingDown className="h-4 w-4 text-loss" />
              )}
            </div>
          </div>
        </div>
      </WidgetWrapper>
    </TooltipProvider>
  );
});

CombinedPnLROIWidget.displayName = 'CombinedPnLROIWidget';
