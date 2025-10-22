import { BaseExchangeAdapter } from './BaseExchangeAdapter.ts';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from './types.ts';

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

function base64Encode(bytes: Uint8Array): string {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

export class KuCoinAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.kucoin.com';
  protected name = 'KuCoin';
  protected rateLimitDelay = 200;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
    if (!credentials.apiPassphrase) {
      console.warn('KuCoin requires API Passphrase');
    }
  }

  private async generateSignature(timestamp: string, method: string, endpoint: string, body: string = ''): Promise<string> {
    const message = timestamp + method + endpoint + body;
    const encoder = new TextEncoder();
    const signature = await hmacSha256(this.credentials.apiSecret, message);
    const bytes = new Uint8Array(signature.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
    return base64Encode(bytes);
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    await this.rateLimit();
    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = await this.generateSignature(timestamp, method, endpoint, bodyString);
    
    const passphrase = this.credentials.apiPassphrase 
      ? await this.generateSignature(timestamp, 'GET', '', this.credentials.apiPassphrase)
      : '';

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'KC-API-KEY': this.credentials.apiKey,
        'KC-API-SIGN': signature,
        'KC-API-TIMESTAMP': timestamp,
        'KC-API-PASSPHRASE': passphrase,
        'KC-API-KEY-VERSION': '2',
        'Content-Type': 'application/json',
      },
      body: bodyString || undefined,
    });

    const data = await response.json();
    if (data.code !== '200000') {
      throw new Error(`KuCoin API Error: ${data.msg}`);
    }
    return data.data as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v1/accounts');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<{ items: any[] }>('/api/v1/fills');
      return response.items.map(t => ({
        id: t.tradeId,
        exchange: 'kucoin',
        symbol: t.symbol.replace('-', '/'),
        side: t.side,
        price: parseFloat(t.price),
        quantity: parseFloat(t.size),
        fee: parseFloat(t.fee),
        feeCurrency: t.feeCurrency,
        timestamp: new Date(t.createdAt),
        orderId: t.orderId,
        role: t.liquidity === 'maker' ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching KuCoin trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const accounts = await this.makeRequest<any[]>('/api/v1/accounts');
      const balanceMap = new Map<string, { free: number; locked: number }>();
      
      for (const account of accounts) {
        const currency = account.currency;
        const existing = balanceMap.get(currency) || { free: 0, locked: 0 };
        existing.free += parseFloat(account.available);
        existing.locked += parseFloat(account.holds);
        balanceMap.set(currency, existing);
      }

      return Array.from(balanceMap.entries())
        .map(([currency, balance]) => ({
          exchange: 'kucoin',
          currency,
          free: balance.free,
          locked: balance.locked,
          total: balance.free + balance.locked,
        }))
        .filter(b => b.total > 0);
    } catch (error) {
      console.error('Error fetching KuCoin balances:', error);
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
