import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trash2, TrendingUp, TrendingDown, Plus, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatNumber, formatPercent } from '@/utils/formatNumber';

interface CustomWidget {
  id: string;
  title: string;
  description: string;
  widget_type: string;
  query_config: any;
  display_config: any;
}

interface CustomWidgetRendererProps {
  widget: CustomWidget;
  onDelete?: () => void;
  showAddToDashboard?: boolean;
}

export const CustomWidgetRenderer = ({ widget, onDelete, showAddToDashboard = false }: CustomWidgetRendererProps) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToDashboard, setAddingToDashboard] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWidgetData();

    // Subscribe to real-time changes on trades table
    const channel = supabase
      .channel('custom-widget-trades')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
        },
        (payload) => {
          console.log('Trade change detected, refreshing widget data');
          fetchWidgetData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [widget]);

  const fetchWidgetData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { query_config } = widget;
      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Process data based on query config
      const processedData = processTradeData(trades || [], query_config);
      setData(processedData);
    } catch (error) {
      console.error('Error fetching widget data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load widget data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processTradeData = (trades: any[], config: any): any => {
    // NEW: If AI calculated the data, use it directly
    if (config.calculated_data) {
      return config.calculated_data;
    }
    if (config.calculated_value !== undefined) {
      return config.calculated_value;
    }

    // FALLBACK: Legacy processing for old widgets
    const { metric, aggregation, group_by, order, limit, filters } = config;

    // Apply filters
    let filteredTrades = trades;
    if (filters) {
      if (filters.trade_type) {
        filteredTrades = filteredTrades.filter(t => t.trade_type === filters.trade_type);
      }
      if (filters.date_range && filters.date_range !== 'all') {
        const now = new Date();
        const daysAgo = filters.date_range === 'last_7_days' ? 7 :
                        filters.date_range === 'last_30_days' ? 30 :
                        filters.date_range === 'last_90_days' ? 90 : 0;
        if (daysAgo > 0) {
          const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          filteredTrades = filteredTrades.filter(t => new Date(t.trade_date) >= cutoff);
        }
      }
    }

    if (group_by) {
      // Group data
      const grouped: Record<string, any[]> = filteredTrades.reduce((acc: Record<string, any[]>, trade: any) => {
        let key: string;
        
        // Handle special grouping cases
        if (group_by === 'hour_of_day') {
          const date = new Date(trade.trade_date);
          key = `${date.getHours()}:00`;
        } else if (group_by === 'day_of_week') {
          const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const date = new Date(trade.trade_date);
          key = days[date.getDay()];
        } else {
          key = trade[group_by] || 'Unknown';
        }
        
        if (!acc[key]) acc[key] = [];
        acc[key].push(trade);
        return acc;
      }, {});

      const result = Object.entries(grouped).map(([key, tradeGroup]) => {
        const value = calculateMetric(tradeGroup, config);
        return { 
          name: key, 
          value,
          count: tradeGroup.length,
          trades: tradeGroup
        };
      });

      // Sort
      const sorted = result.sort((a, b) => {
        if (order === 'asc') return a.value - b.value;
        return b.value - a.value;
      });

      // Apply limit
      return limit ? sorted.slice(0, limit) : sorted;
    } else {
      // Single metric
      return calculateMetric(filteredTrades, config);
    }
  };

  const calculateMetric = (trades: any[], config: any): number => {
    // NEW: Check if AI already calculated the value
    if (config.calculated_value !== undefined) {
      return config.calculated_value;
    }

    // FALLBACK: Legacy calculation for old widgets
    if (!trades || trades.length === 0) return 0;

    const { metric, aggregation } = config;

    switch (metric) {
      case 'roi':
        const avgROI = trades.reduce((sum, t) => sum + (t.roi || 0), 0) / trades.length;
        return aggregation === 'avg' ? avgROI : avgROI;
      case 'pnl':
        return trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      case 'win_rate':
        const wins = trades.filter(t => (t.pnl || 0) > 0).length;
        return (wins / trades.length) * 100;
      case 'count':
        return trades.length;
      default:
        return 0;
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('custom_dashboard_widgets')
        .delete()
        .eq('id', widget.id);

      if (error) throw error;

      toast({
        title: 'Widget Deleted',
        description: 'The widget has been removed from your dashboard',
      });

      onDelete?.();
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete widget',
        variant: 'destructive',
      });
    }
  };

  const handleAddToDashboard = async () => {
    try {
      setAddingToDashboard(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('layout_json')
        .eq('user_id', user.id)
        .single();

      // Handle both old format (direct array) and new format (object with positions)
      const layoutData = settings?.layout_json as any;
      let currentPositions: any[] = [];
      let columnCount = 3; // default
      
      if (Array.isArray(layoutData)) {
        // Legacy format: direct array
        currentPositions = layoutData;
      } else if (layoutData?.positions && Array.isArray(layoutData.positions)) {
        // New format: object with positions and columnCount
        currentPositions = layoutData.positions;
        columnCount = layoutData.columnCount || 3;
      }

      const newPosition = {
        id: `custom-${widget.id}`,
        column: 0,
        row: currentPositions.length > 0 ? Math.max(...currentPositions.map((p: any) => p.row)) + 1 : 0,
      };

      // Save in the new format (object with positions and columnCount)
      const updatedLayout = {
        positions: [...currentPositions, newPosition],
        columnCount: columnCount
      };

      await supabase
        .from('user_settings')
        .update({
          layout_json: updatedLayout as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      toast({
        title: 'Added to Dashboard',
        description: `"${widget.title}" has been added to your dashboard`,
      });
    } catch (error) {
      console.error('Error adding to dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to add widget to dashboard',
        variant: 'destructive',
      });
    } finally {
      setAddingToDashboard(false);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <Skeleton className="h-32" />
      </GlassCard>
    );
  }

  const renderMetricWidget = () => {
    const value = typeof data === 'number' ? data : 0;
    const format = widget.display_config?.format || 'number';
    const suffix = widget.display_config?.suffix || '';
    const decimals = widget.display_config?.decimals || 2;
    const isPositive = value > 0;
    const calculation = (widget.query_config as any)?.calculation;

    let displayValue = '';
    if (format === 'currency') {
      displayValue = `$${formatNumber(value)}${suffix}`;
    } else if (format === 'percent') {
      displayValue = formatPercent(value);
    } else if (format === 'decimal') {
      displayValue = `${value.toFixed(decimals)}${suffix}`;
    } else {
      displayValue = `${formatNumber(value)}${suffix}`;
    }

    return (
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-destructive" />
          )}
          <span className="text-3xl font-bold">
            {displayValue}
          </span>
        </div>
        
        {widget.description && (
          <p className="text-sm text-muted-foreground">{widget.description}</p>
        )}
        
        {/* NEW: Show AI's reasoning if available */}
        {calculation && (
          <details className="text-left mt-4 pt-3 border-t border-border">
            <summary className="text-xs font-medium cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              How was this calculated?
            </summary>
            <div className="mt-2 space-y-2 text-xs">
              <p className="font-medium text-foreground">{calculation.method}</p>
              
              {calculation.steps && (
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  {calculation.steps.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              )}
              
              {calculation.assumptions && calculation.assumptions.length > 0 && (
                <div className="pt-2">
                  <p className="font-medium text-foreground mb-1">Assumptions:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    {calculation.assumptions.map((assumption: string, i: number) => (
                      <li key={i}>{assumption}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    );
  };

  const renderChartWidget = () => {
    const chartData = Array.isArray(data) ? data : [];
    const colors = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

    if (widget.display_config?.chart_type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
          <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip />
          <Bar dataKey="value" fill="hsl(var(--primary))" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderTableWidget = () => {
    const tableData = Array.isArray(data) ? data : [];
    const format = widget.display_config?.format || 'number';
    const showRank = widget.display_config?.show_rank !== false;
    
    const formatValue = (val: number) => {
      if (format === 'currency') return `$${formatNumber(val)}`;
      if (format === 'percent') return formatPercent(val);
      return formatNumber(val);
    };
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {showRank && <th className="text-left p-2 text-sm font-medium w-12">#</th>}
              <th className="text-left p-2 text-sm font-medium">Item</th>
              <th className="text-right p-2 text-sm font-medium">Value</th>
              <th className="text-right p-2 text-sm font-medium">Trades</th>
            </tr>
          </thead>
          <tbody>
            {tableData.slice(0, 10).map((row, idx) => (
              <tr key={idx} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                {showRank && (
                  <td className="p-2 text-sm font-bold text-muted-foreground">
                    {idx + 1}
                  </td>
                )}
                <td className="p-2 text-sm font-medium">{row.name || 'Unknown'}</td>
                <td className="p-2 text-right font-bold text-sm">{formatValue(row.value)}</td>
                <td className="p-2 text-right text-sm text-muted-foreground">{row.count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tableData.length > 10 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing top 10 of {tableData.length} items
          </p>
        )}
      </div>
    );
  };

  return (
    <GlassCard className="p-6 relative group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{widget.title}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchWidgetData(true)}
            disabled={refreshing}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            title="Refresh widget data"
          >
            <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          {showAddToDashboard && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddToDashboard}
              disabled={addingToDashboard}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Plus className="h-4 w-4 text-primary" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {widget.widget_type === 'metric' && renderMetricWidget()}
      {widget.widget_type === 'chart' && renderChartWidget()}
      {widget.widget_type === 'table' && renderTableWidget()}
    </GlassCard>
  );
};