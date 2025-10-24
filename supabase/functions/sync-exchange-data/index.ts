import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { ExchangeService } from '../_shared/adapters/ExchangeService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  connectionId: string;
  syncTypes?: Array<'trades' | 'orders' | 'deposits' | 'withdrawals'>;
  startDate?: string;
  endDate?: string;
}

function decrypt(encryptedText: string): string {
  return atob(encryptedText);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { connectionId, syncTypes = ['trades'], startDate, endDate }: SyncRequest = await req.json();

    // Fetch connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from('exchange_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Connection not found');
    }

    // Update status to syncing
    await supabaseClient
      .from('exchange_connections')
      .update({ sync_status: 'syncing' })
      .eq('id', connectionId);

    // Decrypt credentials
    const apiKey = decrypt(connection.api_key_encrypted);
    const apiSecret = decrypt(connection.api_secret_encrypted);
    const apiPassphrase = connection.api_passphrase_encrypted 
      ? decrypt(connection.api_passphrase_encrypted)
      : undefined;

    // Calculate date range
    const endTime = endDate ? new Date(endDate) : new Date();
    const startTime = startDate
      ? new Date(startDate)
      : new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days

    // Initialize exchange service
    const exchangeService = new ExchangeService();
    console.log(`[${connection.exchange_name}] Initializing exchange connection...`);
    
    const initialized = await exchangeService.initializeExchange(
      connection.exchange_name,
      { apiKey, apiSecret, apiPassphrase }
    );

    if (!initialized) {
      console.error(`[${connection.exchange_name}] Connection failed`);
      
      await supabaseClient
        .from('exchange_connections')
        .update({
          sync_status: 'error',
          sync_error: 'Failed to initialize connection',
          health_status: 'down',
        })
        .eq('id', connectionId);

      throw new Error(`Failed to connect to ${connection.exchange_name}`);
    }
    
    console.log(`[${connection.exchange_name}] Connection successful`);
    const displayName = exchangeService.getExchangeName(connection.exchange_name) || connection.exchange_name;

    const results: Record<string, number | string> = {};

    // Sync each requested data type
    for (const syncType of syncTypes) {
      try {
        if (syncType === 'trades') {
          console.log(`[${displayName}] Fetching trades...`);
          const result = await exchangeService.syncExchange(connection.exchange_name, {
            startDate: startTime,
            endDate: endTime,
          });

          if (result.success && result.trades) {
            results.trades = result.trades.length;
            console.log(`[${displayName}] Fetched ${result.trades.length} trades`);
            
            // Store in pending trades for review (similar to existing flow)
            for (const trade of result.trades) {
              const tradeData = {
                user_id: user.id,
                pair: trade.symbol,
                side: trade.side === 'buy' ? 'long' : trade.side === 'sell' ? 'short' : trade.side,
                type: 'spot' as const,
                entry_price: trade.price,
                exit_price: trade.price,
                size: trade.quantity,
                pnl: 0,
                pnl_percentage: 0,
                fee: trade.fee,
                fee_currency: trade.feeCurrency || trade.feeAsset || 'USDT',
                exchange: displayName,
                opened_at: new Date(trade.timestamp).toISOString(),
                closed_at: new Date(trade.timestamp).toISOString(),
                notes: `Auto-synced from ${displayName}`,
                broker_name: displayName,
              };

              await supabaseClient.from('trades').upsert(tradeData, {
                onConflict: 'id',
                ignoreDuplicates: true,
              });
            }

            // Update last sync timestamp
            await supabaseClient
              .from('exchange_connections')
              .update({ last_trade_sync_at: new Date().toISOString() })
              .eq('id', connectionId);
          } else {
            console.warn(`[${displayName}] No trades returned or sync failed`);
          }
        }

        if (syncType === 'orders') {
          const result = await exchangeService.syncOrders(connection.exchange_name, {
            startDate: startTime,
            endDate: endTime,
          });

          if (result.success && result.orders) {
            results.orders = result.orders.length;
            
            // Store orders
            for (const order of result.orders) {
              await supabaseClient
                .from('exchange_orders')
                .upsert({
                  user_id: user.id,
                  connection_id: connectionId,
                  exchange_order_id: order.id,
                  symbol: order.symbol,
                  side: order.side,
                  type: order.type,
                  price: order.price,
                  quantity: order.quantity,
                  filled: order.filled || order.executedQuantity || 0,
                  status: order.status,
                  timestamp: new Date(order.timestamp).toISOString(),
                }, {
                  onConflict: 'connection_id,exchange_order_id',
                  ignoreDuplicates: true,
                });
            }

            await supabaseClient
              .from('exchange_connections')
              .update({ last_order_sync_at: new Date().toISOString() })
              .eq('id', connectionId);
          }
        }

        if (syncType === 'deposits') {
          const result = await exchangeService.syncDeposits(connection.exchange_name, {
            startDate: startTime,
            endDate: endTime,
          });

          if (result.success && result.deposits) {
            results.deposits = result.deposits.length;
            
            for (const deposit of result.deposits) {
              await supabaseClient
                .from('exchange_deposits')
                .upsert({
                  user_id: user.id,
                  connection_id: connectionId,
                  exchange_deposit_id: deposit.id,
                  currency: deposit.currency || deposit.coin || deposit.asset || 'UNKNOWN',
                  amount: deposit.amount,
                  status: deposit.status,
                  tx_id: deposit.txId,
                  network: deposit.network,
                  timestamp: new Date(deposit.timestamp).toISOString(),
                }, {
                  onConflict: 'connection_id,exchange_deposit_id',
                  ignoreDuplicates: true,
                });
            }

            await supabaseClient
              .from('exchange_connections')
              .update({ last_deposit_sync_at: new Date().toISOString() })
              .eq('id', connectionId);
          }
        }

        if (syncType === 'withdrawals') {
          const result = await exchangeService.syncWithdrawals(connection.exchange_name, {
            startDate: startTime,
            endDate: endTime,
          });

          if (result.success && result.withdrawals) {
            results.withdrawals = result.withdrawals.length;
            
            for (const withdrawal of result.withdrawals) {
              await supabaseClient
                .from('exchange_withdrawals')
                .upsert({
                  user_id: user.id,
                  connection_id: connectionId,
                  exchange_withdrawal_id: withdrawal.id,
                  currency: withdrawal.currency || withdrawal.coin || withdrawal.asset || 'UNKNOWN',
                  amount: withdrawal.amount,
                  fee: withdrawal.fee,
                  status: withdrawal.status,
                  tx_id: withdrawal.txId,
                  network: withdrawal.network,
                  timestamp: new Date(withdrawal.timestamp).toISOString(),
                }, {
                  onConflict: 'connection_id,exchange_withdrawal_id',
                  ignoreDuplicates: true,
                });
            }

            await supabaseClient
              .from('exchange_connections')
              .update({ last_withdrawal_sync_at: new Date().toISOString() })
              .eq('id', connectionId);
          }
        }
      } catch (error) {
        console.error(`[${displayName}] Error syncing ${syncType}:`, error);
        results[`${syncType}_error`] = error instanceof Error ? error.message : String(error);
      }
    }

    // Perform health check
    console.log(`[${displayName}] Performing health check...`);
    const healthCheck = await exchangeService.performHealthCheck(connection.exchange_name);
    console.log(`[${displayName}] Health status: ${healthCheck?.status}, Latency: ${healthCheck?.latency}ms`);
    
    // Update connection status
    await supabaseClient
      .from('exchange_connections')
      .update({
        sync_status: 'success',
        last_synced_at: new Date().toISOString(),
        sync_error: null,
        failed_sync_count: 0,
        health_status: healthCheck?.status || 'healthy',
      })
      .eq('id', connectionId);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        healthStatus: healthCheck?.status,
        latency: healthCheck?.latency,
        exchangeName: displayName,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[sync-exchange-data] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
