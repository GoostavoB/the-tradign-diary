import { describe, it, expect } from 'vitest';
import {
  stopPercentFromPrices,
  stopPriceFromPercent,
  maxLeverageFromStopPercent,
  liquidationPriceApprox,
  safetyMarginPercent,
  riskValueQuote,
  riskValueBase,
  riskLevelFrom,
  calculateLeverageMetrics,
  roundDownToStep,
  LEVERAGE_STEPS,
} from '../leverageCalculations';

describe('leverageCalculations', () => {
  describe('stopPercentFromPrices', () => {
    it('calculates stop distance for long position', () => {
      const result = stopPercentFromPrices(50000, 49000);
      expect(result).toBeCloseTo(2, 2);
    });

    it('calculates stop distance for short position', () => {
      const result = stopPercentFromPrices(50000, 51000);
      expect(result).toBeCloseTo(2, 2);
    });

    it('handles zero stop distance', () => {
      const result = stopPercentFromPrices(50000, 50000);
      expect(result).toBe(0);
    });

    it('handles very small prices (crypto)', () => {
      const result = stopPercentFromPrices(0.0001, 0.000095);
      expect(result).toBeCloseTo(5, 2);
    });
  });

  describe('stopPriceFromPercent', () => {
    it('calculates stop price for long position', () => {
      const result = stopPriceFromPercent(50000, 2, 'long');
      expect(result).toBeCloseTo(49000, 0);
    });

    it('calculates stop price for short position', () => {
      const result = stopPriceFromPercent(50000, 2, 'short');
      expect(result).toBeCloseTo(51000, 0);
    });

    it('handles 0% stop distance', () => {
      const result = stopPriceFromPercent(50000, 0, 'long');
      expect(result).toBe(50000);
    });
  });

  describe('roundDownToStep', () => {
    it('rounds down to nearest leverage step', () => {
      expect(roundDownToStep(35, LEVERAGE_STEPS)).toBe(30);
      expect(roundDownToStep(22, LEVERAGE_STEPS)).toBe(20);
      expect(roundDownToStep(7, LEVERAGE_STEPS)).toBe(6);
    });

    it('returns exact match if available', () => {
      expect(roundDownToStep(25, LEVERAGE_STEPS)).toBe(25);
      expect(roundDownToStep(50, LEVERAGE_STEPS)).toBe(50);
    });

    it('returns minimum for values below range', () => {
      expect(roundDownToStep(0.5, LEVERAGE_STEPS)).toBe(1);
    });
  });

  describe('maxLeverageFromStopPercent', () => {
    it('calculates max safe leverage', () => {
      // 2% stop + 0.5% buffer = 2.5% total
      // L* = 1 / 0.025 = 40
      const result = maxLeverageFromStopPercent(2, 0.5, 100);
      expect(result).toBe(40);
    });

    it('respects leverage cap', () => {
      // 1% stop + 0.5% buffer = 1.5% total
      // L* = 1 / 0.015 = 66.67, but cap is 50
      const result = maxLeverageFromStopPercent(1, 0.5, 50);
      expect(result).toBe(50);
    });

    it('returns minimum 1x for wide stops', () => {
      const result = maxLeverageFromStopPercent(50, 0.5, 100);
      expect(result).toBe(1);
    });

    it('handles conservative 5% stop', () => {
      // 5% stop + 0.5% buffer = 5.5% total
      // L* = 1 / 0.055 = 18.18, rounds to 15
      const result = maxLeverageFromStopPercent(5, 0.5, 100);
      expect(result).toBe(15);
    });
  });

  describe('liquidationPriceApprox', () => {
    it('calculates liquidation for long with 10x leverage', () => {
      // dliq = 1/10 - 0.005 = 0.095 = 9.5%
      // P_liq = 50000 * (1 - 0.095) = 45250
      const result = liquidationPriceApprox(50000, 10, 0.5, 'long');
      expect(result).toBeCloseTo(45250, 0);
    });

    it('calculates liquidation for short with 10x leverage', () => {
      const result = liquidationPriceApprox(50000, 10, 0.5, 'short');
      expect(result).toBeCloseTo(54750, 0);
    });

    it('handles high leverage (100x)', () => {
      // dliq = 1/100 - 0.005 = 0.005 = 0.5%
      const result = liquidationPriceApprox(50000, 100, 0.5, 'long');
      expect(result).toBeCloseTo(49750, 0);
    });

    it('ensures liquidation distance is non-negative', () => {
      // With 1x leverage and 1% buffer, dliq would be negative
      const result = liquidationPriceApprox(50000, 1, 1, 'long');
      expect(result).toBe(50000); // Should clamp to entry
    });
  });

  describe('safetyMarginPercent', () => {
    it('calculates positive margin for long', () => {
      // Entry: 50000, Stop: 49000, Liq: 48000
      // Margin = (49000 - 48000) / 50000 * 100 = 2%
      const result = safetyMarginPercent(50000, 49000, 48000, 'long');
      expect(result).toBeCloseTo(2, 2);
    });

    it('calculates positive margin for short', () => {
      // Entry: 50000, Stop: 51000, Liq: 52000
      // Margin = (52000 - 51000) / 50000 * 100 = 2%
      const result = safetyMarginPercent(50000, 51000, 52000, 'short');
      expect(result).toBeCloseTo(2, 2);
    });

    it('calculates negative margin (risky scenario)', () => {
      // Stop beyond liquidation = negative margin
      const result = safetyMarginPercent(50000, 48000, 49000, 'long');
      expect(result).toBeCloseTo(-2, 2);
    });
  });

  describe('riskValueQuote', () => {
    it('calculates risk from quote size', () => {
      // Entry: 50000, Stop: 49000, Quote: 1000 USDT
      // Position: 1000/50000 = 0.02 BTC
      // Risk = |50000-49000| * 0.02 = 20 USDT
      const result = riskValueQuote(50000, 49000, 1000);
      expect(result).toBeCloseTo(20, 2);
    });

    it('handles larger position sizes', () => {
      const result = riskValueQuote(50000, 49000, 10000);
      expect(result).toBeCloseTo(200, 2);
    });
  });

  describe('riskValueBase', () => {
    it('calculates risk from base quantity', () => {
      // Entry: 50000, Stop: 49000, Base: 0.1 BTC
      // Risk = |50000-49000| * 0.1 = 100 USDT
      const result = riskValueBase(50000, 49000, 0.1);
      expect(result).toBeCloseTo(100, 2);
    });
  });

  describe('riskLevelFrom', () => {
    it('classifies as Low risk', () => {
      expect(riskLevelFrom(10, 1.5)).toBe('Low');
      expect(riskLevelFrom(20, 0.75)).toBe('Low');
    });

    it('classifies as High risk', () => {
      expect(riskLevelFrom(60, 1.0)).toBe('High');
      expect(riskLevelFrom(30, 0.2)).toBe('High');
    });

    it('classifies as Medium risk', () => {
      expect(riskLevelFrom(25, 0.5)).toBe('Medium');
      expect(riskLevelFrom(40, 0.3)).toBe('Medium');
    });
  });

  describe('calculateLeverageMetrics - Integration', () => {
    it('calculates complete metrics for valid long trade', () => {
      const result = calculateLeverageMetrics(
        50000, // entry
        49000, // stop (2% below)
        null, // auto leverage
        'long',
        0.5, // 0.5% buffer
        100, // max 100x
        1000, // $1000 position
        'quote'
      );

      expect(result.isValid).toBe(true);
      expect(result.deltaPct).toBeCloseTo(2, 1);
      expect(result.Lmax).toBe(40); // 1/(0.02+0.005) rounded
      expect(result.riskLevel).toBe('Medium');
      expect(result.riskValue).toBeCloseTo(20, 1);
      expect(result.warnings).toHaveLength(0);
    });

    it('warns when stop is on wrong side', () => {
      const result = calculateLeverageMetrics(
        50000,
        51000, // stop above entry for long = wrong
        null,
        'long',
        0.5,
        100,
        null,
        'quote'
      );

      expect(result.warnings).toContain('Stop should be below entry for long positions');
    });

    it('warns when desired leverage exceeds safe max', () => {
      const result = calculateLeverageMetrics(
        50000,
        49000, // 2% stop
        50, // desire 50x but max safe is 40x
        'long',
        0.5,
        100,
        null,
        'quote'
      );

      expect(result.warnings.some(w => w.includes('exceeds safe max'))).toBe(true);
      expect(result.Lmax).toBe(40);
    });

    it('handles invalid prices', () => {
      const result = calculateLeverageMetrics(
        0,
        49000,
        null,
        'long',
        0.5,
        100,
        null,
        'quote'
      );

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Invalid prices');
    });

    it('handles stop equal to entry', () => {
      const result = calculateLeverageMetrics(
        50000,
        50000,
        null,
        'long',
        0.5,
        100,
        null,
        'quote'
      );

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain('Stop cannot equal entry');
    });

    it('calculates correctly for short position', () => {
      const result = calculateLeverageMetrics(
        50000,
        51000, // 2% above for short
        null,
        'short',
        0.5,
        100,
        1000,
        'quote'
      );

      expect(result.isValid).toBe(true);
      expect(result.deltaPct).toBeCloseTo(2, 1);
      expect(result.Lmax).toBe(40);
    });
  });
});
