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

    if (!response.ok) {
      throw new Error(`BingX API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
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
      const params: Record<string, any> = { limit: options?.limit || 500 };
      const response = await this.makeRequest<{ orders: any[] }>('/openApi/spot/v1/trade/query', params);
      
      return response.orders.map(trade => ({
        id: trade.orderId?.toString() || '',
        exchange: 'bingx',
        symbol: trade.symbol?.replace('-', '/') || '',
        side: trade.side?.toLowerCase() as 'buy' | 'sell',
        price: parseFloat(trade.price || '0'),
        quantity: parseFloat(trade.quantity || trade.origQty || '0'),
        fee: parseFloat(trade.fee || '0'),
        feeCurrency: trade.feeAsset || 'USDT',
        timestamp: new Date(trade.time || Date.now()),
        orderId: trade.orderId?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching BingX trades:', error);
      return [];
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

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    return [];
  }
}
