import { memo } from 'react';
// import { AIInsightCard } from '@/components/AIInsightCard';
import { WidgetProps } from '@/types/widget';
import { Trade } from '@/types/trade';

interface AIInsightsWidgetProps extends WidgetProps {
  trades: Trade[];
}

export const AIInsightsWidget = memo(({
  id,
  isEditMode,
  onRemove,
  trades,
}: AIInsightsWidgetProps) => {
  return (
    <div className="h-full">
      {/* AI Insights disabled */}
      <div className="p-4 text-center text-muted-foreground text-sm">
        AI Insights are currently disabled.
      </div>
    </div>
  );
});

AIInsightsWidget.displayName = 'AIInsightsWidget';
