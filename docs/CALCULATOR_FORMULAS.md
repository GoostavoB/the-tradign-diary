# Trading Calculator Formulas Reference

## Overview
This document provides a comprehensive reference for all mathematical formulas used in The Trading Diary calculators. All formulas are validated and tested.

---

## Core Concepts

### Notation
- **P_entry**: Entry price
- **P_stop**: Stop loss price
- **P_liq**: Liquidation price
- **L**: Leverage multiplier (e.g., 10 for 10x)
- **δ (delta)**: Stop loss distance as decimal (e.g., 0.02 for 2%)
- **B**: Liquidation buffer as decimal (e.g., 0.005 for 0.5%)
- **Q**: Position size
- **R**: Risk amount

---

## Stop Loss Calculations

### 1. Stop Distance Percentage
Calculate the percentage distance between entry and stop:

```
δ = |P_entry - P_stop| / P_entry × 100
```

**Example:**
- Entry: $50,000
- Stop: $49,000
- δ = |50,000 - 49,000| / 50,000 × 100 = **2%**

**Code:** `stopPercentFromPrices()`

---

### 2. Stop Price from Percentage
Calculate stop price from percentage distance:

**Long Position:**
```
P_stop = P_entry × (1 - δ)
```

**Short Position:**
```
P_stop = P_entry × (1 + δ)
```

**Example (Long):**
- Entry: $50,000
- δ: 2% (0.02)
- P_stop = 50,000 × (1 - 0.02) = **$49,000**

**Code:** `stopPriceFromPercent()`

---

## Leverage Calculations

### 3. Maximum Safe Leverage
The fundamental formula for calculating maximum safe leverage:

```
L* = 1 / (δ + B)
```

Where:
- **L***: Theoretical maximum leverage
- **δ**: Stop distance as decimal
- **B**: Liquidation buffer as decimal

The result is then:
1. Rounded down to the nearest available leverage step
2. Capped at the exchange's maximum leverage

**Example:**
- Stop distance: 2% (0.02)
- Buffer: 0.5% (0.005)
- L* = 1 / (0.02 + 0.005) = 1 / 0.025 = **40x**

**Available Steps:** [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 75, 80, 90, 100]

**Code:** `maxLeverageFromStopPercent()`

---

### 4. Liquidation Price
Approximate liquidation price calculation:

**Step 1 - Calculate liquidation distance:**
```
d_liq = max(1/L - B, 0)
```

**Step 2 - Calculate liquidation price:**

**Long Position:**
```
P_liq = P_entry × (1 - d_liq)
```

**Short Position:**
```
P_liq = P_entry × (1 + d_liq)
```

**Example (Long, 10x leverage):**
- Entry: $50,000
- Leverage: 10x
- Buffer: 0.5% (0.005)
- d_liq = 1/10 - 0.005 = 0.095 (9.5%)
- P_liq = 50,000 × (1 - 0.095) = **$45,250**

**Code:** `liquidationPriceApprox()`

---

### 5. Safety Margin
The "cushion" between stop loss and liquidation:

**Long Position:**
```
margin% = (P_stop - P_liq) / P_entry × 100
```

**Short Position:**
```
margin% = (P_liq - P_stop) / P_entry × 100
```

**Example (Long):**
- Entry: $50,000
- Stop: $49,000
- Liquidation: $48,000
- margin% = (49,000 - 48,000) / 50,000 × 100 = **2%**

**Interpretation:**
- **≥ 0.75%**: Safe (Low risk with L ≤ 20)
- **0.25% - 0.75%**: Moderate
- **< 0.25%**: Dangerous (High risk)

**Code:** `safetyMarginPercent()`

---

## Risk Calculations

### 6. Risk Amount from Quote Size
Calculate risk when position size is in quote currency (e.g., USDT):

```
Risk = |P_entry - P_stop| × (Quote_Size / P_entry)
```

**Example:**
- Entry: $50,000
- Stop: $49,000
- Position: $1,000 USDT
- Base quantity = 1,000 / 50,000 = 0.02 BTC
- Risk = |50,000 - 49,000| × 0.02 = **$20**

**Code:** `riskValueQuote()`

---

### 7. Risk Amount from Base Quantity
Calculate risk when position size is in base currency (e.g., BTC):

```
Risk = |P_entry - P_stop| × Base_Quantity
```

**Example:**
- Entry: $50,000
- Stop: $49,000
- Position: 0.1 BTC
- Risk = |50,000 - 49,000| × 0.1 = **$100**

**Code:** `riskValueBase()`

---

### 8. Position Size from Risk Amount
Calculate position size to achieve target risk:

**From Account Risk Percentage:**
```
Risk_Amount = Account_Balance × (Risk_% / 100)
Position_Size = Risk_Amount / |P_entry - P_stop|
```

