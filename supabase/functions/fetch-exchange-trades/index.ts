import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchRequest {
  connectionId: string;
  mode: 'preview' | 'import';
  selectedTradeIds?: string[];
  startDate?: string;
  endDate?: string;
}

function decrypt(encryptedText: string): string {
  return atob(encryptedText);
}

interface BingXSpotTrade {
  symbol: string;
  orderId: number;
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
}

interface BingXFuturesTrade {
  symbol: string;
  id: number;
  orderId: number;
  side: string;
  price: string;
  qty: string;
  realizedProfit: string;
  marginAsset: string;
  quoteQty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  positionSide: string;
}

interface BybitTrade {
  symbol: string;
  orderId: string;
  orderLinkId: string;
  side: string;
  orderPrice: string;
  orderQty: string;
  execFee: string;
  execId: string;
  execPrice: string;
  execQty: string;
  execTime: string;
  closedPnl?: string;
}

interface MexcTrade {
  symbol: string;
  id: number;
  orderId: number;
  price: string;
  qty: string;
  commission: string;
  commissionAsset: string;
  time: number;
  isBuyer: boolean;
  isMaker: boolean;
  realizedPnl?: string;
}

async function fetchBinanceSpotTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<any[]> {
  const allTrades: any[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://api.binance.com/api/v3/myTrades?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-MBX-APIKEY': apiKey },
      });
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        allTrades.push(...data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }
  }
  
  return allTrades;
}

async function fetchBinanceFuturesTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<any[]> {
  const allTrades: any[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://fapi.binance.com/fapi/v1/userTrades?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-MBX-APIKEY': apiKey },
      });
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        allTrades.push(...data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${symbol} futures:`, error);
    }
  }
  
  return allTrades;
}

async function fetchBybitSpotTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<BybitTrade[]> {
  const allTrades: BybitTrade[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `api_key=${apiKey}&symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://api.bybit.com/v5/execution/list?${queryString}&sign=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-BAPI-API-KEY': apiKey },
      });
      
      const data = await response.json();
      
      if (data.retCode === 0 && data.result?.list) {
        allTrades.push(...data.result.list);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${symbol} from Bybit:`, error);
    }
  }
  
  return allTrades;
}

async function fetchBybitFuturesTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<BybitTrade[]> {
  const allTrades: BybitTrade[] = [];
  const timestamp = Date.now().toString();
  let queryString = `api_key=${apiKey}&category=linear&timestamp=${timestamp}`;
  
  if (startTime) queryString += `&startTime=${startTime}`;
  if (endTime) queryString += `&endTime=${endTime}`;
  
  const signature = createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
  
  const url = `https://api.bybit.com/v5/execution/list?${queryString}&sign=${signature}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'X-BAPI-API-KEY': apiKey },
    });
    
    const data = await response.json();
    
    if (data.retCode === 0 && data.result?.list) {
      allTrades.push(...data.result.list);
    }
  } catch (error) {
    console.error('Error fetching futures from Bybit:', error);
  }
  
  return allTrades;
}

async function fetchMexcSpotTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<MexcTrade[]> {
  const allTrades: MexcTrade[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://api.mexc.com/api/v3/myTrades?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-MEXC-APIKEY': apiKey },
      });
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        allTrades.push(...data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${symbol} from MEXC:`, error);
    }
  }
  
  return allTrades;
}

async function fetchMexcFuturesTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<MexcTrade[]> {
  const allTrades: MexcTrade[] = [];
  const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://contract.mexc.com/api/v1/private/account/trades?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'ApiKey': apiKey },
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        allTrades.push(...data.data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${symbol} futures from MEXC:`, error);
    }
  }
  
  return allTrades;
}

async function fetchBingXSpotTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<BingXSpotTrade[]> {
  const allTrades: BingXSpotTrade[] = [];
  const symbols = ['BTC-USDT', 'ETH-USDT'];
  
  for (const symbol of symbols) {
    const timestamp = Date.now().toString();
    let queryString = `symbol=${symbol}&timestamp=${timestamp}`;
    
    if (startTime) queryString += `&startTime=${startTime}`;
    if (endTime) queryString += `&endTime=${endTime}`;
    
    const signature = createHmac('sha256', apiSecret)
      .update(queryString)
      .digest('hex');
    
    const url = `https://open-api.bingx.com/openApi/spot/v1/trade/myTrades?${queryString}&signature=${signature}`;
    
    try {
      const response = await fetch(url, {
        headers: { 'X-BX-APIKEY': apiKey },
      });
      
      const data = await response.json();
      
      if (data.code === 0 && data.data) {
        allTrades.push(...data.data);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }
  }
  
  return allTrades;
}

async function fetchBingXFuturesTrades(
  apiKey: string,
  apiSecret: string,
  startTime?: number,
  endTime?: number
): Promise<BingXFuturesTrade[]> {
  const allTrades: BingXFuturesTrade[] = [];
  const timestamp = Date.now().toString();
  let queryString = `incomeType=REALIZED_PNL&timestamp=${timestamp}`;
  
  if (startTime) queryString += `&startTime=${startTime}`;
  if (endTime) queryString += `&endTime=${endTime}`;
  
  const signature = createHmac('sha256', apiSecret)
    .update(queryString)
    .digest('hex');
  
  const url = `https://open-api.bingx.com/openApi/swap/v2/user/income?${queryString}&signature=${signature}`;
  
  try {
    const response = await fetch(url, {
      headers: { 'X-BX-APIKEY': apiKey },
    });
    
    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      allTrades.push(...data.data);
    }
  } catch (error) {
    console.error('Error fetching futures trades:', error);
  }
  
  return allTrades;
}

