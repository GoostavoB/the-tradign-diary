import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BrokerPreference {
  id: string;
  broker_name: string;
  usage_count: number;
  last_used_at: string;
}

const DEFAULT_BROKERS = [
  'AJ Bell Youinvest',
  'Binance',
  'BingX',
  'Bitfinex',
  'Bitget',
  'Bithumb',
  'Bitstamp',
  'Bybit',
  'Coinbase',
  'Crypto.com',
  'Gate.io',
  'Gemini',
  'HTX (Huobi)',
  'Kraken',
  'KuCoin',
  'OKX',
  'Phemex',
  'N/A'
];

export const useBrokerPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: userPreferences = [], isLoading } = useQuery({
    queryKey: ['broker-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_broker_preferences')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('last_used_at', { ascending: false });

      if (error) throw error;
      return data as BrokerPreference[];
    },
  });

  const incrementUsageMutation = useMutation({
    mutationFn: async (brokerName: string) => {
      const { error } = await supabase.rpc('increment_broker_usage', {
        p_broker_name: brokerName,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broker-preferences'] });
    },
  });

  const getSortedBrokers = (): string[] => {
    // Get user's frequently used brokers
    const userBrokers = userPreferences.map(p => p.broker_name);
    
    // Filter out user brokers from default list to avoid duplicates
    const remainingDefaultBrokers = DEFAULT_BROKERS.filter(
      broker => !userBrokers.includes(broker)
    );

    // Combine: user's most used brokers first, then remaining defaults
    return [...userBrokers, ...remainingDefaultBrokers];
  };

  return {
    sortedBrokers: getSortedBrokers(),
    userPreferences,
    isLoading,
    incrementUsage: incrementUsageMutation.mutate,
  };
};
