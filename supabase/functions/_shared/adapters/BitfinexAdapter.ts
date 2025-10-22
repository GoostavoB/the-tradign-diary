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

async function hmacSha384(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-384' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export class BitfinexAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.bitfinex.com';
  protected name = 'Bitfinex';
  protected rateLimitDelay = 150;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private async generateSignature(payload: string): Promise<string> {
    return await hmacSha384(this.credentials.apiSecret, payload);
  }

  private async makeRequest<T>(endpoint: string, body: any = {}): Promise<T> {
    await this.rateLimit();

    const nonce = Date.now().toString();
    const payload = JSON.stringify({ ...body, nonce });
    const signature = await this.generateSignature(payload);

    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': this.credentials.apiKey,
        'bfx-signature': signature,
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Bitfinex API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/v2/auth/r/wallets');
      return true;
    } catch {
      return false;
    }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<any[]>('/v2/auth/r/trades/hist', {
        limit: options?.limit || 500,
      });

      return response.map(trade => ({
        id: trade[0]?.toString() || '',
        exchange: 'bitfinex',
        symbol: trade[1] || '',
        side: trade[4] > 0 ? 'buy' : 'sell',
        price: Math.abs(trade[5] || 0),
        quantity: Math.abs(trade[4] || 0),
        fee: Math.abs(trade[9] || 0),
        feeCurrency: trade[10] || 'USD',
        timestamp: new Date(trade[2] || Date.now()),
        orderId: trade[3]?.toString(),
      }));
    } catch (error) {
      console.error('Error fetching Bitfinex trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const wallets = await this.makeRequest<any[]>('/v2/auth/r/wallets');
      
      return wallets.map(wallet => ({
        exchange: 'bitfinex',
        currency: wallet[1] || '',
        free: wallet[2] || 0,
        locked: 0,
        total: wallet[2] || 0,
      }));
    } catch (error) {
      console.error('Error fetching Bitfinex balances:', error);
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
