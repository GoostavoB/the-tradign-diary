import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

export class BitfinexAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.bitfinex.com';
  protected name = 'Bitfinex';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(path: string, nonce: string, body: string): string {
    const signature = `/api${path}${nonce}${body}`;
    return CryptoJS.HmacSHA384(signature, this.credentials.apiSecret).toString();
  }

  private async makeRequest<T>(endpoint: string, body: any = {}): Promise<T> {
    await this.rateLimit();
    const nonce = Date.now().toString();
    const bodyString = JSON.stringify(body);
    const signature = this.generateSignature(endpoint, nonce, bodyString);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': this.credentials.apiKey,
        'bfx-signature': signature,
        'Content-Type': 'application/json',
      },
      body: bodyString,
    });

    const data = await response.json();
    if (Array.isArray(data) && data[0] === 'error') {
      throw new Error(`Bitfinex API Error: ${data[2]}`);
    }
    return data as T;
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/v2/auth/r/wallets');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const trades = await this.makeRequest<any[]>('/v2/auth/r/trades/hist', {});
      return trades.map(t => ({
        id: t[0].toString(),
        exchange: 'bitfinex',
        symbol: t[1].replace('t', ''),
        side: t[4] > 0 ? 'buy' : 'sell',
        price: Math.abs(t[5]),
        quantity: Math.abs(t[4]),
        fee: Math.abs(t[9]),
        feeCurrency: t[10],
        timestamp: new Date(t[2]),
        orderId: t[3].toString(),
      }));
    } catch (error) {
      console.error('Error fetching Bitfinex trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const wallets = await this.makeRequest<any[]>('/v2/auth/r/wallets');
      return wallets.map(w => ({
        exchange: 'bitfinex',
        currency: w[1],
        free: w[2],
        locked: w[4] || 0,
        total: w[2] + (w[4] || 0),
      })).filter(b => b.total > 0);
    } catch (error) {
      console.error('Error fetching Bitfinex balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const orders = await this.makeRequest<any[]>('/v2/auth/r/orders/hist', {});
      return orders.map(o => ({
        id: o[0].toString(),
        exchange: 'bitfinex',
        symbol: o[3].replace('t', ''),
        type: o[8],
        side: o[7] > 0 ? 'buy' : 'sell',
        price: o[16],
        quantity: Math.abs(o[7]),
        filled: Math.abs(o[7]) - Math.abs(o[6]),
        remaining: Math.abs(o[6]),
        status: o[13],
        timestamp: new Date(o[4]),
      }));
    } catch (error) {
      console.error('Error fetching Bitfinex orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> { return []; }
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> { return []; }
}
