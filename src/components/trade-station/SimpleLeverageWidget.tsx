import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  calculateLeverageMetrics, 
  stopPriceFromPercent, 
  stopPercentFromPrices,
  type Side 
} from '@/utils/leverageCalculations';
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper';
import { WidgetProps } from '@/types/widget';

interface SimpleLeverageWidgetProps extends WidgetProps {}

export const SimpleLeverageWidget = ({ 
  id, 
  isEditMode, 
  onRemove, 
  onExpand 
}: SimpleLeverageWidgetProps) => {
  const [entryPrice, setEntryPrice] = useState('50000');
  const [stopPercent, setStopPercent] = useState('1.0');
  const [stopPrice, setStopPrice] = useState('');
  const [side, setSide] = useState<Side>('long');
  const [lastEdited, setLastEdited] = useState<'percent' | 'price'>('percent');

  // Bidirectional sync between stop % and stop price
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    if (!entry || entry <= 0) return;

    if (lastEdited === 'percent') {
      const percent = parseFloat(stopPercent);
      if (!isNaN(percent) && percent > 0) {
        const calculatedPrice = stopPriceFromPercent(entry, percent, side);
        setStopPrice(calculatedPrice.toFixed(2));
      }
    } else if (lastEdited === 'price') {
      const price = parseFloat(stopPrice);
      if (!isNaN(price) && price > 0) {
        const calculatedPercent = stopPercentFromPrices(entry, price);
        setStopPercent(calculatedPercent.toFixed(2));
      }
    }
  }, [entryPrice, stopPercent, stopPrice, side, lastEdited]);

  const handleStopPercentChange = (value: string) => {
    setStopPercent(value);
    setLastEdited('percent');
  };

  const handleStopPriceChange = (value: string) => {
    setStopPrice(value);
    setLastEdited('price');
  };

  // Calculate results
  const entry = parseFloat(entryPrice);
  const stop = parseFloat(stopPrice);
  
  const result = entry > 0 && stop > 0 
    ? calculateLeverageMetrics(entry, stop, null, side, 0.5, 100, null, 'quote')
    : null;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-state-success border-state-success/20 bg-state-success/10';
      case 'Medium': return 'text-state-warning border-state-warning/20 bg-state-warning/10';
      case 'High': return 'text-state-error border-state-error/20 bg-state-error/10';
      default: return 'text-muted-foreground border-border/20 bg-muted/10';
    }
  };

  return (
    <WidgetWrapper
      id={id}
      title="Leverage Calculator"
      isEditMode={isEditMode}
      onRemove={onRemove}
      onExpand={onExpand}
    >
      {/* Side selector */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={side === 'long' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSide('long')}
          className={side === 'long' ? 'bg-state-success hover:bg-state-success/90' : ''}
        >
          Long
        </Button>
        <Button
          variant={side === 'short' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSide('short')}
          className={side === 'short' ? 'bg-state-error hover:bg-state-error/90' : ''}
        >
          Short
        </Button>
      </div>

      {/* Input fields */}
      <div className="space-y-3 mb-4">
        <div>
          <Label htmlFor="entry-price" className="text-xs text-muted-foreground">
            Entry Price
          </Label>
          <Input
            id="entry-price"
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            placeholder="50000"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="stop-percent" className="text-xs text-muted-foreground">
            Stop % from Entry
          </Label>
          <Input
            id="stop-percent"
            type="number"
            step="0.1"
            value={stopPercent}
            onChange={(e) => handleStopPercentChange(e.target.value)}
            placeholder="1.0"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="stop-price" className="text-xs text-muted-foreground">
            Stop Loss Price
          </Label>
          <Input
            id="stop-price"
            type="number"
            value={stopPrice}
            onChange={(e) => handleStopPriceChange(e.target.value)}
            placeholder="49500"
            className="mt-1"
          />
        </div>
      </div>

      {/* Results */}
      {result && result.isValid && (
        <>
          <div className="border-t border-border/40 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Max Safe Leverage</span>
              <span className="text-lg font-bold text-foreground">{result.Lmax}x</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Liquidation Price</span>
              <span className="text-sm font-medium text-foreground">
                ${result.pliq.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Risk Level</span>
              <Badge variant="outline" className={getRiskLevelColor(result.riskLevel)}>
                {result.riskLevel}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Safety Margin</span>
              <span className="text-sm font-medium text-foreground">
                {result.marginPct.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Risk warnings even when valid */}
          {result.warnings.length > 0 && (
            <div className="mt-3 p-2 rounded-md bg-state-warning/10 border border-state-warning/20">
              <p className="text-xs text-state-warning">{result.warnings[0]}</p>
            </div>
          )}
        </>
      )}

      {result && !result.isValid && (
        <div className="mt-4 p-2 rounded-md bg-state-error/10 border border-state-error/20">
          <p className="text-xs text-state-error font-medium">Error</p>
          <p className="text-xs text-state-error mt-1">{result.warnings[0]}</p>
        </div>
      )}
    </WidgetWrapper>
  );
};
