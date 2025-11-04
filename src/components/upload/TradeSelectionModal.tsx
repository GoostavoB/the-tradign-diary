import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Check, X } from 'lucide-react';
import type { ExtractedTrade } from '@/types/trade';

interface TradeSelectionModalProps {
  open: boolean;
  trades: ExtractedTrade[];
  onConfirm: (selectedTrades: ExtractedTrade[]) => void;
  onCancel: () => void;
}

export const TradeSelectionModal = ({ open, trades, onConfirm, onCancel }: TradeSelectionModalProps) => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState<'pnl' | 'time' | 'symbol'>('pnl');

  const sortedTrades = [...trades].sort((a, b) => {
    if (sortBy === 'pnl') return b.profit_loss - a.profit_loss;
    if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
    if (sortBy === 'time') return new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime();
    return 0;
  });

  const toggleTrade = (index: number) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (newSet.size < 10) {
          newSet.add(index);
        }
      }
      return newSet;
    });
  };

  const selectTopByPnL = () => {
    const top10 = sortedTrades
      .sort((a, b) => b.profit_loss - a.profit_loss)
      .slice(0, 10)
      .map((_, idx) => idx);
    setSelectedIds(new Set(top10));
  };

  const handleConfirm = () => {
    const selected = sortedTrades.filter((_, idx) => selectedIds.has(idx));
    onConfirm(selected);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Trades to Import</DialogTitle>
          <DialogDescription>
            Found {trades.length} trades! Select up to 10 trades to import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={sortBy === 'pnl' ? 'default' : 'outline'}
                onClick={() => setSortBy('pnl')}
              >
                Sort by P&L
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'time' ? 'default' : 'outline'}
                onClick={() => setSortBy('time')}
              >
                Sort by Time
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'symbol' ? 'default' : 'outline'}
                onClick={() => setSortBy('symbol')}
              >
                Sort by Symbol
              </Button>
            </div>
            <Button size="sm" variant="secondary" onClick={selectTopByPnL}>
              <Check className="w-4 h-4 mr-2" />
              Select Top 10 by P&L
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Selected: {selectedIds.size} / 10
          </div>

          <ScrollArea className="h-[400px] border rounded-lg">
            <div className="space-y-2 p-4">
              {sortedTrades.map((trade, idx) => {
                const isSelected = selectedIds.has(idx);
                const isDisabled = !isSelected && selectedIds.size >= 10;

                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-accent/5 cursor-pointer'
                    }`}
                    onClick={() => !isDisabled && toggleTrade(idx)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleTrade(idx)}
                      onClick={(e) => e.stopPropagation()}
                    />

                    <div className="flex-1 grid grid-cols-5 gap-4">
                      <div>
                        <div className="text-sm font-semibold">{trade.symbol}</div>
                        <Badge variant={trade.side === 'long' ? 'default' : 'secondary'} className="mt-1">
                          {trade.side}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">P&L</div>
                        <div className={`text-sm font-semibold flex items-center justify-center gap-1 ${
                          trade.profit_loss >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {trade.profit_loss >= 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          ${trade.profit_loss.toFixed(2)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Entry</div>
                        <div className="text-sm">${trade.entry_price.toFixed(2)}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Exit</div>
                        <div className="text-sm">${trade.exit_price.toFixed(2)}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-muted-foreground">Opened</div>
                        <div className="text-xs">
                          {new Date(trade.opened_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
            <Check className="w-4 h-4 mr-2" />
            Continue with {selectedIds.size} Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
