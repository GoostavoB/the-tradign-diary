import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

interface ExchangeBadgeProps {
  source: string | null;
  syncedAt?: string;
}

export function ExchangeBadge({ source, syncedAt }: ExchangeBadgeProps) {
  if (!source) {
    return (
      <Badge variant="outline" className="text-xs">
        ✍️ Manual
      </Badge>
    );
  }

  const exchangeConfig: Record<string, { icon: string; color: string; name: string }> = {
    binance: { icon: '🟡', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20', name: 'Binance' },
    bingx: { icon: '🏦', color: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20', name: 'BingX' },
    bybit: { icon: '🟠', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20', name: 'Bybit' },
    coinbase: { icon: '🔵', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20', name: 'Coinbase' },
    kraken: { icon: '🟣', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20', name: 'Kraken' },
    bitfinex: { icon: '🟢', color: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20', name: 'Bitfinex' },
    mexc: { icon: '⚫', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20', name: 'MEXC' },
    kucoin: { icon: '🔷', color: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20', name: 'KuCoin' },
    okx: { icon: '⬛', color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20', name: 'OKX' },
    gateio: { icon: '🔶', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20', name: 'Gate.io' },
    bitstamp: { icon: '🟦', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20', name: 'Bitstamp' },
  };

  const config = exchangeConfig[source.toLowerCase()] || {
    icon: '🔗',
    color: 'bg-primary/10 text-primary border-primary/20',
    name: source,
  };

  const badge = (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.icon} {config.name}
    </Badge>
  );

  if (!syncedAt) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p>Synced from {config.name} on {format(new Date(syncedAt), 'PPp')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
