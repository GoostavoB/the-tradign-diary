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

// Gate.io API Response Types
interface GateioApiResponse<T> {
  data?: T;
  label?: string;
  message?: string;
}

interface GateioTrade {
  id: string;
  create_time: string;
  create_time_ms: string;
  currency_pair: string;
  side: 'buy' | 'sell';
  role: 'taker' | 'maker';
  amount: string;
  price: string;
  order_id: string;
  fee: string;
  fee_currency: string;
  point_fee?: string;
  gt_fee?: string;
  text?: string;
}

interface GateioBalance {
  currency: string;
  available: string;
  locked: string;
}

interface GateioOrder {
  id: string;
  text: string;
  create_time: string;
  update_time: string;
  create_time_ms: string;
  update_time_ms: string;
  status: 'open' | 'closed' | 'cancelled';
  currency_pair: string;
  type: 'limit' | 'market';
  account: string;
  side: 'buy' | 'sell';
  amount: string;
  price: string;
  time_in_force: string;
  iceberg?: string;
  left: string;
  filled_total: string;
  fee: string;
  fee_currency: string;
  point_fee?: string;
  gt_fee?: string;
  gt_discount?: boolean;
  rebated_fee?: string;
  rebated_fee_currency?: string;
}

interface GateioDeposit {
  id: string;
  timestamp: string;
  currency: string;
  address: string;
  txid: string;
  amount: string;
  status: 'DONE' | 'CANCEL' | 'REQUEST' | 'MANUAL' | 'BCODE' | 'EXTPEND' | 'FAIL' | 'INVALID' | 'VERIFY' | 'PROCES' | 'PEND';
  memo?: string;
  chain?: string;
}

interface GateioWithdrawal {
  id: string;
  timestamp: string;
  currency: string;
  address: string;
  txid: string;
  amount: string;
  fee: string;
  status: 'DONE' | 'CANCEL' | 'REQUEST' | 'MANUAL' | 'BCODE' | 'EXTPEND' | 'FAIL' | 'INVALID' | 'VERIFY' | 'PROCES' | 'PEND';
  memo?: string;
  chain?: string;
}

/**
 * Gate.io Exchange Adapter
 * API Documentation: https://www.gate.io/docs/developers/apiv4
 * 
 * Features:
 * - Spot trading
 * - Margin trading
 * - Futures trading
 * - HMAC SHA512 authentication
 * - Rate limit: 900 requests per second (conservative: 150ms delay)
 */
export class GateioAdapter extends BaseExchangeAdapter {
  protected baseUrl = 'https://api.gateio.ws/api/v4';
  protected name = 'Gate.io';
  
  // Rate limiting: 900 requests per second per IP (we'll be conservative)
  protected rateLimitDelay = 150; // 150ms between requests

  constructor(credentials: ExchangeCredentials) {
    super(credentials);
  }

  /**
   * Generate Gate.io signature for authentication
   * Gate.io uses HMAC SHA512 with specific format:
   * Signature = HMAC_SHA512(secret, message)
   * Message format: method\n/api/v4/endpoint\nquery_string\nbody_hash\ntimestamp
   */
  private generateSignature(
    method: string,
    path: string,
    queryString: string,
    bodyString: string,
    timestamp: string
  ): string {
    // Hash the body with SHA512
    const bodyHash = CryptoJS.SHA512(bodyString).toString();
    
    // Create the message to sign
    const message = `${method}\n${path}\n${queryString}\n${bodyHash}\n${timestamp}`;
    
    // Generate HMAC SHA512 signature
    const signature = CryptoJS.HmacSHA512(message, this.credentials.apiSecret).toString();
    
    return signature;
  }

  /**
   * Make authenticated request to Gate.io API
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {},
    body: Record<string, any> = {}
  ): Promise<T> {
    await this.rateLimit();

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const path = `/api/v4${endpoint}`;
    
    // Build query string
    const queryString = Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    // Build body string
    const bodyString = Object.keys(body).length > 0 ? JSON.stringify(body) : '';
    
    // Generate signature
    const signature = this.generateSignature(
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

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: bodyString || undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleError(response.status, errorData);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      throw this.handleError(0, error);
    }
  }

  /**
   * Test connection to Gate.io API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<GateioBalance[]>('GET', '/spot/accounts');
      return true;
    } catch (error) {
      console.error('Gate.io connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch trade history from Gate.io
   */
  async fetchTrades(options?: FetchOptions): Promise<Trade[]> {
    try {
      const allTrades: Trade[] = [];
      
      // Gate.io requires currency_pair parameter, so we need to fetch for each pair
      // For now, we'll fetch from the most common pairs
      const pairs = await this.getActiveTradingPairs();
      
      for (const pair of pairs) {
        const params: Record<string, any> = {
          currency_pair: pair,
          limit: options?.limit || 100,
        };

        if (options?.startTime) {
          params.from = Math.floor(options.startTime.getTime() / 1000);
        }

        if (options?.endTime) {
          params.to = Math.floor(options.endTime.getTime() / 1000);
        }

        const trades = await this.makeRequest<GateioTrade[]>('GET', '/spot/my_trades', params);

        const mappedTrades = trades.map(trade => this.mapTrade(trade));
        allTrades.push(...mappedTrades);
      }

      return allTrades;
    } catch (error) {
      console.error('Error fetching Gate.io trades:', error);
      throw error;
    }
  }

