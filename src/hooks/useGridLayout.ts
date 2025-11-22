import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WIDGET_SIZE_MAP } from '@/types/widget';

export interface WidgetPosition {
  id: string;
  column: number; // 0-5 (6 subcolumns total)
  row: number;
  size: 1 | 2 | 4 | 6; // Widget size in subcolumns
  height: 2 | 4 | 6; // Widget height in rows
}

export interface LayoutData {
  mode: 'adaptive' | 'fixed';
  positions: WidgetPosition[];
  order: string[];
  columnCount?: number;
  version?: number;
}

// Default positions using the new 6-subcolumn system
// Columns: 0-1 (first column), 2-3 (second column), 4-5 (third column)
const DEFAULT_POSITIONS: WidgetPosition[] = [
  // Row 0 - Two size-1 widgets in first column, two size-2 widgets
  { id: 'totalBalance', column: 0, row: 0, size: 1, height: 2 },
  { id: 'winRate', column: 1, row: 0, size: 1, height: 2 },
  { id: 'capitalGrowth', column: 2, row: 0, size: 2, height: 2 },
  { id: 'topMovers', column: 4, row: 0, size: 2, height: 2 },
  
  // Row 1 - Two size-1 widgets in first column, two size-2 widgets
  { id: 'currentROI', column: 0, row: 1, size: 1, height: 2 },
  { id: 'avgPnLPerDay', column: 1, row: 1, size: 1, height: 2 },
  { id: 'goals', column: 2, row: 1, size: 2, height: 2 },
  { id: 'behaviorAnalytics', column: 4, row: 1, size: 2, height: 2 },
  
  // Row 2 - Size 4 widget + size 2 widget
  { id: 'combinedPnLROI', column: 0, row: 2, size: 4, height: 2 },
  { id: 'costEfficiency', column: 4, row: 2, size: 2, height: 2 },
  
  // Row 3 - Size 4 widget + size 2 widget
  { id: 'aiInsights', column: 0, row: 3, size: 4, height: 2 },
  { id: 'tradingQuality', column: 4, row: 3, size: 2, height: 2 },
  
  // Row 4 - Full width size 6 widget
  { id: 'emotionMistakeCorrelation', column: 0, row: 4, size: 6, height: 2 },
  
  // Row 5 - Three size-2 widgets
  { id: 'performanceHighlights', column: 0, row: 5, size: 2, height: 2 },
  { id: 'avgPnLPerTrade', column: 2, row: 5, size: 1, height: 2 },
  { id: 'totalTrades', column: 3, row: 5, size: 1, height: 2 },
];

const CURRENT_OVERVIEW_LAYOUT_VERSION = 4;

export const useGridLayout = (subAccountId: string | undefined, availableWidgets: string[]) => {
  const [mode, setMode] = useState<'adaptive' | 'fixed'>('adaptive');
  const [positions, setPositions] = useState<WidgetPosition[]>(DEFAULT_POSITIONS);
  const [order, setOrder] = useState<string[]>(DEFAULT_POSITIONS.map(p => p.id));
  const [columnCount, setColumnCount] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!subAccountId) {
      setIsLoading(false);
      return;
    }

    const loadLayout = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('layout_json')
          .eq('sub_account_id', subAccountId)
          .maybeSingle();

        if (error) {
          console.error('Error loading layout:', error);
          return;
        }

