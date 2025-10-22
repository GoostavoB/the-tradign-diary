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

async function sha512(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha512(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export class GateioAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.gateio.ws/api/v4';
  protected name = 'Gate.io';
  protected rateLimitDelay = 150;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(
    method: string,
    path: string,
    queryString: string,
    bodyString: string,
    timestamp: string
  ): Promise<string> {
    const bodyHash = await sha512(bodyString);
    const message = `${method}\n${path}\n${queryString}\n${bodyHash}\n${timestamp}`;
    return await hmacSha512(this.credentials.apiSecret, message);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {},
    body: Record<string, any> = {}
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/api/v4${endpoint}`;
    
    const queryString = Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    const bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '';
    
    const signature = await this.generateSignature(
      method,
      path,
      queryString.replace('?', ''),
      bodyString,
      timestamp
    );

    const url = `${this.baseUrl}${endpoint}${queryString}`;

    const headers: Record<string, string> = {
      'KEY': this.credentials.apiKey,
      'SIGN': signature,
      'Timestamp': timestamp,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: bodyString || undefined,
    });

    if (!response.ok) {
      throw new Error(`Gate.io API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<any[]>('GET', '/spot/accounts');
      return true;
    } catch (error) {
      console.error('Gate.io connection test failed:', error);
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      // First fetch all available trading pairs
      const balances = await this.fetchBalances();
      const currencies = balances.map(b => b.currency).filter(c => c);
      
      if (currencies.length === 0) {
        return [];
      }

      const allTrades: Trade[] = [];
      const params: Record<string, any> = {};
      
      if (options?.startTime) {
        params.from = Math.floor(new Date(options.startTime).getTime() / 1000);
      }
      if (options?.endTime) {
        params.to = Math.floor(new Date(options.endTime).getTime() / 1000);
      }
      if (options?.limit) {
        params.limit = Math.min(options.limit, 1000);
      }

      // Fetch trades for common pairs with USDT
      const commonPairs = currencies
        .filter(c => c !== 'USDT')
        .map(c => `${c}_USDT`)
        .slice(0, 10); // Limit to 10 pairs to avoid rate limits

      for (const pair of commonPairs) {
        try {
          const trades = await this.makeRequest<any[]>('GET', `/spot/my_trades`, {
            ...params,
            currency_pair: pair,
          });

          for (const trade of trades) {
            allTrades.push({
              id: trade.id,
              orderId: trade.order_id,
              symbol: trade.currency_pair.replace('_', ''),
              side: trade.side as 'buy' | 'sell',
              price: parseFloat(trade.price),
              quantity: parseFloat(trade.amount),
              fee: parseFloat(trade.fee),
              feeCurrency: trade.fee_currency,
              timestamp: new Date(parseInt(trade.create_time_ms)),
              exchange: 'gateio',
              role: trade.role,
            });
          }
        } catch (error) {
          console.error(`Error fetching trades for ${pair}:`, error);
          continue;
        }
      }

      return allTrades;
    } catch (error) {
      console.error('Error fetching Gate.io trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const balances = await this.makeRequest<any[]>('GET', '/spot/accounts');
      
      return balances
        .filter(balance => parseFloat(balance.available) > 0 || parseFloat(balance.locked) > 0)
        .map(balance => {
          const free = parseFloat(balance.available);
          const locked = parseFloat(balance.locked);
          return {
            exchange: 'gateio',
            currency: balance.currency,
            free,
            locked,
            total: free + locked,
          };
        });
    } catch (error) {
      console.error('Error fetching Gate.io balances:', error);
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
