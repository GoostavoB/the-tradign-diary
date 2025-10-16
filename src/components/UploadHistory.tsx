import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UploadBatch {
  id: string;
  created_at: string;
  trade_count: number;
  assets: string[];
  total_entry_value: number;
  most_recent_trade_asset: string | null;
  most_recent_trade_value: number | null;
  trades?: BatchTrade[];
}

interface BatchTrade {
  id: string;
  asset: string;
  trade_date: string;
  position_type: 'long' | 'short';
  entry_price: number;
  profit_loss: number;
}

export const UploadHistory = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [batchTrades, setBatchTrades] = useState<Record<string, BatchTrade[]>>({});
  const [newBatchId, setNewBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchBatches();
      
      // Subscribe to new batches
      const channel = supabase
        .channel('upload-batches-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'upload_batches',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newBatch = payload.new as UploadBatch;
            setBatches(prev => [newBatch, ...prev]);
            setNewBatchId(newBatch.id);
            
            // Remove the animation class after animation completes
            setTimeout(() => {
              setNewBatchId(null);
            }, 600);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchBatches = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('upload_batches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setBatches(data);
    }
  };

  const fetchBatchTrades = async (batchId: string, createdAt: string) => {
    if (!user || batchTrades[batchId]) return;

    // Fetch trades created within 5 seconds of the batch
    const batchTime = new Date(createdAt);
    const startTime = new Date(batchTime.getTime() - 5000);
    const endTime = new Date(batchTime.getTime() + 5000);

    const { data, error } = await supabase
      .from('trades')
      .select('id, asset, trade_date, position_type, entry_price, profit_loss')
      .eq('user_id', user.id)
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString())
      .order('trade_date', { ascending: false });

    if (!error && data) {
      setBatchTrades(prev => ({ ...prev, [batchId]: data as BatchTrade[] }));
    }
  };

  const toggleExpand = (batchId: string, createdAt: string) => {
    if (expandedBatch === batchId) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchId);
      fetchBatchTrades(batchId, createdAt);
    }
  };

  if (batches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Upload History</h3>
      <div className="space-y-3">
        {batches.map((batch) => {
          const isExpanded = expandedBatch === batch.id;
          const isNew = newBatchId === batch.id;
          
          return (
            <Card
              key={batch.id}
              className={`p-4 border-border cursor-pointer hover:border-foreground/20 transition-all ${
                isNew ? 'animate-slide-in-top' : ''
              }`}
              onClick={() => toggleExpand(batch.id, batch.created_at)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(batch.created_at), 'MMM dd, yyyy • HH:mm')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {batch.trade_count} {batch.trade_count === 1 ? 'trade' : 'trades'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Assets: </span>
                      <span className="font-medium">{batch.assets.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Entry: </span>
                      <span className="font-medium">${batch.total_entry_value.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {batch.most_recent_trade_asset && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Most Recent: </span>
                      <span className="font-medium">{batch.most_recent_trade_asset}</span>
                      {batch.most_recent_trade_value !== null && (
                        <span className={`ml-2 ${
                          batch.most_recent_trade_value >= 0 ? 'text-neon-green' : 'text-neon-red'
                        }`}>
                          ${batch.most_recent_trade_value.toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="ml-4">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              {isExpanded && batchTrades[batch.id] && (
                <div className="mt-4 pt-4 border-t border-border space-y-2 animate-fade-in">
                  {batchTrades[batch.id].map((trade) => (
                    <div
                      key={trade.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{trade.asset}</span>
                        <Badge
                          variant="outline"
                          className={
                            trade.position_type === 'long'
                              ? 'border-neon-green text-neon-green'
                              : 'border-neon-red text-neon-red'
                          }
                        >
                          {trade.position_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {format(new Date(trade.trade_date), 'MMM dd')}
                        </span>
                        <span className="font-medium">${trade.entry_price.toFixed(2)}</span>
                        <span
                          className={`font-medium ${
                            trade.profit_loss >= 0 ? 'text-neon-green' : 'text-neon-red'
                          }`}
                        >
                          ${trade.profit_loss.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
