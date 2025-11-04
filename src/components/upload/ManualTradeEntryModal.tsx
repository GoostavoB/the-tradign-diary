import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X, ExternalLink } from 'lucide-react';
import type { ExtractedTrade } from '@/types/trade';

interface ManualTradeEntryModalProps {
  open: boolean;
  onSave: (trade: ExtractedTrade) => void;
  onCancel: () => void;
}

export const ManualTradeEntryModal = ({ open, onSave, onCancel }: ManualTradeEntryModalProps) => {
  const [formData, setFormData] = useState<Partial<ExtractedTrade>>({
    symbol: '',
    side: 'long',
    profit_loss: 0,
    entry_price: 0,
    exit_price: 0,
    position_size: 0,
    leverage: 1,
    margin: 0,
    trading_fee: 0,
    funding_fee: 0,
    roi: 0,
    opened_at: '',
    closed_at: '',
    period_of_day: 'morning',
    duration_days: 0,
    duration_hours: 0,
    duration_minutes: 0
  });

  const updateField = (field: keyof ExtractedTrade, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.symbol || !formData.side || formData.profit_loss === undefined) {
      alert('Please fill in required fields: Symbol, Direction, and P&L');
      return;
    }

    onSave(formData as ExtractedTrade);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manual Trade Entry</DialogTitle>
          <DialogDescription>
            Enter trade details manually. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => updateField('symbol', e.target.value)}
                placeholder="e.g., BTCUSDT"
              />
            </div>

            <div>
              <Label htmlFor="side">Direction *</Label>
              <select
                id="side"
                value={formData.side}
                onChange={(e) => updateField('side', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="long">Long</option>
                <option value="short">Short</option>
              </select>
            </div>

            <div>
              <Label htmlFor="pnl">P&L *</Label>
              <Input
                id="pnl"
                type="number"
                value={formData.profit_loss}
                onChange={(e) => updateField('profit_loss', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="entry">Entry Price</Label>
              <Input
                id="entry"
                type="number"
                value={formData.entry_price}
                onChange={(e) => updateField('entry_price', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="exit">Exit Price</Label>
              <Input
                id="exit"
                type="number"
                value={formData.exit_price}
                onChange={(e) => updateField('exit_price', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="position">Position Size</Label>
              <Input
                id="position"
                type="number"
                value={formData.position_size}
                onChange={(e) => updateField('position_size', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="leverage">Leverage</Label>
              <Input
                id="leverage"
                type="number"
                value={formData.leverage}
                onChange={(e) => updateField('leverage', parseFloat(e.target.value))}
                placeholder="1"
              />
            </div>

            <div>
              <Label htmlFor="margin">Margin</Label>
              <Input
                id="margin"
                type="number"
                value={formData.margin}
                onChange={(e) => updateField('margin', parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="opened">Opened At</Label>
              <Input
                id="opened"
                type="datetime-local"
                value={formData.opened_at}
                onChange={(e) => updateField('opened_at', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="closed">Closed At</Label>
              <Input
                id="closed"
                type="datetime-local"
                value={formData.closed_at}
                onChange={(e) => updateField('closed_at', e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
            <p className="font-medium">Having trouble?</p>
            <p className="text-muted-foreground">
              If extraction isn't working, make sure your screenshot is clear and includes entry price, exit price, and P&L.
            </p>
            <Button variant="link" className="p-0 h-auto" onClick={() => window.open('/support', '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Trade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
