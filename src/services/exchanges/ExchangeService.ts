import { BaseExchangeAdapter } from './BaseExchangeAdapter';
import type { ExchangeCredentials, Trade, Balance, Order, Deposit, Withdrawal } from './types';
import { BinanceAdapter } from './adapters/BinanceAdapter';
import { BybitAdapter } from './adapters/BybitAdapter';
import { CoinbaseAdapter } from './adapters/CoinbaseAdapter';
import { KrakenAdapter } from './adapters/KrakenAdapter';
import { BitfinexAdapter } from './adapters/BitfinexAdapter';
import { BingXAdapter } from './adapters/BingXAdapter';
import { MEXCAdapter } from './adapters/MEXCAdapter';
import { KuCoinAdapter } from './adapters/KuCoinAdapter';
import { OKXAdapter } from './adapters/OKXAdapter';
import { GateioAdapter } from './adapters/GateioAdapter';
import { BitstampAdapter } from './adapters/BitstampAdapter';

export const SUPPORTED_EXCHANGES = [
  'binance',
  'bybit',
  'coinbase',
  'kraken',
  'bitfinex',
  'bingx',
  'mexc',
  'kucoin',
  'okx',
  'gateio',
  'bitstamp',
] as const;

export type SupportedExchange = typeof SUPPORTED_EXCHANGES[number];

/**
 * Exchange Service
 * Manages adapters for all supported exchanges
 */
export class ExchangeService {
  private adapters: Map<string, BaseExchangeAdapter> = new Map();

  /**
   * Create an adapter instance for the specified exchange
   */
  private createAdapter(
    exchange: string,
    credentials: ExchangeCredentials
  ): BaseExchangeAdapter {
    const exchangeLower = exchange.toLowerCase();

    switch (exchangeLower) {
      case 'binance':
        return new BinanceAdapter(credentials);
      case 'bybit':
        return new BybitAdapter(credentials);
      case 'coinbase':
        return new CoinbaseAdapter(credentials);
      case 'kraken':
        return new KrakenAdapter(credentials);
      case 'bitfinex':
        return new BitfinexAdapter(credentials);
      case 'bingx':
        return new BingXAdapter(credentials);
      case 'mexc':
        return new MEXCAdapter(credentials);
      case 'kucoin':
        return new KuCoinAdapter(credentials);
      case 'okx':
        return new OKXAdapter(credentials);
      case 'gateio':
      case 'gate.io':
        return new GateioAdapter(credentials);
      case 'bitstamp':
        return new BitstampAdapter(credentials);
      default:
        throw new Error(`Unsupported exchange: ${exchange}`);
    }
  }

  /**
   * Initialize adapter for an exchange
   */
  async initializeExchange(
    exchange: string,
    credentials: ExchangeCredentials
  ): Promise<boolean> {
    try {
      const adapter = this.createAdapter(exchange, credentials);
      const isConnected = await adapter.testConnection();

      if (isConnected) {
        this.adapters.set(exchange.toLowerCase(), adapter);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Failed to initialize ${exchange}:`, error);
      return false;
    }
  }

  /**
   * Get adapter for a specific exchange
   */
  getAdapter(exchange: string): BaseExchangeAdapter | undefined {
    return this.adapters.get(exchange.toLowerCase());
  }

  /**
   * Check if exchange is supported
   */
  isSupported(exchange: string): boolean {
    return SUPPORTED_EXCHANGES.includes(exchange.toLowerCase() as any);
  }

  /**
   * Get list of all supported exchanges
   */
  getSupportedExchanges(): string[] {
    return [...SUPPORTED_EXCHANGES];
  }

  /**
   * Sync all data for an exchange
   */
  async syncExchange(
    exchange: string,
    options?: {
      syncTrades?: boolean;
      syncBalances?: boolean;
      syncOrders?: boolean;
      syncDeposits?: boolean;
      syncWithdrawals?: boolean;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    success: boolean;
    trades?: Trade[];
    balances?: Balance[];
    orders?: Order[];
    deposits?: Deposit[];
    withdrawals?: Withdrawal[];
    error?: string;
  }> {
    const adapter = this.getAdapter(exchange);

    if (!adapter) {
      return {
        success: false,
        error: `Exchange ${exchange} not initialized`,
      };
    }

    try {
      const result: any = { success: true };

      // Sync trades
      if (options?.syncTrades !== false) {
        result.trades = await adapter.fetchTrades({
          startTime: options?.startDate,
          endTime: options?.endDate,
        });
      }

      // Sync balances
      if (options?.syncBalances !== false) {
        result.balances = await adapter.fetchBalances();
      }

      // Sync orders
      if (options?.syncOrders !== false) {
        result.orders = await adapter.fetchOrders({
          startTime: options?.startDate,
          endTime: options?.endDate,
        });
      }

      // Sync deposits
      if (options?.syncDeposits !== false) {
        result.deposits = await adapter.fetchDeposits({
          startTime: options?.startDate,
          endTime: options?.endDate,
        });
      }

      // Sync withdrawals
      if (options?.syncWithdrawals !== false) {
        result.withdrawals = await adapter.fetchWithdrawals({
          startTime: options?.startDate,
          endTime: options?.endDate,
        });
      }

      return result;
    } catch (error) {
      console.error(`Error syncing ${exchange}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default ExchangeService;
