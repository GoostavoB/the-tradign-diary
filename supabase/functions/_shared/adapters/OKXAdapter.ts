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

export class OKXAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://www.okx.com';
  protected name = 'OKX';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
    if (!credentials.apiPassphrase) {
      console.warn('OKX requires API Passphrase');
    }
  }

  private async generateSignature(timestamp: string, method: string, requestPath: string, body: string = ''): Promise<string> {
    const message = timestamp + method + requestPath + body;
    const encoder = new TextEncoder();
    const signature = await hmacSha256(this.credentials.apiSecret, message);
    const bytes = new Uint8Array(signature.match(/.{2}/g)?.map(byte => parseInt(byte, 16)) || []);
    return base64Encode(bytes);
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    await this.rateLimit();
    const timestamp = new Date().toISOString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = await this.generateSignature(timestamp, method, endpoint, bodyString);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'OK-ACCESS-KEY': this.credentials.apiKey,
        'OK-ACCESS-SIGN': signature,
        'OK-ACCESS-TIMESTAMP': timestamp,
        'OK-ACCESS-PASSPHRASE': this.credentials.apiPassphrase || '',
        'Content-Type': 'application/json',
      },
      body: bodyString || undefined,
    });

    const data = await response.json();
    if (data.code !== '0') {
      throw new Error(`OKX API Error: ${data.msg}`);
    }
    return data.data as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v5/account/balance');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/trade/fills', 'GET');
      return response.map(t => ({
        id: t.tradeId,
        exchange: 'okx',
        symbol: t.instId.replace('-', '/'),
        side: t.side,
        price: parseFloat(t.fillPx),
        quantity: parseFloat(t.fillSz),
        fee: parseFloat(t.fee),
        feeCurrency: t.feeCcy,
        timestamp: new Date(parseInt(t.ts)),
        orderId: t.ordId,
        role: t.execType === 'M' ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching OKX trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest<any[]>('/api/v5/account/balance');
      const balances: Balance[] = [];
      
      for (const account of response) {
        for (const detail of account.details || []) {
          const free = parseFloat(detail.availBal);
          const locked = parseFloat(detail.frozenBal);
          if (free > 0 || locked > 0) {
            balances.push({
              exchange: 'okx',
              currency: detail.ccy,
              free,
              locked,
              total: free + locked,
            });
          }
        }
      }
      return balances;
    } catch (error) {
      console.error('Error fetching OKX balances:', error);
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
