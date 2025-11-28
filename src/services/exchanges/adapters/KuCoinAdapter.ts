import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal, FetchOptions } from '../types';
import CryptoJS from 'crypto-js';

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

  private generateSignature(timestamp: string, method: string, endpoint: string, body: string = ''): string {
    const message = timestamp + method + endpoint + body;
    return CryptoJS.HmacSHA256(message, this.credentials.apiSecret).toString(CryptoJS.enc.Base64);
  }

  private async makeRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    await this.rateLimit();
    const timestamp = Date.now().toString();
    const bodyString = body ? JSON.stringify(body) : '';
    const signature = this.generateSignature(timestamp, method, endpoint, bodyString);
    
    const passphrase = this.credentials.apiPassphrase 
      ? CryptoJS.HmacSHA256(this.credentials.apiPassphrase, this.credentials.apiSecret).toString(CryptoJS.enc.Base64)
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
    try {
      const response = await this.makeRequest<{ items: any[] }>('/api/v1/orders');
      return response.items.map(o => ({
        id: o.id,
        exchange: 'kucoin',
        symbol: o.symbol.replace('-', '/'),
        type: o.type,
        side: o.side,
        price: parseFloat(o.price),
        quantity: parseFloat(o.size),
        filled: parseFloat(o.dealSize),
        remaining: parseFloat(o.size) - parseFloat(o.dealSize),
        status: o.isActive ? 'open' : 'closed',
        timestamp: new Date(o.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching KuCoin orders:', error);
      return [];
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    try {
      const response = await this.makeRequest<{ items: any[] }>('/api/v1/deposits');
      return response.items.map(d => ({
        id: d.id || d.walletTxId,
        exchange: 'kucoin',
        currency: d.currency,
        amount: parseFloat(d.amount),
        address: d.address,
        txId: d.walletTxId,
        status: d.status === 'SUCCESS' ? 'completed' : d.status === 'FAILURE' ? 'failed' : 'pending',
        timestamp: new Date(d.createdAt),
        network: d.chain,
      }));
    } catch (error) {
      console.error('Error fetching KuCoin deposits:', error);
      return [];
    }
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    try {
      const response = await this.makeRequest<{ items: any[] }>('/api/v1/withdrawals');
      return response.items.map(w => ({
        id: w.id,
        exchange: 'kucoin',
        currency: w.currency,
        amount: parseFloat(w.amount),
        address: w.address,
        txId: w.walletTxId,
        fee: parseFloat(w.fee),
        status: w.status === 'SUCCESS' ? 'completed' : w.status === 'FAILURE' ? 'failed' : 'pending',
        timestamp: new Date(w.createdAt),
        network: w.chain,
      }));
    } catch (error) {
      console.error('Error fetching KuCoin withdrawals:', error);
      return [];
    }
  }
}
