import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

export class MEXCAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.mexc.com';
  protected name = 'MEXC';
  protected rateLimitDelay = 100;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateSignature(queryString: string): string {
    return CryptoJS.HmacSHA256(queryString, this.credentials.apiSecret).toString();
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    await this.rateLimit();
    const timestamp = Date.now();
    const allParams = { ...params, timestamp };
    const queryString = new URLSearchParams(allParams as any).toString();
    const signature = this.generateSignature(queryString);
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;

    const response = await fetch(url, {
      headers: { 'X-MEXC-APIKEY': this.credentials.apiKey },
    });

    if (!response.ok) {
      throw new Error(`MEXC API Error: ${response.status}`);
    }
    return await response.json();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('/api/v3/account');
      return true;
    } catch { return false; }
  }

  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const trades = await this.makeRequest<any[]>('/api/v3/myTrades', {});
      return trades.map(t => ({
        id: t.id.toString(),
        exchange: 'mexc',
        symbol: t.symbol.replace(/([A-Z]+)(USDT|BTC|ETH)$/, '$1/$2'),
        side: t.isBuyer ? 'buy' : 'sell',
        price: parseFloat(t.price),
        quantity: parseFloat(t.qty),
        fee: parseFloat(t.commission),
        feeCurrency: t.commissionAsset,
        timestamp: new Date(t.time),
        orderId: t.orderId.toString(),
        role: t.isMaker ? 'maker' : 'taker',
      }));
    } catch (error) {
      console.error('Error fetching MEXC trades:', error);
      return [];
    }
  }

  async fetchBalances(): Promise<Balance[]> {
    try {
      const account = await this.makeRequest<{ balances: any[] }>('/api/v3/account');
      return account.balances
        .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map(b => ({
          exchange: 'mexc',
          currency: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked),
        }));
    } catch (error) {
      console.error('Error fetching MEXC balances:', error);
      return [];
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const orders = await this.makeRequest<any[]>('/api/v3/openOrders', {});
      return orders.map(o => ({
        id: o.orderId.toString(),
        exchange: 'mexc',
        symbol: o.symbol.replace(/([A-Z]+)(USDT|BTC|ETH)$/, '$1/$2'),
        type: o.type.toLowerCase(),
        side: o.side.toLowerCase(),
        price: parseFloat(o.price),
        quantity: parseFloat(o.origQty),
        filled: parseFloat(o.executedQty),
        remaining: parseFloat(o.origQty) - parseFloat(o.executedQty),
        status: o.status === 'NEW' ? 'open' : o.status === 'FILLED' ? 'closed' : 'cancelled',
        timestamp: new Date(o.time),
      }));
    } catch (error) {
      console.error('Error fetching MEXC orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> { return []; }
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> { return []; }
}
