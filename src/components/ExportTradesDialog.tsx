import { useState, useMemo } from 'react';
import { Trade } from '@/types/trade';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { exportFilteredTrades, getFilterOptions, ExportFilters } from '@/utils/exportTrades';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ExportTradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trades: Trade[];
}

export const ExportTradesDialog = ({ open, onOpenChange, trades }: ExportTradesDialogProps) => {
  const [filters, setFilters] = useState<ExportFilters>({});
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const filterOptions = useMemo(() => getFilterOptions(trades), [trades]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const exportFilters: ExportFilters = {
        ...filters,
        exchanges: selectedExchanges.length > 0 ? selectedExchanges : undefined,
        symbols: selectedSymbols.length > 0 ? selectedSymbols : undefined,
      };

      exportFilteredTrades(trades, exportFilters, 'trades_filtered');
      
      toast.success('Export successful', {
        description: 'Your trades have been exported to CSV',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Failed to export trades',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const toggleExchange = (exchange: string) => {
    setSelectedExchanges(prev =>
      prev.includes(exchange)
        ? prev.filter(e => e !== exchange)
        : [...prev, exchange]
    );
  };

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const selectAllExchanges = () => {
    setSelectedExchanges(filterOptions.exchanges);
  };

  const clearAllExchanges = () => {
    setSelectedExchanges([]);
  };

  const selectAllSymbols = () => {
    setSelectedSymbols(filterOptions.symbols);
  };

  const clearAllSymbols = () => {
    setSelectedSymbols([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <DialogTitle>Export Trades</DialogTitle>
          </div>
          <DialogDescription>
            Filter and export your trading history to CSV format
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Date Range */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-semibold">Date Range</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        dateFrom: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        dateTo: e.target.value ? new Date(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Exchanges */}
            {filterOptions.exchanges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Exchanges</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllExchanges}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllExchanges}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {filterOptions.exchanges.map(exchange => (
                    <div key={exchange} className="flex items-center gap-2">
                      <Checkbox
                        id={`exchange-${exchange}`}
                        checked={selectedExchanges.includes(exchange)}
                        onCheckedChange={() => toggleExchange(exchange)}
                      />
                      <Label
                        htmlFor={`exchange-${exchange}`}
                        className="text-sm cursor-pointer"
                      >
                        {exchange}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Symbols */}
            {filterOptions.symbols.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Symbols</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={selectAllSymbols}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllSymbols}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-3 gap-3">
                    {filterOptions.symbols.map(symbol => (
                      <div key={symbol} className="flex items-center gap-2">
                        <Checkbox
                          id={`symbol-${symbol}`}
                          checked={selectedSymbols.includes(symbol)}
                          onCheckedChange={() => toggleSymbol(symbol)}
                        />
                        <Label
                          htmlFor={`symbol-${symbol}`}
                          className="text-xs cursor-pointer"
                        >
                          {symbol}
                        </Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Separator />

            {/* P&L Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">P&L Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPnl" className="text-xs text-muted-foreground">
                    Minimum
                  </Label>
                  <Input
                    id="minPnl"
                    type="number"
                    placeholder="No minimum"
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        minPnl: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPnl" className="text-xs text-muted-foreground">
                    Maximum
                  </Label>
                  <Input
                    id="maxPnl"
                    type="number"
                    placeholder="No maximum"
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        maxPnl: e.target.value ? parseFloat(e.target.value) : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {trades.length} total trades
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
