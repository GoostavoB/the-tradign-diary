import { useState, useCallback, useMemo, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, rectIntersection, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { useAuth } from '@/contexts/AuthContext';
import { useTradeStationLayout, TradeStationWidgetPosition } from '@/hooks/useTradeStationLayout';
import { TRADE_STATION_WIDGET_CATALOG } from '@/config/tradeStationWidgetCatalog';
import { SortableWidget } from '@/components/widgets/SortableWidget';
import { DropZone } from '@/components/widgets/DropZone';
import { CustomizeDashboardControls } from '@/components/CustomizeDashboardControls';
import { WidgetLibrary } from '@/components/widgets/WidgetLibrary';
import { toast } from 'sonner';

interface TradeStationViewProps {
  onControlsReady?: (controls: {
    isCustomizing: boolean;
    hasChanges: boolean;
    handleStartCustomize: () => void;
    handleSave: () => void;
    handleCancel: () => void;
    handleReset: () => void;
    handleAddWidget: () => void;
    columnCount: number;
    handleColumnCountChange: (count: number) => void;
    widgetCount: number;
  }) => void;
}

export const TradeStationView = ({ onControlsReady }: TradeStationViewProps = {}) => {
  const { user } = useAuth();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originalPositions, setOriginalPositions] = useState<TradeStationWidgetPosition[]>([]);
  
  const {
    positions,
    columnCount,
    isLoading,
    addWidget,
    removeWidget,
    saveLayout,
    updateColumnCount,
    resetLayout,
  } = useTradeStationLayout(user?.id);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );
  
  // Grid organization
  const grid = useMemo(() => {
    const result: { [col: number]: { [row: number]: string } } = {};
    positions.forEach(pos => {
      if (!result[pos.column]) result[pos.column] = {};
      result[pos.column][pos.row] = pos.id;
    });
    return result;
  }, [positions]);
  
  // Active widgets for library
  const activeWidgets = useMemo(() => positions.map(p => p.id), [positions]);
  
  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!isCustomizing || originalPositions.length === 0) return false;
    
    if (positions.length !== originalPositions.length) return true;
    
    return positions.some(pos => {
      const original = originalPositions.find(o => o.id === pos.id);
      return !original || original.column !== pos.column || original.row !== pos.row;
    });
  }, [isCustomizing, positions, originalPositions]);
  
  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activePos = positions.find(p => p.id === activeId);
    if (!activePos) {
      console.error('Active widget not found:', activeId);
      setActiveId(null);
      return;
    }

    let updatedPositions: TradeStationWidgetPosition[];

    // Handle drop on another widget - swap positions
    const overPos = positions.find(p => p.id === overId);
    if (overPos) {
      updatedPositions = positions.map(p => {
        if (p.id === activeId) {
          return { ...p, column: overPos.column, row: overPos.row };
        }
        if (p.id === overId) {
          return { ...p, column: activePos.column, row: activePos.row };
        }
        return p;
      });
    }
    // Handle drop on dropzone
    else if (overId.startsWith('dropzone-')) {
      const [, colStr, rowStr] = overId.split('-');
      const targetCol = parseInt(colStr, 10);
      const targetRow = parseInt(rowStr, 10);
      
      updatedPositions = positions.map(p =>
        p.id === activeId ? { ...p, column: targetCol, row: targetRow } : p
      );
    }
    else {
      console.warn('Unknown drop target:', overId);
      setActiveId(null);
      return;
    }

    // Validate
    const originalIds = new Set(positions.map(p => p.id));
    const updatedIds = new Set(updatedPositions.map(p => p.id));
    
    if (originalIds.size !== updatedIds.size) {
      console.error('Widget count mismatch!');
      toast.error('Layout update failed');
      setActiveId(null);
      return;
    }

    // Save immediately
    saveLayout(updatedPositions);
    setActiveId(null);
  }, [positions, saveLayout]);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);
  
  // Widget renderer
  const renderWidget = useCallback((widgetId: string) => {
    const widgetConfig = TRADE_STATION_WIDGET_CATALOG[widgetId];
    if (!widgetConfig) return null;
    
    const WidgetComponent = widgetConfig.component;
    
    return (
      <SortableWidget
        id={widgetId}
        isEditMode={isCustomizing}
        onRemove={() => removeWidget(widgetId)}
      >
        <WidgetComponent 
          id={widgetId}
          isEditMode={isCustomizing} 
          onRemove={() => removeWidget(widgetId)} 
        />
      </SortableWidget>
    );
  }, [isCustomizing, removeWidget]);

  // Handle customize actions
  const handleStartCustomize = useCallback(() => {
    setOriginalPositions([...positions]);
    setIsCustomizing(true);
  }, [positions]);

  const handleSaveLayout = useCallback(() => {
    setIsCustomizing(false);
    setOriginalPositions([]);
    toast.success('Trade Station layout saved');
  }, []);

  const handleCancelCustomize = useCallback(() => {
    if (originalPositions.length > 0) {
      saveLayout(originalPositions);
    }
    setIsCustomizing(false);
    setOriginalPositions([]);
  }, [originalPositions, saveLayout]);

  // Expose controls to parent via callback
  const controls = useMemo(() => ({
    isCustomizing,
    hasChanges,
    handleStartCustomize,
    handleSave: handleSaveLayout,
    handleCancel: handleCancelCustomize,
    handleReset: resetLayout,
    handleAddWidget: () => setShowWidgetLibrary(true),
    columnCount,
    handleColumnCountChange: updateColumnCount,
    widgetCount: positions.length,
  }), [isCustomizing, hasChanges, handleStartCustomize, handleSaveLayout, handleCancelCustomize, resetLayout, columnCount, updateColumnCount, positions.length]);

  // Notify parent when controls are ready
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(controls);
    }
  }, [controls, onControlsReady]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Dynamic Grid with DnD */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={rectIntersection}
      >
        <SortableContext
          items={positions.map(p => p.id)}
          strategy={rectSortingStrategy}
        >
          <div 
            className="dashboard-grid-free"
            style={{ '--column-count': columnCount } as React.CSSProperties}
          >
            {Array.from({ length: columnCount }, (_, colIdx) => (
              <div key={`col-${colIdx}`} className="dashboard-column-free">
                {Object.entries(grid[colIdx] || {})
                  .sort(([rowA], [rowB]) => parseInt(rowA) - parseInt(rowB))
                  .map(([row, widgetId]) => (
                    <div key={widgetId}>
                      {renderWidget(widgetId)}
                    </div>
                  ))}
                {isCustomizing && (
                  <DropZone id={`dropzone-${colIdx}-${Object.keys(grid[colIdx] || {}).length}`} />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Widget Library */}
      <WidgetLibrary
        open={showWidgetLibrary}
        onClose={() => setShowWidgetLibrary(false)}
        onAddWidget={addWidget}
        onRemoveWidget={removeWidget}
        activeWidgets={activeWidgets}
      />
    </div>
  );
};
