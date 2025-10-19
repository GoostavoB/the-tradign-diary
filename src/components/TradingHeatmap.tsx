import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface Trade {
  trade_date: string;
  pnl: number;
  roi: number;
}

interface TradingHeatmapProps {
  trades: Trade[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function TradingHeatmap({ trades }: TradingHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const heatmapData = useMemo(() => {
    const data: Record<string, { wins: number; total: number; pnl: number; roi: number }> = {};

    trades.forEach((trade) => {
      const date = new Date(trade.trade_date);
      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      if (!data[key]) {
        data[key] = { wins: 0, total: 0, pnl: 0, roi: 0 };
      }

      data[key].total += 1;
      data[key].pnl += trade.pnl || 0;
      data[key].roi += trade.roi || 0;
      if ((trade.pnl || 0) > 0) {
        data[key].wins += 1;
      }
    });

    return data;
  }, [trades]);

  const getCellColor = (day: number, hour: number) => {
    const key = `${day}-${hour}`;
    const cell = heatmapData[key];

    if (!cell) return 'hsl(var(--muted))';

    const winRate = cell.wins / cell.total;

    if (winRate >= 0.7) return 'hsl(var(--neon-green))';
    if (winRate >= 0.5) return 'hsl(142 71% 35%)';
    if (winRate >= 0.4) return 'hsl(45 93% 47%)';
    return 'hsl(var(--neon-red))';
  };

  const getBestSlot = () => {
    let best = { key: '', winRate: 0, trades: 0 };

    Object.entries(heatmapData).forEach(([key, data]) => {
      const winRate = data.wins / data.total;
      if (data.total >= 3 && winRate > best.winRate) {
        best = { key, winRate, trades: data.total };
      }
    });

    return best;
  };

  const bestSlot = getBestSlot();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">
          Click cells to view details
        </p>
      </div>
      
      <TooltipProvider>
        <div className="relative">
          {/* Compact Grid */}
          <div className="flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col justify-around py-1">
              {DAYS.map((day) => (
                <div key={day} className="text-[9px] text-muted-foreground font-medium w-6 text-right pr-1">
                  {day.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex-1">
              {/* Hour labels */}
              <div className="flex gap-[2px] mb-1 ml-[2px]">
                {HOURS.filter((h) => h % 4 === 0).map((hour) => (
                  <div
                    key={hour}
                    className="text-[8px] text-muted-foreground text-center flex-1"
                  >
                    {hour}h
                  </div>
                ))}
              </div>

              {/* Grid cells */}
              <div className="space-y-[2px]">
                {DAYS.map((day, dayIndex) => (
                  <div key={day} className="flex gap-[2px]">
                    {HOURS.map((hour) => {
                      const key = `${dayIndex}-${hour}`;
                      const cell = heatmapData[key];
                      const isBest = key === bestSlot.key;
                      const isSelected = selectedCell === key;

                      return (
                        <Tooltip key={hour} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => setSelectedCell(isSelected ? null : key)}
                              className={`
                                flex-1 h-4 rounded-[2px] transition-all duration-200
                                hover:scale-110 hover:shadow-md hover:z-10
                                ${isSelected ? 'scale-110 shadow-lg ring-2 ring-primary z-10' : ''}
                                ${isBest && !isSelected ? 'ring-1 ring-accent' : ''}
                              `}
                              style={{
                                backgroundColor: getCellColor(dayIndex, hour),
                                opacity: cell ? (isSelected ? 1 : 0.85) : 0.15,
                              }}
                            />
                          </TooltipTrigger>
                          <TooltipContent 
                            className="bg-popover/95 backdrop-blur-sm border-border shadow-lg"
                            side="top"
                          >
                            {cell ? (
                              <div className="text-xs space-y-0.5 min-w-[140px]">
                                <div className="font-semibold text-foreground border-b border-border pb-1 mb-1">
                                  {day} {hour}:00
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Win Rate:</span>
                                  <span className="font-medium" style={{ color: getCellColor(dayIndex, hour) }}>
                                    {((cell.wins / cell.total) * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Trades:</span>
                                  <span className="font-medium">{cell.total}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">ROI:</span>
                                  <span className="font-medium">{(cell.roi / cell.total).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">P&L:</span>
                                  <span className="font-medium">${cell.pnl.toFixed(0)}</span>
                                </div>
                                {isBest && (
                                  <div className="text-accent font-semibold pt-1 border-t border-border mt-1 text-center">
                                    ⭐ Best Time
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground">No trades in this slot</div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compact Legend */}
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--neon-green))' }}></div>
              <span className="text-[10px] text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(45 93% 47%)' }}></div>
              <span className="text-[10px] text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--neon-red))' }}></div>
              <span className="text-[10px] text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
