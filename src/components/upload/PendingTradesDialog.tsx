import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CheckCircle2, XCircle, Edit3, TrendingUp, TrendingDown } from 'lucide-react';

interface Trade {
  symbol?: string;
  symbol_temp?: string;
  side?: 'long' | 'short';
  profit_loss?: number;
  [key: string]: any;
}

interface PendingTrade {
  trade: Trade;
  index: number;
}

interface PendingTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingTrades: PendingTrade[];
  onApproveAndSave: (index: number) => void;
  onRemoveAndSave: (index: number) => void;
  onEdit: () => void;
}

export function PendingTradesDialog({
  open,
  onOpenChange,
  pendingTrades,
  onApproveAndSave,
  onRemoveAndSave,
  onEdit,
}: PendingTradesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            ⚠️ Review Pending Trades
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have {pendingTrades.length} trade{pendingTrades.length !== 1 ? 's' : ''} that haven't been approved or removed yet.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {pendingTrades.map(({ trade, index }) => {
            const symbol = trade.symbol || trade.symbol_temp || 'UNKNOWN';
            const side = trade.side;
            const pnl = trade.profit_loss;
            const isProfit = pnl && pnl > 0;

            return (
              <PremiumCard key={index} className="p-4 space-y-3">
                {/* Trade Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">{symbol}</span>
                    {side && (
                      <span className={`flex items-center gap-1 text-sm font-medium ${side === 'long' ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                        {side === 'long' ? (
                          <>
                            <TrendingUp className="h-4 w-4" />
                            LONG
                          </>
                        ) : (
                          <>
                            <TrendingDown className="h-4 w-4" />
                            SHORT
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  {pnl !== undefined && (
                    <span className={`text-base font-semibold ${isProfit ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                      {isProfit ? '+' : ''}{pnl.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onApproveAndSave(index)}
                    size="sm"
                    className="flex-1 gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20"
                    variant="outline"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve & Save
                  </Button>
                  <Button
                    onClick={() => onRemoveAndSave(index)}
                    size="sm"
                    className="flex-1 gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                    variant="outline"
                  >
                    <XCircle className="h-4 w-4" />
                    Remove & Save
                  </Button>
                  <Button
                    onClick={onEdit}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </PremiumCard>
            );
          })}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
