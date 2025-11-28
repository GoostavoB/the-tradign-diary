import { getCategoryColor } from './categoryColors';

export interface CategoryHolding {
  category: string;
  value: number;
  weight: number;
  unrealizedPnL: number;
  realizedPnL: number;
  roi: number;
  change24h: number;
  change7d: number;
  change30d: number;
  assets: Array<{
    symbol: string;
    name: string;
    value: number;
    quantity: number;
  }>;
}

export interface CategoryTimeseriesPoint {
  date: string;
  timestamp: number;
  categories: Record<string, number>;
  total: number;
}

export interface PortfolioHolding {
  token_symbol: string;
  token_name: string;
  quantity: number;
  purchase_price: number | null;
  primary_category?: string;
  categories_json?: string[];
  currentPrice?: number;
  currentValue?: number;
  unrealizedPnL?: number;
  priceChange24h?: number;
  priceChange7d?: number;
  priceChange30d?: number;
}

/**
 * Aggregate portfolio holdings by category
 */
export function aggregatePortfolioByCategory(
  holdings: PortfolioHolding[],
  splitMode: boolean = false,
  isDarkMode: boolean = true
): CategoryHolding[] {
  const categoryMap = new Map<string, CategoryHolding>();

  holdings.forEach(holding => {
    const categories = splitMode && holding.categories_json?.length 
      ? holding.categories_json 
      : [holding.primary_category || 'Uncategorized'];

    const splitFactor = categories.length;
    const splitValue = (holding.currentValue || 0) / splitFactor;
    const splitPnL = (holding.unrealizedPnL || 0) / splitFactor;

    categories.forEach(category => {
      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          value: 0,
          weight: 0,
          unrealizedPnL: 0,
          realizedPnL: 0,
          roi: 0,
          change24h: 0,
          change7d: 0,
          change30d: 0,
          assets: []
        });
      }

      const cat = categoryMap.get(category)!;
      cat.value += splitValue;
      cat.unrealizedPnL += splitPnL;
      
      // Weighted price changes
      const weight = splitValue;
      cat.change24h += (holding.priceChange24h || 0) * weight;
      cat.change7d += (holding.priceChange7d || 0) * weight;
      cat.change30d += (holding.priceChange30d || 0) * weight;

      cat.assets.push({
        symbol: holding.token_symbol,
        name: holding.token_name,
        value: splitValue,
        quantity: holding.quantity / splitFactor
      });
    });
  });

  // Calculate weights and normalize percentage changes
  const totalValue = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.value, 0);

  const categories: CategoryHolding[] = Array.from(categoryMap.values()).map(cat => {
    const weight = totalValue > 0 ? (cat.value / totalValue) * 100 : 0;
    const costBasis = cat.value - cat.unrealizedPnL;
    const roi = costBasis > 0 ? (cat.unrealizedPnL / costBasis) * 100 : 0;

    // Normalize weighted percentage changes
    const change24h = cat.value > 0 ? (cat.change24h / cat.value) : 0;
    const change7d = cat.value > 0 ? (cat.change7d / cat.value) : 0;
    const change30d = cat.value > 0 ? (cat.change30d / cat.value) : 0;

    return {
      ...cat,
      weight,
      roi,
      change24h,
      change7d,
      change30d
    };
  });

  // Sort by value descending
  return categories.sort((a, b) => b.value - a.value);
}

/**
 * Generate category timeseries data
 */
export function calculateCategoryTimeseries(
  holdings: PortfolioHolding[],
  priceHistory: Map<string, Array<{ date: Date; price: number }>>,
  startDate: Date,
  endDate: Date,
  splitMode: boolean = false
): CategoryTimeseriesPoint[] {
  const points: CategoryTimeseriesPoint[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const categoryValues: Record<string, number> = {};
    let total = 0;

    holdings.forEach(holding => {
      const history = priceHistory.get(holding.token_symbol);
      if (!history) return;

      // Find price at this date
      const pricePoint = history.find(p => 
        p.date.toDateString() === currentDate.toDateString()
      );
      
      if (pricePoint) {
        const value = holding.quantity * pricePoint.price;
        const categories = splitMode && holding.categories_json?.length 
          ? holding.categories_json 
          : [holding.primary_category || 'Uncategorized'];

        const splitValue = value / categories.length;

        categories.forEach(category => {
          categoryValues[category] = (categoryValues[category] || 0) + splitValue;
          total += splitValue;
        });
      }
    });

    points.push({
      date: currentDate.toISOString().split('T')[0],
      timestamp: currentDate.getTime(),
      categories: categoryValues,
      total
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return points;
}

/**
 * Get category colors for chart
 */
export function getCategoryChartColors(
  categories: string[],
  isDarkMode: boolean = true
): Record<string, string> {
  const colors: Record<string, string> = {};
  
  categories.forEach(category => {
    colors[category] = getCategoryColor(category, isDarkMode);
  });

  return colors;
}
