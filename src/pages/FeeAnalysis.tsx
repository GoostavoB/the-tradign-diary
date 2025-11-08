import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/types/trade';
import { FeeOverviewCards } from '@/components/fee-analysis/FeeOverviewCards';
import { ExchangeComparisonTable } from '@/components/fee-analysis/ExchangeComparisonTable';
import { TradeDetailsTable } from '@/components/fee-analysis/TradeDetailsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/DashboardSkeleton';
import { useTranslation } from '@/hooks/useTranslation';
import { aggregateExchangeStats, calculateEnhancedMetrics } from '@/utils/feeCalculations';
import { BlurToggleButton } from '@/components/ui/BlurToggleButton';

const FeeAnalysis = () => {
  const { t } = useTranslation();

  const { data: trades, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .is('deleted_at', null)
        .order('trade_date', { ascending: false });
      
      if (error) throw error;
      return data as Trade[];
    },
  });

  const { exchangeStats, enhancedTrades, overviewData } = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        exchangeStats: [],
        enhancedTrades: [],
        overviewData: {
          totalFeesPaid: 0,
          avgFeePercent: 0,
          bestExchange: null,
          worstExchange: null,
        },
      };
    }

    const stats = aggregateExchangeStats(trades);
    const enhanced = trades.map(calculateEnhancedMetrics);
    
    const totalFees = stats.reduce((sum, s) => sum + s.totalFees, 0);
    const totalVolume = stats.reduce((sum, s) => sum + s.totalVolume, 0);
    const avgFeePercent = totalVolume > 0 ? (totalFees / totalVolume) * 100 : 0;
    
    const bestExchange = stats.length > 0 ? {
      name: stats[0].broker,
      feePercent: stats[0].avgFeePercent,
    } : null;
    
    const worstExchange = stats.length > 0 ? {
      name: stats[stats.length - 1].broker,
      feePercent: stats[stats.length - 1].avgFeePercent,
    } : null;

    return {
      exchangeStats: stats,
      enhancedTrades: enhanced,
      overviewData: {
        totalFeesPaid: totalFees,
        avgFeePercent,
        bestExchange,
        worstExchange,
      },
    };
  }, [trades]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('feeAnalysis.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('feeAnalysis.subtitle')}</p>
          </div>
          <BlurToggleButton />
        </div>

        <FeeOverviewCards {...overviewData} />

        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="glass rounded-xl">
            <TabsTrigger value="comparison" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10">
              {t('feeAnalysis.exchangeComparison')}
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-white/80 dark:data-[state=active]:bg-white/10">
              {t('feeAnalysis.tradeDetails')}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="comparison" className="space-y-4 animate-fade-in">
            <ExchangeComparisonTable exchangeStats={exchangeStats} />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4 animate-fade-in">
            <TradeDetailsTable trades={enhancedTrades} />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default FeeAnalysis;
