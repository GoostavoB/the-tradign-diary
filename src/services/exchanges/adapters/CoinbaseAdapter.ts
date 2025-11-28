import { BaseExchangeAdapter } from '../BaseExchangeAdapter';
import type { 
  ExchangeCredentials, 
  Trade, 
  Balance, 
  Order, 
  Deposit, 
  Withdrawal,
  FetchOptions 
} from '../types';
import CryptoJS from 'crypto-js';

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

interface CoinbaseOrder {
  order_id: string;
  product_id: string;
  user_id: string;
  order_configuration: any;
  side: string;
  client_order_id: string;
  status: string;
  time_in_force: string;
  created_time: string;
  completion_percentage: string;
  filled_size: string;
  average_filled_price: string;
  number_of_fills: string;
  filled_value: string;
  pending_cancel: boolean;
  size_in_quote: boolean;
  total_fees: string;
  size_inclusive_of_fees: boolean;
  total_value_after_fees: string;
  trigger_status: string;
  order_type: string;
  reject_reason: string;
  settled: boolean;
  product_type: string;
  reject_message: string;
  cancel_message: string;
}

export class CoinbaseAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.coinbase.com/api/v3/brokerage';
  protected name = 'Coinbase';
  protected rateLimitDelay = 150;

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  private generateJWT(requestPath: string, method: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const message = `${timestamp}${method}${requestPath}`;
    const signature = CryptoJS.HmacSHA256(message, this.credentials.apiSecret).toString();
    
    return Buffer.from(JSON.stringify({
      sub: this.credentials.apiKey,
      iss: 'coinbase-cloud',
      nbf: timestamp,
      exp: timestamp + 120,
      signature,
    })).toString('base64');
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any
  ): Promise<T> {
    await this.rateLimit();

    const requestPath = `/api/v3/brokerage${endpoint}`;
    const jwt = this.generateJWT(requestPath, method);
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleError(response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      throw this.handleError(0, error);
    }
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
      return response.fills.map(fill => this.mapTrade(fill));
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
        .map(account => this.mapBalance(account));
    } catch (error) {
      console.error('Error fetching Coinbase balances:', error);
      throw error;
    }
  }

  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const response = await this.makeRequest<{ orders: CoinbaseOrder[] }>('/orders/historical/batch');
      return response.orders.map(order => this.mapOrder(order));
    } catch (error) {
      console.error('Error fetching Coinbase orders:', error);
      throw error;
    }
  }

  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    return [];
  }

  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    return [];
  }

  private mapTrade(fill: CoinbaseFill): Trade {
    return {
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
    };
  }

  private mapBalance(account: CoinbaseAccount): Balance {
    const free = parseFloat(account.available_balance.value);
    const locked = parseFloat(account.hold.value);

    return {
      exchange: 'coinbase',
      currency: account.currency,
      free,
      locked,
      total: free + locked,
    };
  }

  private mapOrder(order: CoinbaseOrder): Order {
    const filled = parseFloat(order.filled_size || '0');
    const price = parseFloat(order.average_filled_price || '0');

    return {
      id: order.order_id,
      exchange: 'coinbase',
      symbol: order.product_id.replace('-', '/'),
      type: order.order_type.toLowerCase() as any,
      side: order.side.toLowerCase() as 'buy' | 'sell',
      price: price > 0 ? price : undefined,
      quantity: filled,
      filled,
      remaining: 0,
      status: this.mapOrderStatus(order.status),
      timestamp: new Date(order.created_time),
      fee: parseFloat(order.total_fees || '0'),
    };
  }

  private mapOrderStatus(status: string): Order['status'] {
    switch (status.toUpperCase()) {
      case 'OPEN':
        return 'open';
      case 'FILLED':
        return 'closed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'open';
    }
  }

  private handleError(status: number, error: any): Error {
    const message = error?.message || 'Unknown Coinbase API error';
    
    if (status === 401 || status === 403) {
      return new Error(`Coinbase Authentication Error: ${message}`);
    }
    
    if (status === 429) {
      return new Error('Coinbase Rate Limit Exceeded. Please try again later.');
    }
    
    return new Error(`Coinbase API Error: ${message}`);
  }
}