if (data?.layout_json) {
  const layoutData = data.layout_json as any;

  // Check if this is the new dual-mode format
  if (layoutData.mode && layoutData.version === CURRENT_OVERVIEW_LAYOUT_VERSION) {
    setMode(layoutData.mode);
    setPositions(layoutData.positions || DEFAULT_POSITIONS);
    setOrder(layoutData.order || layoutData.positions?.map((p: any) => p.id) || DEFAULT_POSITIONS.map(p => p.id));
    setColumnCount(layoutData.columnCount || 3);
  }
  // New object format with positions/columnCount (legacy)
  else if (layoutData?.positions && Array.isArray(layoutData.positions)) {
    const isOutdated = !layoutData.version || layoutData.version < CURRENT_OVERVIEW_LAYOUT_VERSION;
    if (isOutdated) {
      console.warn('Outdated overview layout detected; applying defaults');
      const defaultOrder = DEFAULT_POSITIONS.map(p => p.id);
      setMode('adaptive');
      setPositions(DEFAULT_POSITIONS);
      setOrder(defaultOrder);
      setColumnCount(3);
      await saveLayout(DEFAULT_POSITIONS, defaultOrder, 'adaptive', 3);
    } else {
      console.log('Loading layout with column count:', layoutData);
      const migratedOrder = layoutData.positions.map((p: any) => p.id);
      setMode('adaptive');
      setPositions(layoutData.positions);
      setOrder(migratedOrder);
      if (layoutData.columnCount && layoutData.columnCount >= 1 && layoutData.columnCount <= 4) {
        setColumnCount(layoutData.columnCount);
      }
    }
  }
  // Position-based array (legacy) -> treat as outdated and reset
  else if (Array.isArray(layoutData) && layoutData.length > 0 && layoutData[0]?.column !== undefined) {
    console.warn('Legacy position-based layout detected; applying defaults');
    const defaultOrder = DEFAULT_POSITIONS.map(p => p.id);
    setMode('adaptive');
    setPositions(DEFAULT_POSITIONS);
    setOrder(defaultOrder);
    setColumnCount(3);
    await saveLayout(DEFAULT_POSITIONS, defaultOrder, 'adaptive', 3);
  }
  // Order-based array (legacy strings) -> treat as outdated and reset
  else if (Array.isArray(layoutData) && layoutData.length > 0 && typeof layoutData[0] === 'string') {
    console.warn('Legacy order-based layout detected; applying defaults');
    const defaultOrder = DEFAULT_POSITIONS.map(p => p.id);
    setMode('adaptive');
    setPositions(DEFAULT_POSITIONS);
    setOrder(defaultOrder);
    setColumnCount(3);
    await saveLayout(DEFAULT_POSITIONS, defaultOrder, 'adaptive', 3);
  }
}
      } catch (error) {
        console.error('Failed to load layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [subAccountId]);

  const saveLayout = useCallback(async (newPositions: WidgetPosition[], newOrder: string[], newMode?: 'adaptive' | 'fixed', newColumnCount?: number) => {
    if (!subAccountId) {
      console.warn('[useGridLayout] Cannot save: no subAccountId');
      return;
    }

    const countToSave = newColumnCount ?? columnCount;
    const modeToSave = newMode ?? mode;
    console.log('[useGridLayout] Saving layout:', { 
      positionCount: newPositions.length,
      orderCount: newOrder.length,
      mode: modeToSave,
      columnCount: countToSave,
      widgetIds: newPositions.map(p => p.id)
    });
    
    // Validate before saving
    const uniqueIds = new Set(newPositions.map(p => p.id));
    if (uniqueIds.size !== newPositions.length) {
      console.error('[useGridLayout] Duplicate widget IDs detected!', newPositions);
      toast.error('Cannot save: duplicate widgets detected');
      return;
    }

    setIsSaving(true);
    try {
      // Save in new format with mode, positions, order, and columnCount
      const layoutData: LayoutData = {
        mode: modeToSave,
        positions: newPositions,
        order: newOrder,
        columnCount: countToSave,
        version: CURRENT_OVERVIEW_LAYOUT_VERSION,
      };
      
      const { error } = await supabase
        .from('user_settings')
        .update({
          layout_json: layoutData as any,
          updated_at: new Date().toISOString(),
        })
        .eq('sub_account_id', subAccountId);

      if (error) {
        console.error('[useGridLayout] Save error:', error);
        throw error;
      }
      
      // Update local state to match what was saved
      setPositions(newPositions);
      setOrder(newOrder);
      if (newMode) setMode(newMode);
      if (newColumnCount !== undefined) {
        setColumnCount(newColumnCount);
      }
      
      console.log('[useGridLayout] ✅ Layout saved successfully');
      toast.success('Layout saved');
    } catch (error) {
      console.error('[useGridLayout] Failed to save layout:', error);
      toast.error('Failed to save layout. Please try again.');
      throw error; // Let caller handle the error
    } finally {
      setIsSaving(false);
    }
  }, [subAccountId, mode, columnCount]);

  // Toggle layout mode
  const toggleLayoutMode = useCallback((newMode: 'adaptive' | 'fixed') => {
    if (newMode === mode) return;
    
    if (newMode === 'fixed') {
      // Convert adaptive order to fixed positions
      const newPositions: WidgetPosition[] = [];
      order.forEach((widgetId, index) => {
        const col = index % columnCount;
        const row = Math.floor(index / columnCount);
        const size = WIDGET_SIZE_MAP[widgetId] || 2;
        const height: 2 | 4 | 6 = 2; // Default height for all widgets in adaptive mode
        newPositions.push({ id: widgetId, column: col, row, size, height });
      });
      saveLayout(newPositions, order, newMode, columnCount);
    } else {
      // Convert fixed positions to adaptive order
      const sortedPositions = [...positions].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.column - b.column;
      });
      const newOrder = sortedPositions.map(p => p.id);
      saveLayout(positions, newOrder, newMode, columnCount);
    }
  }, [mode, positions, order, columnCount, saveLayout]);

  const updatePosition = useCallback((widgetId: string, column: number, row: number, size?: 1 | 2 | 4 | 6) => {
    const newPositions = positions.map(p =>
      p.id === widgetId ? { ...p, column, row, ...(size && { size }) } : p
    );
    saveLayout(newPositions, order, mode, columnCount);
  }, [positions, order, mode, columnCount, saveLayout]);

  const resizeWidget = useCallback(async (widgetId: string, newSize?: 1 | 2 | 4 | 6, newHeight?: 2 | 4 | 6) => {
    const newPositions = positions.map(p => {
      if (p.id === widgetId) {
        const updates: Partial<WidgetPosition> = {};
        
        // Update size if provided (only for size 2+ widgets)
        if (newSize !== undefined && p.size !== 1) {
          updates.size = newSize;
        }
        
        // Update height if provided
        if (newHeight !== undefined) {
          // Size 1 widgets always have height 2
          if (p.size === 1) {
            updates.height = 2;
          } else {
            updates.height = newHeight;
          }
        }
        
        return { ...p, ...updates };
      }
      return p;
    });
    
    try {
      await saveLayout(newPositions, order, mode, columnCount);
      toast.success('Widget redimensionado');
    } catch (error) {
      toast.error('Falha ao redimensionar widget');
    }
  }, [positions, order, mode, columnCount, saveLayout]);

  // Add widget to layout
  const addWidget = useCallback(async (widgetId: string) => {
    console.log('[useGridLayout] addWidget called:', { widgetId, currentPositions: positions.length });
    
    if (positions.find(p => p.id === widgetId)) {
      console.warn('[useGridLayout] Widget already exists:', widgetId);
      toast.info('Widget already added');
      return;
    }

    const newOrder = [...order, widgetId];
    const size = WIDGET_SIZE_MAP[widgetId] || 2;
    
    if (mode === 'fixed') {
      // Build grid to find occupied positions
      const grid: { [row: number]: { [col: number]: boolean } } = {};
      positions.forEach(pos => {
        if (!grid[pos.row]) grid[pos.row] = {};
        // Mark all subcolumns occupied by this widget
        for (let i = 0; i < pos.size; i++) {
          grid[pos.row][pos.column + i] = true;
        }
      });

      const maxRow = Math.max(-1, ...positions.map(p => p.row));
      let targetCol = 0;
      let targetRow = maxRow + 1;
      
      // Try to find space in existing rows
      if (maxRow >= 0) {
        for (let row = 0; row <= maxRow; row++) {
          if (!grid[row]) grid[row] = {};
          // Try to find consecutive empty subcolumns
          for (let col = 0; col <= 6 - size; col++) {
            let canFit = true;
            for (let i = 0; i < size; i++) {
              if (grid[row][col + i]) {
                canFit = false;
                break;
              }
            }
            if (canFit) {
              targetCol = col;
              targetRow = row;
              break;
            }
          }
          if (targetRow === row) break;
        }
      }

      const newPositions = [...positions, { 
        id: widgetId, 
        column: targetCol, 
        row: targetRow, 
        size, 
        height: 2 as 2 | 4 | 6 // Default height
      }];
      console.log('[useGridLayout] Widget placement:', { 
        widgetId, 
        position: { column: targetCol, row: targetRow, size },
        totalWidgets: newPositions.length 
      });
      
      setPositions(newPositions);
      setOrder(newOrder);
      
      try {
        await saveLayout(newPositions, newOrder, mode, columnCount);
        console.log('[useGridLayout] ✅ Widget added and saved');
      } catch (error) {
        console.error('[useGridLayout] ❌ Failed to save widget, reverting:', error);
        setPositions(positions);
        setOrder(order);
        toast.error('Failed to add widget');
      }
    } else {
      // Adaptive mode: just add to order
      setOrder(newOrder);
      try {
        await saveLayout(positions, newOrder, mode, columnCount);
        console.log('[useGridLayout] ✅ Widget added and saved');
      } catch (error) {
        console.error('[useGridLayout] ❌ Failed to save widget, reverting:', error);
        setOrder(order);
        toast.error('Failed to add widget');
      }
    }
  }, [positions, order, mode, columnCount, saveLayout]);

  const removeWidget = useCallback(async (widgetId: string) => {
    console.log('[useGridLayout] Removing widget:', widgetId);
    
    const newPositions = positions.filter(p => p.id !== widgetId);
    const newOrder = order.filter(id => id !== widgetId);
    
    setPositions(newPositions);
    setOrder(newOrder);
    
    try {
      await saveLayout(newPositions, newOrder, mode, columnCount);
      console.log('[useGridLayout] ✅ Widget removed and saved');
      toast.success('Widget removed');
    } catch (error) {
      console.error('[useGridLayout] ❌ Failed to remove widget, reverting:', error);
      setPositions(positions);
      setOrder(order);
      toast.error('Failed to remove widget');
    }
  }, [positions, order, mode, columnCount, saveLayout]);

  const resetLayout = useCallback(() => {
    const defaultOrder = DEFAULT_POSITIONS.map(p => p.id);
    setPositions(DEFAULT_POSITIONS);
    setOrder(defaultOrder);
    setColumnCount(3);
    saveLayout(DEFAULT_POSITIONS, defaultOrder, 'adaptive', 3);
    toast.success('Layout reset');
  }, [saveLayout]);

  const updateColumnCount = useCallback((newCount: number) => {
    if (newCount >= 1 && newCount <= 4) {
      setColumnCount(newCount);
      saveLayout(positions, order, mode, newCount);
    }
  }, [positions, order, mode, saveLayout]);

  return {
    mode,
    positions,
    order,
    columnCount,
    isLoading,
    isSaving,
    toggleLayoutMode,
    updatePosition,
    resizeWidget,
    saveLayout,
    updateColumnCount,
    addWidget,
    removeWidget,
    resetLayout,
  };
};
