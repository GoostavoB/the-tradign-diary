import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Unplug, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ConnectExchangeModal } from '@/components/exchanges/ConnectExchangeModal';
import { SyncHistoryWidget } from '@/components/exchanges/SyncHistoryWidget';
import { formatDistanceToNow } from 'date-fns';

interface ExchangeConnection {
  id: string;
  exchange_name: string;
  is_active: boolean;
  last_synced_at: string | null;
  sync_status: string;
  sync_error: string | null;
  created_at: string;
}

export default function ExchangeConnections() {
  const [selectedExchange, setSelectedExchange] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['exchange-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ExchangeConnection[];
    },
  });

  const syncMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-exchange-trades`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ connectionId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(
        `Synced ${data.tradesImported} new trades (${data.tradesSkipped} duplicates skipped)`
      );
      queryClient.invalidateQueries({ queryKey: ['exchange-connections'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['sync-history'] });
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async ({ connectionId, deleteTrades }: { connectionId: string; deleteTrades: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disconnect-exchange`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ connectionId, deleteTrades }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Disconnect failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Exchange disconnected successfully');
      queryClient.invalidateQueries({ queryKey: ['exchange-connections'] });
    },
    onError: (error: Error) => {
      toast.error(`Disconnect failed: ${error.message}`);
    },
  });

  const exchanges = [
    {
      id: 'bingx',
      name: 'BingX',
      description: 'Connect your BingX account to automatically sync trades',
      icon: '🏦',
    },
  ];

  const getConnection = (exchangeName: string) =>
    connections.find((c) => c.exchange_name === exchangeName);

  const handleConnect = (exchangeName: string) => {
    setSelectedExchange(exchangeName);
    setIsModalOpen(true);
  };

  const handleSync = (connectionId: string) => {
    syncMutation.mutate(connectionId);
  };

  const handleDisconnect = (connectionId: string) => {
    if (confirm('Are you sure you want to disconnect? This will not delete your synced trades.')) {
      disconnectMutation.mutate({ connectionId, deleteTrades: false });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Exchange Connections</h1>
        <p className="text-muted-foreground mt-2">
          Connect your exchange accounts to automatically sync your trading history
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exchanges.map((exchange) => {
          const connection = getConnection(exchange.id);
          const isConnected = !!connection;
          const isSyncing = connection?.sync_status === 'syncing';

          return (
            <Card key={exchange.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{exchange.icon}</span>
                    <div>
                      <CardTitle>{exchange.name}</CardTitle>
                      {isConnected && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`h-2 w-2 rounded-full ${
                            connection.sync_status === 'error' ? 'bg-destructive' :
                            connection.sync_status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
                            'bg-green-500'
                          }`} />
                          <span className="text-xs text-muted-foreground capitalize">
                            {connection.sync_status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">{exchange.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isConnected ? (
                  <>
                    <div className="text-sm space-y-1">
                      {connection.last_synced_at && (
                        <p className="text-muted-foreground">
                          Last synced:{' '}
                          {formatDistanceToNow(new Date(connection.last_synced_at), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                      {connection.sync_error && (
                        <p className="text-destructive text-xs">{connection.sync_error}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSync(connection.id)}
                        disabled={isSyncing || syncMutation.isPending}
                        size="sm"
                        className="flex-1"
                      >
                        {isSyncing || syncMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync Now
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={isSyncing || disconnectMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        <Unplug className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button onClick={() => handleConnect(exchange.id)} className="w-full">
                    Connect {exchange.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <SyncHistoryWidget />

      <ConnectExchangeModal
        exchange={selectedExchange || 'bingx'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExchange(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['exchange-connections'] });
        }}
      />
    </div>
  );
}
