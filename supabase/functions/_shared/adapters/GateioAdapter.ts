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
      // Gate.io requires currency_pair, so return empty for now
      return [];
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
