/**
 * Exchange Adapters Index
 * Exports all available exchange adapters for The Trading Diary
 * 
 * Status: 11/11 Exchanges Complete ✓
 */

export { BinanceAdapter } from './adapters/BinanceAdapter';
export { BybitAdapter } from './adapters/BybitAdapter';
export { CoinbaseAdapter } from './adapters/CoinbaseAdapter';
export { KrakenAdapter } from './adapters/KrakenAdapter';
export { BitfinexAdapter } from './adapters/BitfinexAdapter';
export { BingXAdapter } from './adapters/BingXAdapter';
export { MEXCAdapter } from './adapters/MEXCAdapter';
export { KuCoinAdapter } from './adapters/KuCoinAdapter';
export { OKXAdapter } from './adapters/OKXAdapter';
export { GateioAdapter } from './adapters/GateioAdapter';
export { BitstampAdapter } from './adapters/BitstampAdapter';

export { BaseExchangeAdapter } from './BaseExchangeAdapter';
export { ExchangeService } from './ExchangeService';
export * from './types';

/**
 * Registry of all supported exchanges
 */
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
 * Exchange display information
 */
export const EXCHANGE_INFO: Record<SupportedExchange, {
  name: string;
  logo: string;
  requiresPassphrase: boolean;
  website: string;
  apiDocsUrl: string;
}> = {
  binance: {
    name: 'Binance',
    logo: '/logos/binance.svg',
    requiresPassphrase: false,
    website: 'https://www.binance.com',
    apiDocsUrl: 'https://binance-docs.github.io/apidocs/spot/en/',
  },
  bybit: {
    name: 'Bybit',
    logo: '/logos/bybit.svg',
    requiresPassphrase: false,
    website: 'https://www.bybit.com',
    apiDocsUrl: 'https://bybit-exchange.github.io/docs/v5/intro',
  },
  coinbase: {
    name: 'Coinbase',
    logo: '/logos/coinbase.svg',
    requiresPassphrase: false,
    website: 'https://www.coinbase.com',
    apiDocsUrl: 'https://docs.cloud.coinbase.com/exchange/docs',
  },
  kraken: {
    name: 'Kraken',
    logo: '/logos/kraken.svg',
    requiresPassphrase: false,
    website: 'https://www.kraken.com',
    apiDocsUrl: 'https://docs.kraken.com/rest/',
  },
  bitfinex: {
    name: 'Bitfinex',
    logo: '/logos/bitfinex.svg',
    requiresPassphrase: false,
    website: 'https://www.bitfinex.com',
    apiDocsUrl: 'https://docs.bitfinex.com/docs',
  },
  bingx: {
    name: 'BingX',
    logo: '/logos/bingx.svg',
    requiresPassphrase: false,
    website: 'https://bingx.com',
    apiDocsUrl: 'https://bingx-api.github.io/docs/',
  },
  mexc: {
    name: 'MEXC',
    logo: '/logos/mexc.svg',
    requiresPassphrase: false,
    website: 'https://www.mexc.com',
    apiDocsUrl: 'https://mexcdevelop.github.io/apidocs/',
  },
  kucoin: {
    name: 'KuCoin',
    logo: '/logos/kucoin.svg',
    requiresPassphrase: true,
    website: 'https://www.kucoin.com',
    apiDocsUrl: 'https://docs.kucoin.com/',
  },
  okx: {
    name: 'OKX',
    logo: '/logos/okx.svg',
    requiresPassphrase: true,
    website: 'https://www.okx.com',
    apiDocsUrl: 'https://www.okx.com/docs-v5/en/',
  },
  gateio: {
    name: 'Gate.io',
    logo: '/logos/gateio.svg',
    requiresPassphrase: false,
    website: 'https://www.gate.io',
    apiDocsUrl: 'https://www.gate.io/docs/developers/apiv4',
  },
  bitstamp: {
    name: 'Bitstamp',
    logo: '/logos/bitstamp.svg',
    requiresPassphrase: true, // Uses Customer ID
    website: 'https://www.bitstamp.net',
    apiDocsUrl: 'https://www.bitstamp.net/api/',
  },
};