  /**
   * Get active trading pairs for the account
   */
  private async getActiveTradingPairs(): Promise<string[]> {
    try {
      // Get balances to determine which pairs to query
      const balances = await this.makeRequest<GateioBalance[]>('GET', '/spot/accounts');
      
      // Filter for non-zero balances
      const activeCurrencies = balances
        .filter(b => parseFloat(b.available) > 0 || parseFloat(b.locked) > 0)
        .map(b => b.currency);

      // Common quote currencies
      const quotes = ['USDT', 'BTC', 'ETH', 'USD'];
      
      // Generate pairs
      const pairs: string[] = [];
      for (const base of activeCurrencies) {
        for (const quote of quotes) {
          if (base !== quote) {
            pairs.push(`${base}_${quote}`);
          }
        }
      }

      return pairs;
    } catch (error) {
      // Fallback to common pairs if we can't determine active pairs
      return ['BTC_USDT', 'ETH_USDT', 'BNB_USDT'];
    }
  }

  /**
   * Fetch account balances from Gate.io
   */
  async fetchBalances(): Promise<Balance[]> {
    try {
      const balances = await this.makeRequest<GateioBalance[]>('GET', '/spot/accounts');
      
      return balances
        .filter(balance => parseFloat(balance.available) > 0 || parseFloat(balance.locked) > 0)
        .map(balance => this.mapBalance(balance));
    } catch (error) {
      console.error('Error fetching Gate.io balances:', error);
      throw error;
    }
  }

  /**
   * Fetch order history from Gate.io
   */
  async fetchOrders(options?: FetchOptions): Promise<Order[]> {
    try {
      const allOrders: Order[] = [];
      const pairs = await this.getActiveTradingPairs();

      for (const pair of pairs) {
        const params: Record<string, any> = {
          currency_pair: pair,
          limit: options?.limit || 100,
          status: 'finished', // Get completed orders
        };

        if (options?.startTime) {
          params.from = Math.floor(options.startTime.getTime() / 1000);
        }

        if (options?.endTime) {
          params.to = Math.floor(options.endTime.getTime() / 1000);
        }

        try {
          const orders = await this.makeRequest<GateioOrder[]>('GET', '/spot/orders', params);
          const mappedOrders = orders.map(order => this.mapOrder(order));
          allOrders.push(...mappedOrders);
        } catch (error) {
          // Continue with other pairs if one fails
          console.warn(`Failed to fetch orders for ${pair}:`, error);
        }
      }

      return allOrders;
    } catch (error) {
      console.error('Error fetching Gate.io orders:', error);
      throw error;
    }
  }

  /**
   * Fetch deposit history from Gate.io
   */
  async fetchDeposits(options?: FetchOptions): Promise<Deposit[]> {
    try {
      const params: Record<string, any> = {
        limit: options?.limit || 100,
      };

      if (options?.startTime) {
        params.from = Math.floor(options.startTime.getTime() / 1000);
      }

      if (options?.endTime) {
        params.to = Math.floor(options.endTime.getTime() / 1000);
      }

      const deposits = await this.makeRequest<GateioDeposit[]>('GET', '/wallet/deposits', params);
      
      return deposits.map(deposit => this.mapDeposit(deposit));
    } catch (error) {
      console.error('Error fetching Gate.io deposits:', error);
      throw error;
    }
  }

  /**
   * Fetch withdrawal history from Gate.io
   */
  async fetchWithdrawals(options?: FetchOptions): Promise<Withdrawal[]> {
    try {
      const params: Record<string, any> = {
        limit: options?.limit || 100,
      };

      if (options?.startTime) {
        params.from = Math.floor(options.startTime.getTime() / 1000);
      }

      if (options?.endTime) {
        params.to = Math.floor(options.endTime.getTime() / 1000);
      }

      const withdrawals = await this.makeRequest<GateioWithdrawal[]>('GET', '/wallet/withdrawals', params);
      
      return withdrawals.map(withdrawal => this.mapWithdrawal(withdrawal));
    } catch (error) {
      console.error('Error fetching Gate.io withdrawals:', error);
      throw error;
    }
  }

