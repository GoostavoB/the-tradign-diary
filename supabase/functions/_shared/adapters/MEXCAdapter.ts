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

export class MEXCAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.mexc.com';
  protected name = 'MEXC';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(queryString: string): Promise<string> {
    return await hmacSha256(this.credentials.apiSecret, queryString);
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimit();

    const timestamp = Date.now();
    const queryString = new URLSearchParams({
      ...params,
      timestamp: timestamp.toString(),
    }).toString();

    const signature = await this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: {
        'X-MEXC-APIKEY': this.credentials.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`MEXC API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v3/account');
      return true;
    } catch {
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const params: Record<string, any> = { limit: options?.limit || 500 };

      if (options?.startTime) {
        params.startTime = options.startTime.getTime();
      }

      if (options?.endTime) {
        params.endTime = options.endTime.getTime();
      }

      const trades = await this.makeRequest<any[]>('/api/v3/myTrades', params);
      
      return trades.map(trade => ({
        id: trade.id?.toString() || '',
        exchange: 'mexc',
        symbol: trade.symbol || '',
        side: trade.isBuyer ? 'buy' : 'sell',
        price: parseFloat(trade.price || '0'),
        quantity: parseFloat(trade.qty || '0'),
        fee: parseFloat(trade.commission || '0'),
        feeCurrency: trade.commissionAsset || 'USDT',
        timestamp: new Date(trade.time || Date.now()),
        orderId: trade.orderId?.toString(),
        role: trade.isMaker ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching MEXC trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const accountInfo = await this.makeRequest<{ balances: any[] }>('/api/v3/account');
      
      return accountInfo.balances
        .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        .map(balance => {
          const free = parseFloat(balance.free);
          const locked = parseFloat(balance.locked);
          return {
            exchange: 'mexc',
            currency: balance.asset,
            free,
            locked,
            total: free + locked,
          };
        });
    } catch (error) {
      console.error('Error fetching MEXC balances:', error);
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