**Example:**
- Account: $10,000
- Risk: 2%
- Entry: $50,000
- Stop: $49,000
- Risk_Amount = 10,000 × 0.02 = $200
- Position_Size = 200 / |50,000 - 49,000| = 200 / 1,000 = **0.2 BTC**

**Code:** `StopLossCalculator` component

---

## Risk Classification

### 9. Risk Level Determination
Classification based on leverage and safety margin:

```
IF (L ≤ 20 AND margin ≥ 0.75%) THEN "Low"
ELSE IF (L > 50 OR margin < 0.25%) THEN "High"
ELSE "Medium"
```

**Examples:**
- L = 10x, margin = 1.5% → **Low Risk** ✅
- L = 60x, margin = 1.0% → **High Risk** ⚠️
- L = 25x, margin = 0.5% → **Medium Risk** ⚡

**Code:** `riskLevelFrom()`

---

## Risk/Reward Calculations

### 10. Risk/Reward Ratio
Compare potential loss vs. potential gain:

```
Risk = |P_entry - P_stop|
Reward = |P_target - P_entry|
R:R Ratio = Reward / Risk
```

**Example:**
- Entry: $50,000
- Stop: $49,000 (Risk = $1,000)
- Target: $52,000 (Reward = $2,000)
- R:R = 2,000 / 1,000 = **2:1**

**Best Practices:**
- Minimum R:R: **1.5:1**
- Good R:R: **2:1** or higher
- Excellent R:R: **3:1** or higher

---

### 11. Breakeven Price (with fees)
Calculate the price needed to break even after fees:

**Long Position:**
```
P_breakeven = P_entry × (1 + Total_Fee_Rate)
```

**Short Position:**
```
P_breakeven = P_entry × (1 - Total_Fee_Rate)
```

**Example (Long with 0.1% fees):**
- Entry: $50,000
- Entry fee: 0.05%
- Exit fee: 0.05%
- Total fee: 0.1% (0.001)
- P_breakeven = 50,000 × 1.001 = **$50,050**

---

## Position Value Calculations

### 12. Position Value (Notional)
Calculate total position value with leverage:

```
Position_Value = Position_Size × P_entry
Notional_Value = Position_Value × L
```

**Example:**
- Position: 0.1 BTC
- Entry: $50,000
- Leverage: 10x
- Position_Value = 0.1 × 50,000 = **$5,000**
- Notional_Value = 5,000 × 10 = **$50,000**

---

### 13. Required Margin
Calculate the margin needed to open a position:

```
Margin = Position_Value / L
```

**Example:**
- Position Value: $5,000
- Leverage: 10x
- Margin = 5,000 / 10 = **$500**

---

## Validation Rules

### Input Validation
1. **Entry Price**: Must be > 0
2. **Stop Price**: Must be > 0 and ≠ entry
3. **Stop Direction**:
   - Long: Stop < Entry
   - Short: Stop > Entry
4. **Leverage**: Must be in available steps [1-100]
5. **Account Balance**: Must be > 0
6. **Risk %**: Typically 0.1% - 10%

### Warning Thresholds
- **High Risk Warning**: Risk > 3% of account
- **Excessive Leverage**: L > safe maximum
- **Tight Safety Margin**: Margin < 0.25%
- **Wide Stop**: δ > 10%

---

## Practical Examples

### Conservative Trade
```
Account: $10,000
Risk: 1% ($100)
Entry: $50,000
Stop: 2% ($49,000)
→ Position: 0.1 BTC
→ Max Leverage: 40x (use 10x for safety)
→ Risk Level: Low
```

### Moderate Trade
```
Account: $10,000
Risk: 2% ($200)
Entry: $50,000
Stop: 1% ($49,500)
→ Position: 0.4 BTC
→ Max Leverage: 66x (use 25x)
→ Risk Level: Medium
```

### Aggressive Trade
```
Account: $10,000
Risk: 3% ($300)
Entry: $50,000
Stop: 0.5% ($49,750)
→ Position: 1.2 BTC
→ Max Leverage: 100x (use 50x)
→ Risk Level: High ⚠️
```

---

## References & Sources

1. **Leverage Formula**: Standard futures trading mathematics
2. **Liquidation Calculation**: Simplified model (exchanges vary)
3. **Risk Management**: Industry best practices
4. **Buffer Values**: Typical exchange maintenance margins

**Note:** These are approximations. Always verify with your specific exchange's liquidation engine and fee structure.

---

## Formula Testing

All formulas are unit-tested in `src/utils/__tests__/leverageCalculations.test.ts`

Run tests:
```bash
npm test leverageCalculations
```

---

## Updates & Maintenance

**Last Updated:** 2025-10-25  
**Version:** 1.0  
**Maintained by:** Trading Diary Development Team

For questions or formula suggestions, please open an issue.
