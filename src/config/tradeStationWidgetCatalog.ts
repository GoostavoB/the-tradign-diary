import { AlertCircle, Calculator, Target, Lock, TrendingUp } from 'lucide-react';
import { WidgetConfig } from '@/types/widget';
import { ErrorReflectionWidget } from '@/components/trade-station/ErrorReflectionWidget';
import { RiskCalculatorV2Widget } from '@/components/trade-station/RiskCalculatorV2Widget';
import { TradeStationRollingTarget } from '@/components/trade-station/TradeStationRollingTarget';
import { DailyLossLockStatus } from '@/components/trade-station/DailyLossLockStatus';
import { SimpleLeverageWidget } from '@/components/trade-station/SimpleLeverageWidget';
// Import ALL widgets from main catalog to make them available in Trade Station
import { WIDGET_CATALOG } from './widgetCatalog';

// Trade Station specific widgets
const TRADE_STATION_SPECIFIC_WIDGETS: Record<string, WidgetConfig> = {
  errorReflection: {
    id: 'errorReflection',
    title: 'Error Reflection',
    description: 'Track and reflect on trading mistakes',
    category: 'trading',
    icon: AlertCircle,
    defaultSize: 'medium',
    component: ErrorReflectionWidget,
  },
  riskCalculator: {
    id: 'riskCalculator',
    title: 'Risk Calculator',
    description: 'Calculate position size and risk',
    category: 'trading',
    icon: Calculator,
    defaultSize: 'medium',
    component: RiskCalculatorV2Widget,
  },
  rollingTarget: {
    id: 'rollingTarget',
    title: 'Rolling Target',
    description: 'Daily rolling profit targets',
    category: 'trading',
    icon: Target,
    defaultSize: 'large',
    component: TradeStationRollingTarget,
  },
  dailyLossLock: {
    id: 'dailyLossLock',
    title: 'Daily Loss Lock',
    description: 'Monitor daily loss limits',
    category: 'trading',
    icon: Lock,
    defaultSize: 'small',
    component: DailyLossLockStatus,
  },
  simpleLeverage: {
    id: 'simpleLeverage',
    title: 'Leverage Calculator',
    description: 'Simple leverage calculation',
    category: 'trading',
    icon: TrendingUp,
    defaultSize: 'small',
    component: SimpleLeverageWidget,
  },
};

// Merge Trade Station specific widgets with ALL main catalog widgets
// This allows users to add ANY widget to Trade Station
export const TRADE_STATION_WIDGET_CATALOG: Record<string, WidgetConfig> = {
  ...TRADE_STATION_SPECIFIC_WIDGETS,
  ...WIDGET_CATALOG,
};

export const DEFAULT_TRADE_STATION_LAYOUT = [
  'simpleLeverage',
  'riskCalculator',
  'errorReflection',
  'rollingTarget',
];
