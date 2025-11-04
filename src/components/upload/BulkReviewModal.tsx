import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Edit2, Trash2, AlertCircle } from 'lucide-react';
import type { ExtractedTrade } from '@/types/trade';

interface BulkReviewModalProps {
  open: boolean;
  trades: ExtractedTrade[];
  onSaveAll: (trades: ExtractedTrade[]) => void;
  onCancel: () => void;
}

export const BulkReviewModal = ({ open, trades, onSaveAll, onCancel }: BulkReviewModalProps) => {
  const [editedTrades, setEditedTrades] = useState<ExtractedTrade[]>(trades);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const updateTrade = (index: number, field: keyof ExtractedTrade, value: any) => {
    setEditedTrades(prev => prev.map((t, i) => 
      i === index ? { ...t, [field]: value } : t
    ));
  };

  const removeTrade = (index: number) => {
    setEditedTrades(prev => prev.filter((_, i) => i !== index));
  };

  const validateTrades = () => {
    const errors: string[] = [];
    editedTrades.forEach((trade, idx) => {
      if (!trade.symbol || trade.symbol.trim() === '') {
        errors.push(`Trade #${idx + 1}: Missing symbol`);
      }
      if (!trade.side || !['long', 'short'].includes(trade.side)) {
        errors.push(`Trade #${idx + 1}: Invalid direction`);
      }
      if (typeof trade.profit_loss !== 'number') {
        errors.push(`Trade #${idx + 1}: Invalid P&L`);
      }
    });
    return errors;
  };

  const handleSave = () => {
    const errors = validateTrades();
    if (errors.length > 0) {
      alert(`Cannot save:\n${errors.join('\n')}`);
      return;
    }
    onSaveAll(editedTrades);
  };

  const hasOptionalFields = editedTrades.some(t => 
    !t.entry_price || !t.exit_price || !t.opened_at || !t.closed_at
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Review Trades</DialogTitle>
          <DialogDescription>
            Review and edit the extracted trades before saving. Critical fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        {hasOptionalFields && (
          <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
            <div className="text-sm text-amber-700 dark:text-amber-300">
              Some optional fields couldn't be read. You can edit them manually after saving.
            </div>
          </div>
        )}

        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {editedTrades.map((trade, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Trade #{idx + 1}
                    </span>
                    <Badge variant={trade.side === 'long' ? 'default' : 'secondary'}>
                      {trade.side}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingIndex(editingIndex === idx ? null : idx)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTrade(idx)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {editingIndex === idx ? (
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold">Symbol *</label>
                      <Input
                        value={trade.symbol}
                        onChange={(e) => updateTrade(idx, 'symbol', e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold">Direction *</label>
                      <select
                        value={trade.side}
                        onChange={(e) => updateTrade(idx, 'side', e.target.value)}
                        className="w-full h-8 px-2 border rounded-md"
                      >
                        <option value="long">Long</option>
                        <option value="short">Short</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold">P&L *</label>
                      <Input
                        type="number"
                        value={trade.profit_loss}
                        onChange={(e) => updateTrade(idx, 'profit_loss', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Entry Price</label>
                      <Input
                        type="number"
                        value={trade.entry_price || ''}
                        onChange={(e) => updateTrade(idx, 'entry_price', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Exit Price</label>
                      <Input
                        type="number"
                        value={trade.exit_price || ''}
                        onChange={(e) => updateTrade(idx, 'exit_price', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <label className="text-xs">Position Size</label>
                      <Input
                        type="number"
                        value={trade.position_size || ''}
                        onChange={(e) => updateTrade(idx, 'position_size', parseFloat(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-muted-foreground">Symbol</div>
                      <div className="font-semibold">{trade.symbol}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">P&L</div>
                      <div className={trade.profit_loss >= 0 ? 'text-success' : 'text-destructive'}>
                        ${trade.profit_loss.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Entry</div>
                      <div>{trade.entry_price ? `$${trade.entry_price.toFixed(2)}` : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Exit</div>
                      <div>{trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : 'N/A'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={editedTrades.length === 0}>
            <Save className="w-4 h-4 mr-2" />
            Save All {editedTrades.length} Trades
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