function normalizeBinanceSpotTrade(trade: any, userId: string): any {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.isBuyer ? 'long' : 'short',
    entry_price: parseFloat(trade.price),
    position_size: parseFloat(trade.qty),
    trading_fee: parseFloat(trade.commission),
    opened_at: new Date(trade.time).toISOString(),
    trade_date: new Date(trade.time).toISOString().split('T')[0],
    exchange_source: 'binance',
    exchange_trade_id: trade.id.toString(),
    broker: 'Binance',
  };
}

function normalizeBinanceFuturesTrade(trade: any, userId: string): any {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.positionSide ? trade.positionSide.toLowerCase() : (trade.side === 'BUY' ? 'long' : 'short'),
    entry_price: parseFloat(trade.price),
    position_size: parseFloat(trade.qty),
    trading_fee: parseFloat(trade.commission || 0),
    profit_loss: parseFloat(trade.realizedPnl || 0),
    pnl: parseFloat(trade.realizedPnl || 0),
    opened_at: new Date(trade.time).toISOString(),
    trade_date: new Date(trade.time).toISOString().split('T')[0],
    exchange_source: 'binance',
    exchange_trade_id: trade.id.toString(),
    broker: 'Binance Futures',
  };
}

function normalizeSpotTrade(trade: BingXSpotTrade, userId: string): any {
  return {
    user_id: userId,
    symbol: trade.symbol.replace('-', ''),
    side: trade.isBuyer ? 'long' : 'short',
    entry_price: parseFloat(trade.price),
    position_size: parseFloat(trade.qty),
    trading_fee: parseFloat(trade.commission),
    opened_at: new Date(trade.time).toISOString(),
    trade_date: new Date(trade.time).toISOString().split('T')[0],
    exchange_source: 'bingx',
    exchange_trade_id: trade.orderId.toString(),
    broker: 'BingX',
  };
}

function normalizeFuturesTrade(trade: BingXFuturesTrade, userId: string): any {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.side.toLowerCase() as 'long' | 'short',
    entry_price: parseFloat(trade.price),
    position_size: parseFloat(trade.qty),
    trading_fee: parseFloat(trade.commission),
    profit_loss: parseFloat(trade.realizedProfit),
    pnl: parseFloat(trade.realizedProfit),
    opened_at: new Date(trade.time).toISOString(),
    trade_date: new Date(trade.time).toISOString().split('T')[0],
    exchange_source: 'bingx',
    exchange_trade_id: trade.id.toString(),
    broker: 'BingX',
  };
}

function normalizeBybitTrade(trade: BybitTrade, userId: string, isFutures: boolean = false): any {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.side.toLowerCase() as 'long' | 'short',
    entry_price: parseFloat(trade.execPrice),
    position_size: parseFloat(trade.execQty),
    trading_fee: parseFloat(trade.execFee),
    profit_loss: trade.closedPnl ? parseFloat(trade.closedPnl) : undefined,
    pnl: trade.closedPnl ? parseFloat(trade.closedPnl) : undefined,
    opened_at: new Date(parseInt(trade.execTime)).toISOString(),
    trade_date: new Date(parseInt(trade.execTime)).toISOString().split('T')[0],
    exchange_source: 'bybit',
    exchange_trade_id: trade.execId,
    broker: isFutures ? 'Bybit Futures' : 'Bybit',
  };
}

