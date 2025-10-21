import { memo } from 'react';
import { EnhancedTradeMetrics } from '@/utils/feeCalculations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface TradeDetailsTableProps {
  trades: EnhancedTradeMetrics[];
}

export const TradeDetailsTable = memo(({ trades }: TradeDetailsTableProps) => {
  const { t } = useTranslation();

  const formatCurrency = (value: number) => {
    return `$${Math.abs(value).toFixed(2)}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '' : '-'}${Math.abs(value).toFixed(2)}%`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('feeAnalysis.pair')}</TableHead>
            <TableHead>{t('feeAnalysis.exchange')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.margin')}</TableHead>
            <TableHead className="text-center">{t('feeAnalysis.leverage')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.grossPnLPercent')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.totalFeesPercent')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.netPnLPercent')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.feeDollar')}</TableHead>
            <TableHead className="text-right">{t('feeAnalysis.fundingDollar')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.tradeId}>
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>{trade.broker}</TableCell>
              <TableCell className="text-right">{formatCurrency(trade.margin)}</TableCell>
              <TableCell className="text-center">{trade.leverage}x</TableCell>
              <TableCell className={cn(
                "text-right font-mono",
                trade.grossReturnPercent >= 0 ? "text-profit" : "text-loss"
              )}>
                {formatPercent(trade.grossReturnPercent)}
              </TableCell>
              <TableCell className="text-right font-mono text-amber-500">
                {trade.feePercentOfPosition.toFixed(3)}%
              </TableCell>
              <TableCell className={cn(
                "text-right font-mono font-semibold",
                trade.effectiveReturnOnMargin >= 0 ? "text-profit" : "text-loss"
              )}>
                {formatPercent(trade.effectiveReturnOnMargin)}
              </TableCell>
              <TableCell className="text-right text-red-500">
                {formatCurrency(trade.tradingFee)}
              </TableCell>
              <TableCell className={cn(
                "text-right",
                trade.fundingFee >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {trade.fundingFee >= 0 ? '+' : ''}{formatCurrency(trade.fundingFee)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

TradeDetailsTable.displayName = 'TradeDetailsTable';