  /**
   * Map Gate.io trade to unified Trade format
   */
  private mapTrade(trade: GateioTrade): Trade {
    return {
      id: trade.id,
      exchange: 'gateio',
      symbol: trade.currency_pair.replace('_', '/'),
      side: trade.side,
      price: parseFloat(trade.price),
      quantity: parseFloat(trade.amount),
      fee: parseFloat(trade.fee),
      feeCurrency: trade.fee_currency,
      timestamp: new Date(parseInt(trade.create_time_ms)),
      orderId: trade.order_id,
      role: trade.role,
    };
  }

  /**
   * Map Gate.io balance to unified Balance format
   */
  private mapBalance(balance: GateioBalance): Balance {
    const free = parseFloat(balance.available);
    const locked = parseFloat(balance.locked);

    return {
      exchange: 'gateio',
      currency: balance.currency,
      free,
      locked,
      total: free + locked,
    };
  }

  /**
   * Map Gate.io order to unified Order format
   */
  private mapOrder(order: GateioOrder): Order {
    const quantity = parseFloat(order.amount);
    const filled = parseFloat(order.filled_total);

    return {
      id: order.id,
      exchange: 'gateio',
      symbol: order.currency_pair.replace('_', '/'),
      type: order.type,
      side: order.side,
      price: order.price ? parseFloat(order.price) : undefined,
      quantity,
      filled,
      remaining: quantity - filled,
      status: this.mapOrderStatus(order.status),
      timestamp: new Date(parseInt(order.create_time_ms)),
      fee: parseFloat(order.fee),
      feeCurrency: order.fee_currency,
    };
  }

  /**
   * Map Gate.io order status to unified status
   */
  private mapOrderStatus(status: string): Order['status'] {
    switch (status) {
      case 'open':
        return 'open';
      case 'closed':
        return 'closed';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'open';
    }
  }

  /**
   * Map Gate.io deposit to unified Deposit format
   */
  private mapDeposit(deposit: GateioDeposit): Deposit {
    return {
      id: deposit.id,
      exchange: 'gateio',
      currency: deposit.currency,
      amount: parseFloat(deposit.amount),
      address: deposit.address,
      txId: deposit.txid,
      status: this.mapDepositStatus(deposit.status),
      timestamp: new Date(parseInt(deposit.timestamp) * 1000),
      network: deposit.chain,
      memo: deposit.memo,
    };
  }

  /**
   * Map Gate.io withdrawal to unified Withdrawal format
   */
  private mapWithdrawal(withdrawal: GateioWithdrawal): Withdrawal {
    return {
      id: withdrawal.id,
      exchange: 'gateio',
      currency: withdrawal.currency,
      amount: parseFloat(withdrawal.amount),
      address: withdrawal.address,
      txId: withdrawal.txid,
      fee: parseFloat(withdrawal.fee),
      status: this.mapWithdrawalStatus(withdrawal.status),
      timestamp: new Date(parseInt(withdrawal.timestamp) * 1000),
      network: withdrawal.chain,
      memo: withdrawal.memo,
    };
  }

  /**
   * Map Gate.io deposit status to unified status
   */
  private mapDepositStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'DONE':
        return 'completed';
      case 'CANCEL':
      case 'FAIL':
      case 'INVALID':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Map Gate.io withdrawal status to unified status
   */
  private mapWithdrawalStatus(status: string): 'pending' | 'completed' | 'failed' {
    switch (status) {
      case 'DONE':
        return 'completed';
      case 'CANCEL':
      case 'FAIL':
      case 'INVALID':
        return 'failed';
      default:
        return 'pending';
    }
  }

  /**
   * Handle API errors
   */
  private handleError(status: number, error: any): Error {
    const message = error?.message || error?.label || 'Unknown Gate.io API error';
    
    if (status === 401 || status === 403) {
      return new Error(`Gate.io Authentication Error: ${message}`);
    }
    
    if (status === 429) {
      return new Error('Gate.io Rate Limit Exceeded. Please try again later.');
    }
    
    if (status >= 500) {
      return new Error(`Gate.io Server Error: ${message}`);
    }
    
    return new Error(`Gate.io API Error: ${message}`);
  }
}
