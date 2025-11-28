import { useState } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumTableRow } from '@/components/ui/PremiumTable';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/utils/formatNumber';
import { useThemeMode } from '@/hooks/useThemeMode';
import { TokenIcon } from '@/components/TokenIcon';
import { cn } from '@/lib/utils';

interface TokenListProps {
  tokens: Array<{
    symbol: string;
    name: string;
    value: number;
    percentage: number;
    quantity: number;
    icon?: string;
    priceChange24h?: number;
    priceChange7d?: number;
    priceChange30d?: number;
  }>;
  onDelete?: (symbol: string) => void;
  onEdit?: (symbol: string) => void;
}

type SortField = 'symbol' | 'value' | 'percentage' | 'priceChange24h';
type SortDirection = 'asc' | 'desc';

export const TokenList = ({ tokens, onDelete, onEdit }: TokenListProps) => {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { colors } = useThemeMode();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTokens = [...tokens].sort((a, b) => {
    const aValue = a[sortField] || 0;
    const bValue = b[sortField] || 0;

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const gridCols = "grid-cols-[2fr_1.5fr_1fr_1.5fr_1fr_1fr_1fr_auto]";

  if (!tokens.length) {
    return (
      <PremiumCard>
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">No tokens added yet</p>
          <p className="text-sm mt-2">Click "+ Add Token" to start tracking your holdings</p>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard title="Token Holdings" className="p-0 overflow-hidden">
      <div className="p-4 space-y-2">
        {/* Header */}
        <div className={cn("grid gap-4 px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2", gridCols)}>
          <div className="text-left">Token</div>
          <div
            className="text-right cursor-pointer hover:text-foreground transition-colors"
            onClick={() => handleSort('value')}
          >
            Value {sortField === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div
            className="text-right cursor-pointer hover:text-foreground transition-colors"
            onClick={() => handleSort('percentage')}
          >
            % {sortField === 'percentage' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div className="text-right">Quantity</div>
          <div
            className="text-right cursor-pointer hover:text-foreground transition-colors"
            onClick={() => handleSort('priceChange24h')}
          >
            24h {sortField === 'priceChange24h' && (sortDirection === 'asc' ? '↑' : '↓')}
          </div>
          <div className="text-right">7D</div>
          <div className="text-right">30D</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {sortedTokens.map((token) => (
            <PremiumTableRow key={token.symbol} className={cn("grid gap-4 items-center", gridCols)}>
              <div className="flex items-center gap-3 overflow-hidden">
                <TokenIcon symbol={token.symbol} className="w-8 h-8 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{token.name}</div>
                </div>
              </div>
              <div className="text-right font-mono">
                {formatCurrency(token.value)}
              </div>
              <div className="text-right font-mono">
                {token.percentage.toFixed(2)}%
              </div>
              <div className="text-right font-mono">
                {token.quantity.toFixed(6)}
              </div>
              <div className="text-right">
                {token.priceChange24h !== undefined && (
                  <span className={token.priceChange24h >= 0 ? "text-neon-green" : "text-neon-red"}>
                    {formatPercent(token.priceChange24h)}
                  </span>
                )}
              </div>
              <div className="text-right">
                {token.priceChange7d !== undefined && (
                  <span className={token.priceChange7d >= 0 ? "text-neon-green" : "text-neon-red"}>
                    {formatPercent(token.priceChange7d)}
                  </span>
                )}
              </div>
              <div className="text-right">
                {token.priceChange30d !== undefined && (
                  <span className={token.priceChange30d >= 0 ? "text-neon-green" : "text-neon-red"}>
                    {formatPercent(token.priceChange30d)}
                  </span>
                )}
              </div>
              <div className="flex justify-end gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(token.symbol)}
                    className="h-8 w-8 hover:bg-accent/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(token.symbol)}
                    className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </PremiumTableRow>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};