function normalizeMexcTrade(trade: MexcTrade, userId: string, isFutures: boolean = false): any {
  return {
    user_id: userId,
    symbol: trade.symbol,
    side: trade.isBuyer ? 'long' : 'short',
    entry_price: parseFloat(trade.price),
    position_size: parseFloat(trade.qty),
    trading_fee: parseFloat(trade.commission),
    profit_loss: trade.realizedPnl ? parseFloat(trade.realizedPnl) : undefined,
    pnl: trade.realizedPnl ? parseFloat(trade.realizedPnl) : undefined,
    opened_at: new Date(trade.time).toISOString(),
    trade_date: new Date(trade.time).toISOString().split('T')[0],
    exchange_source: 'mexc',
    exchange_trade_id: trade.id.toString(),
    broker: isFutures ? 'MEXC Futures' : 'MEXC',
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    const { connectionId, mode, selectedTradeIds, startDate, endDate }: FetchRequest = await req.json();

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

    // Handle import mode
    if (mode === 'import') {
      if (!selectedTradeIds || selectedTradeIds.length === 0) {
        throw new Error('No trades selected for import');
      }

      // Fetch selected pending trades
      const { data: pendingTrades, error: fetchError } = await supabaseClient
        .from('exchange_pending_trades')
        .select('*')
        .in('id', selectedTradeIds)
        .eq('connection_id', connectionId);

      if (fetchError) throw fetchError;

      // Insert into trades table
      let imported = 0;
      let skipped = 0;

      for (const pending of pendingTrades || []) {
        const { error } = await supabaseClient
          .from('trades')
          .insert(pending.trade_data);

        if (error) {
          if (error.code === '23505') {
            skipped++;
          } else {
            console.error('Insert error:', error);
          }
        } else {
          imported++;
        }
      }

      // Clean up pending trades
      await supabaseClient
        .from('exchange_pending_trades')
        .delete()
        .eq('connection_id', connectionId);

      // Update connection
      await supabaseClient
        .from('exchange_connections')
        .update({
          sync_status: 'success',
          last_synced_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', connectionId);

      return new Response(
        JSON.stringify({
          success: true,
          tradesImported: imported,
          tradesSkipped: skipped,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to syncing for preview mode
    await supabaseClient
      .from('exchange_connections')
      .update({ sync_status: 'syncing' })
      .eq('id', connectionId);

    // Create sync history record
    const { data: syncHistory } = await supabaseClient
      .from('exchange_sync_history')
      .insert({
        user_id: user.id,
        connection_id: connectionId,
        exchange_name: connection.exchange_name,
        sync_type: 'manual',
        status: 'processing',
      })
      .select()
      .single();

    // Decrypt credentials
    const apiKey = decrypt(connection.api_key_encrypted);
    const apiSecret = decrypt(connection.api_secret_encrypted);

    // Calculate date range
    const endTime = endDate ? new Date(endDate).getTime() : Date.now();
    const startTime = startDate
      ? new Date(startDate).getTime()
      : endTime - 30 * 24 * 60 * 60 * 1000; // Default: last 30 days

    // Fetch trades based on exchange
    let allTrades: any[] = [];
    if (connection.exchange_name === 'binance') {
      const [spotTrades, futuresTrades] = await Promise.all([
        fetchBinanceSpotTrades(apiKey, apiSecret, startTime, endTime),
        fetchBinanceFuturesTrades(apiKey, apiSecret, startTime, endTime),
      ]);

      const normalizedSpot = spotTrades.map(t => normalizeBinanceSpotTrade(t, user.id));
      const normalizedFutures = futuresTrades.map(t => normalizeBinanceFuturesTrade(t, user.id));
      allTrades = [...normalizedSpot, ...normalizedFutures];
    } else if (connection.exchange_name === 'bingx') {
      const [spotTrades, futuresTrades] = await Promise.all([
        fetchBingXSpotTrades(apiKey, apiSecret, startTime, endTime),
        fetchBingXFuturesTrades(apiKey, apiSecret, startTime, endTime),
      ]);

      const normalizedSpot = spotTrades.map(t => normalizeSpotTrade(t, user.id));
      const normalizedFutures = futuresTrades.map(t => normalizeFuturesTrade(t, user.id));
      allTrades = [...normalizedSpot, ...normalizedFutures];
    } else if (connection.exchange_name === 'bybit') {
      const [spotTrades, futuresTrades] = await Promise.all([
        fetchBybitSpotTrades(apiKey, apiSecret, startTime, endTime),
        fetchBybitFuturesTrades(apiKey, apiSecret, startTime, endTime),
      ]);

      const normalizedSpot = spotTrades.map(t => normalizeBybitTrade(t, user.id, false));
      const normalizedFutures = futuresTrades.map(t => normalizeBybitTrade(t, user.id, true));
      allTrades = [...normalizedSpot, ...normalizedFutures];
    } else if (connection.exchange_name === 'mexc') {
      const [spotTrades, futuresTrades] = await Promise.all([
        fetchMexcSpotTrades(apiKey, apiSecret, startTime, endTime),
        fetchMexcFuturesTrades(apiKey, apiSecret, startTime, endTime),
      ]);

      const normalizedSpot = spotTrades.map(t => normalizeMexcTrade(t, user.id, false));
      const normalizedFutures = futuresTrades.map(t => normalizeMexcTrade(t, user.id, true));
      allTrades = [...normalizedSpot, ...normalizedFutures];
    }

    // Store trades in pending_trades table (preview mode)
    for (const trade of allTrades) {
      await supabaseClient
        .from('exchange_pending_trades')
        .insert({
          user_id: user.id,
          connection_id: connectionId,
          trade_data: trade,
          is_selected: true,
        });
    }

    // Update connection status
    await supabaseClient
      .from('exchange_connections')
      .update({
        sync_status: 'pending_review',
        sync_error: null,
      })
      .eq('id', connectionId);

    // Update sync history
    if (syncHistory) {
      await supabaseClient
        .from('exchange_sync_history')
        .update({
          trades_fetched: allTrades.length,
          status: 'pending_review',
          completed_at: new Date().toISOString(),
        })
        .eq('id', syncHistory.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tradesFetched: allTrades.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
