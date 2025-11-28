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

function base64Encode(data: string): string {
  return btoa(data);
}

interface CoinbaseFill {
  entry_id: string;
  trade_id: string;
  order_id: string;
  trade_time: string;
  trade_type: string;
  price: string;
  size: string;
  commission: string;
  product_id: string;
  sequence_timestamp: string;
  liquidity_indicator: string;
  size_in_quote: boolean;
  user_id: string;
  side: string;
}

interface CoinbaseAccount {
  uuid: string;
  name: string;
  currency: string;
  available_balance: { value: string; currency: string };
  hold: { value: string; currency: string };
}

export class CoinbaseAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.coinbase.com/api/v3/brokerage';
  protected name = 'Coinbase';
  protected rateLimitDelay = 150;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateJWT(requestPath: string, method: string): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${timestamp}${method}${requestPath}`;
    const signature = await hmacSha256(this.credentials.apiSecret, message);
    
    const jwt = JSON.stringify({
      sub: this.credentials.apiKey,
      iss: 'coinbase-cloud',
      nbf: timestamp,
      exp: timestamp + 120,
      signature,
    });
    return base64Encode(jwt);
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    await this.rateLimit();

    const requestPath = `/api/v3/brokerage${endpoint}`;
    const jwt = await this.generateJWT(requestPath, method);
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Coinbase API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/accounts');
      return true;
    } catch (error) {
      console.error('Coinbase connection test failed:', error);
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<{ fills: CoinbaseFill[] }>('/orders/historical/fills');
      return response.fills.map(fill => ({
        id: fill.entry_id,
        exchange: 'coinbase',
        symbol: fill.product_id.replace('-', '/'),
        side: fill.side.toLowerCase() as 'buy' | 'sell',
        price: parseFloat(fill.price),
        quantity: parseFloat(fill.size),
        fee: parseFloat(fill.commission),
        feeCurrency: fill.product_id.split('-')[1],
        timestamp: new Date(fill.trade_time),
        orderId: fill.order_id,
        role: fill.liquidity_indicator === 'MAKER' ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching Coinbase trades:', error);
      throw error;
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<{ accounts: CoinbaseAccount[] }>('/accounts');
      return response.accounts
        .filter(account => parseFloat(account.available_balance.value) > 0 || parseFloat(account.hold.value) > 0)
        .map(account => {
          const free = parseFloat(account.available_balance.value);
          const locked = parseFloat(account.hold.value);
          return {
            exchange: 'coinbase',
            currency: account.currency,
            free,
            locked,
            total: free + locked,
          };
        });
    } catch (error) {
      console.error('Error fetching Coinbase balances:', error);
      throw error;
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
