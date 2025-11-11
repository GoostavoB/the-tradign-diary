import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TradeStationWidgetPosition {
  id: string;
  x: number;      // horizontal position (0-11 in 12-col grid)
  y: number;      // vertical position
  w: number;      // width in grid columns (1-12)
  h: number;      // height in grid rows
  minW?: number;  // minimum width
  minH?: number;  // minimum height
  maxW?: number;  // maximum width (optional)
  maxH?: number;  // maximum height (optional)
  // Legacy support
  column?: number;
  row?: number;
}

interface TradeStationLayoutData {
  positions: TradeStationWidgetPosition[];
  columnCount: number;
  version?: number;
}

// Default sizes for each widget type
const WIDGET_DEFAULT_SIZES: Record<string, Pick<TradeStationWidgetPosition, 'w' | 'h' | 'minW' | 'minH' | 'maxW' | 'maxH'>> = {
  simpleLeverage: { w: 4, h: 3, minW: 3, minH: 2, maxW: 6 },
  riskCalculator: { w: 4, h: 3, minW: 3, minH: 2, maxW: 6 },
  errorReflection: { w: 4, h: 3, minW: 3, minH: 2, maxW: 6 },
  rollingTarget: { w: 12, h: 4, minW: 6, minH: 3, maxW: 12 },
};

// Default widgets for Trade Station (new format with x, y, w, h)
const DEFAULT_TRADE_STATION_POSITIONS: TradeStationWidgetPosition[] = [
  // Row 1: Leverage, Risk, Error Reflection
  { id: 'simpleLeverage', x: 0, y: 0, ...WIDGET_DEFAULT_SIZES.simpleLeverage },
  { id: 'riskCalculator', x: 4, y: 0, ...WIDGET_DEFAULT_SIZES.riskCalculator },
  { id: 'errorReflection', x: 8, y: 0, ...WIDGET_DEFAULT_SIZES.errorReflection },
  // Row 2: Rolling Target (spans all columns)
  { id: 'rollingTarget', x: 0, y: 3, ...WIDGET_DEFAULT_SIZES.rollingTarget },
];

const CURRENT_TRADE_STATION_LAYOUT_VERSION = 3;

export const useTradeStationLayout = (userId: string | undefined) => {
  const [positions, setPositions] = useState<TradeStationWidgetPosition[]>(DEFAULT_TRADE_STATION_POSITIONS);
  const [columnCount, setColumnCount] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load layout from database
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadLayout = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('trade_station_layout_json')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error loading Trade Station layout:', error);
          return;
        }

if (data?.trade_station_layout_json) {
  const layoutData = data.trade_station_layout_json as any;
  
  const isOutdated = !layoutData.version || layoutData.version < CURRENT_TRADE_STATION_LAYOUT_VERSION;
  
  if (layoutData.positions && Array.isArray(layoutData.positions) && !isOutdated) {
    setPositions(layoutData.positions);
    if (layoutData.columnCount) {
      setColumnCount(layoutData.columnCount);
    }
  } else if (layoutData.positions && Array.isArray(layoutData.positions)) {
    // Migrate old format (column/row) to new format (x/y/w/h)
    const migratedPositions = layoutData.positions.map((pos: any) => {
      // Check if it's old format
      if (pos.column !== undefined && pos.row !== undefined && pos.x === undefined) {
        const defaultSize = WIDGET_DEFAULT_SIZES[pos.id] || { w: 4, h: 3, minW: 3, minH: 2 };
        return {
          id: pos.id,
          x: pos.column * 4, // Convert column to x position (assuming 3 columns = 12 grid)
          y: pos.row * 3,    // Convert row to y position
          ...defaultSize,
        };
      }
      return pos;
    });
    setPositions(migratedPositions);
    if (layoutData.columnCount) {
      setColumnCount(layoutData.columnCount);
    }
    await saveLayout(migratedPositions, layoutData.columnCount || 3);
  } else {
    // Saved layout is missing - enforce latest defaults
    setPositions(DEFAULT_TRADE_STATION_POSITIONS);
    setColumnCount(3);
    await saveLayout(DEFAULT_TRADE_STATION_POSITIONS, 3);
  }
}
      } catch (error) {
        console.error('Failed to load Trade Station layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [userId]);

  // Save layout to database
  const saveLayout = useCallback(async (newPositions: TradeStationWidgetPosition[], newColumnCount?: number) => {
    if (!userId) return;

    setIsSaving(true);
    try {
const layoutData: TradeStationLayoutData = {
        positions: newPositions,
        columnCount: newColumnCount ?? columnCount,
        version: CURRENT_TRADE_STATION_LAYOUT_VERSION,
      };

      const { error } = await supabase
        .from('user_settings')
        .update({
          trade_station_layout_json: layoutData as any,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setPositions(newPositions);
      if (newColumnCount !== undefined) {
        setColumnCount(newColumnCount);
      }
      
      toast.success('Trade Station layout saved');
    } catch (error) {
      console.error('Failed to save Trade Station layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  }, [userId, columnCount]);

  // Update position and size of a specific widget
  const updatePosition = useCallback((widgetId: string, x: number, y: number, w?: number, h?: number) => {
    setPositions(prev => {
      const updated = prev.map(p =>
        p.id === widgetId ? { 
          ...p, 
          x, 
          y,
          ...(w !== undefined && { w }),
          ...(h !== undefined && { h })
        } : p
      );
      return updated;
    });
  }, []);

  // Add widget to layout
  const addWidget = useCallback((widgetId: string) => {
    if (positions.find(p => p.id === widgetId)) {
      toast.info('Widget already added');
      return;
    }

    // Get default size for this widget
    const defaultSize = WIDGET_DEFAULT_SIZES[widgetId] || { w: 4, h: 3, minW: 3, minH: 2 };

    // Find the lowest available Y position
    const maxY = positions.length > 0 ? Math.max(...positions.map(p => p.y + p.h)) : 0;

    const newPositions = [...positions, { 
      id: widgetId, 
      x: 0, 
      y: maxY,
      ...defaultSize
    }];
    saveLayout(newPositions);
  }, [positions, saveLayout]);

  // Remove widget from layout
  const removeWidget = useCallback((widgetId: string) => {
    const newPositions = positions.filter(p => p.id !== widgetId);
    saveLayout(newPositions);
  }, [positions, saveLayout]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_TRADE_STATION_POSITIONS, 3);
    toast.success('Trade Station reset to default');
  }, [saveLayout]);

  // Update column count (kept for compatibility, but less relevant with free-form grid)
  const updateColumnCount = useCallback((count: number) => {
    // Just update the column count - layout stays the same with react-grid-layout
    setColumnCount(count);
    saveLayout(positions, count);
  }, [positions, saveLayout]);

  return {
    positions,
    columnCount,
    isLoading,
    isSaving,
    updatePosition,
    saveLayout,
    addWidget,
    removeWidget,
    resetLayout,
    updateColumnCount,
  };
};
