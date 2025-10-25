import { BaseExchangeAdapter } from './BaseExchangeAdapter.ts';
import type { 
  ExchangeCredentials, 
  Trade, 
  Balance, 
  Order, 
  Deposit, 
  Withdrawal,
  FetchOptions 
} from './types.ts';

async function hmacSha256(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export class BingXAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://open-api.bingx.com';
  protected name = 'BingX';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(params: string): Promise<string> {
    return await hmacSha256(this.credentials.apiSecret, params);
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now().toString();
    const allParams = { ...params, timestamp };
    const queryString = new URLSearchParams(allParams).toString();
    const signature = await this.generateSignature(queryString);

    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: {
        'X-BX-APIKEY': this.credentials.apiKey,
      },
    });

    const data = await response.json();
    const status = response.status;
    const code = typeof data?.code === 'number' ? data.code : undefined;
    const msg = data?.msg || data?.message || data?.error;

    console.log('BingX Request', { endpoint, status, code, msg });

    if (!response.ok) {
      throw new Error(`BingX HTTP Error [${status}]: ${response.statusText}`);
    }

    if (code !== undefined && code !== 0) {
      throw new Error(`BingX API Error [${code}]: ${msg || 'Unknown error'}`);
    }

    return (data && data.data !== undefined ? data.data : data) as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/openApi/spot/v1/account/balance');
      return true;
    } catch {
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const params: Record<string, any> = { 
        limit: Math.min(options?.limit || 500, 1000)
      };

      // Add time filters if provided
      if (options?.startTime) {
        params.startTime = options.startTime.getTime();
      }
      if (options?.endTime) {
        params.endTime = options.endTime.getTime();
      }
      if (options?.symbol) {
        params.symbol = options.symbol.replace('/', '-');
      }

      // BingX uses /openApi/spot/v2/trade/query for historical trades
      const response = await this.makeRequest<{ orders: any[] }>(
        '/openApi/spot/v2/trade/query', 
        params
      );
      
      if (!response.orders || !Array.isArray(response.orders)) {
        console.warn('BingX returned no trades or invalid format');
        return [];
      }

      return response.orders
        .filter(trade => trade && trade.orderId)
        .map(trade => ({
          id: trade.orderId?.toString() || trade.tradeId?.toString() || '',
          exchange: 'bingx',
          symbol: trade.symbol?.replace('-', '/') || '',
          side: trade.side?.toLowerCase() as 'buy' | 'sell',
          price: parseFloat(trade.price || '0'),
          quantity: parseFloat(trade.executedQty || trade.quantity || trade.origQty || '0'),
          fee: parseFloat(trade.commission || trade.fee || '0'),
          feeCurrency: trade.commissionAsset || trade.feeAsset || 'USDT',
          timestamp: new Date(parseInt(trade.time || trade.transactTime) || Date.now()),
          orderId: trade.orderId?.toString(),
        }));
    } catch (error) {
      console.error('Error fetching BingX trades:', error);
      throw error;
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<{ balances: any[] }>('/openApi/spot/v1/account/balance');
      return response.balances
        .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map(balance => {
          const free = parseFloat(balance.free);
          const locked = parseFloat(balance.locked);
          return {
            exchange: 'bingx',
            currency: balance.asset,
            free,
            locked,
            total: free + locked,
          };
        });
    } catch (error) {
      console.error('Error fetching BingX balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    return [];
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    return [];
  }

  async fetchFuturesTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const baseParams: Record<string, any> = {
        limit: Math.min(options?.limit || 500, 500),
        recvWindow: 60000,
      };

      if (options?.startTime) baseParams.startTime = options.startTime.getTime();
      if (options?.endTime) baseParams.endTime = options.endTime.getTime();
      if (options?.symbol) baseParams.symbol = options.symbol.replace('/', '-');

      // Prefer fills endpoint for executed trades
      let items: any[] = [];
      try {
        const resp1 = await this.makeRequest<any>(
          '/openApi/swap/v2/trade/allFillOrders',
          baseParams
        );
        const list1 = resp1?.orders || resp1?.fills || resp1?.list || resp1;
        if (Array.isArray(list1)) items = list1;
      } catch (e) {
        console.warn('BingX allFillOrders failed, will try fillHistory:', e instanceof Error ? e.message : e);
      }

      if (!Array.isArray(items) || items.length === 0) {
        console.log('BingX futures returned 0 fills from allFillOrders, trying fillHistory...');
        try {
          const resp2 = await this.makeRequest<any>(
            '/openApi/swap/v2/trade/fillHistory',
            baseParams
          );
          const list2 = resp2?.orders || resp2?.fills || resp2?.list || resp2;
          if (Array.isArray(list2)) items = list2;
        } catch (e2) {
          console.warn('BingX fillHistory failed:', e2 instanceof Error ? e2.message : e2);
        }
      }

      if (!Array.isArray(items) || items.length === 0) {
        console.warn('BingX futures returned no trades or invalid format');
        return [];
      }

      return items
        .filter((t: any) => t && (t.orderId || t.tradeId || t.id))
        .map((t: any) => {
          const price = parseFloat(
            t.avgPrice || t.price || t.dealAvgPrice || t.dealPrice || '0'
          );
          const qty = parseFloat(
            t.executedQty || t.qty || t.volume || t.dealVol || t.origQty || '0'
          );
          const fee = parseFloat(t.commission || t.fee || '0');
          const tsRaw =
            t.time || t.updateTime || t.updatedTime || t.fillTime || t.createTime;
          const ts = new Date(parseInt(tsRaw) || Date.now());

          return {
            id: (t.tradeId || t.id || t.orderId || '').toString(),
            exchange: 'bingx',
            symbol: (t.symbol || '').replace('-', '/'),
            side: (t.side || '').toLowerCase() as 'buy' | 'sell',
            price,
            quantity: qty,
            fee,
            feeCurrency: t.commissionAsset || t.feeAsset || 'USDT',
            timestamp: ts,
            orderId: t.orderId ? String(t.orderId) : undefined,
            role: t.positionSide || t.role,
          } as Trade;
        });
    } catch (error) {
      console.error('Error fetching BingX futures trades:', error);
      throw error;
    }
  }

  // Optional futures-specific health check
  async testFuturesConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/openApi/swap/v3/user/balance');
      return true;
    } catch {
      return false;
    }
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    return [];
  }
}
