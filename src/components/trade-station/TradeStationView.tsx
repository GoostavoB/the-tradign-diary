import { useState, useCallback, useMemo, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './TradeStationView.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTradeStationLayout, TradeStationWidgetPosition } from '@/hooks/useTradeStationLayout';
import { TRADE_STATION_WIDGET_CATALOG } from '@/config/tradeStationWidgetCatalog';
import { WidgetLibrary } from '@/components/widgets/WidgetLibrary';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, X, GripVertical } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
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
  
  // Active widgets for library
  const activeWidgets = useMemo(() => positions.map(p => p.id), [positions]);
  
  // Convert positions to react-grid-layout format
  const layout: Layout[] = useMemo(() => 
    positions.map(pos => ({
      i: pos.id,
      x: pos.x,
      y: pos.y,
      w: pos.w,
      h: pos.h,
      minW: pos.minW,
      minH: pos.minH,
      maxW: pos.maxW,
      maxH: pos.maxH,
    })),
    [positions]
  );
  
  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    if (!isCustomizing || originalPositions.length === 0) return false;
    
    if (positions.length !== originalPositions.length) return true;
    
    return positions.some(pos => {
      const original = originalPositions.find(o => o.id === pos.id);
      return !original || original.x !== pos.x || original.y !== pos.y || original.w !== pos.w || original.h !== pos.h;
    });
  }, [isCustomizing, positions, originalPositions]);
  
  // Handle layout changes from react-grid-layout
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    if (!isCustomizing) return;
    
    const updatedPositions: TradeStationWidgetPosition[] = newLayout.map(item => {
      const existingPos = positions.find(p => p.id === item.i);
      return {
        id: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: existingPos?.minW,
        minH: existingPos?.minH,
        maxW: existingPos?.maxW,
        maxH: existingPos?.maxH,
      };
    });
    
    saveLayout(updatedPositions);
  }, [isCustomizing, positions, saveLayout]);
  
  // Widget renderer
  const renderWidget = useCallback((widgetId: string) => {
    const widgetConfig = TRADE_STATION_WIDGET_CATALOG[widgetId];
    if (!widgetConfig) return null;
    
    const WidgetComponent = widgetConfig.component;
    
    return (
      <div className="relative h-full group">
        {isCustomizing && (
          <>
            <div className="absolute top-2 left-2 z-10 cursor-move bg-background/80 backdrop-blur-sm rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 z-10 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeWidget(widgetId)}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        )}
        <WidgetComponent 
          id={widgetId}
          isEditMode={isCustomizing} 
          onRemove={() => removeWidget(widgetId)} 
        />
      </div>
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
    <div className="space-y-4 relative">
      {/* Floating Add Trade Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => navigate('/upload')}
              size="icon"
              className="fixed top-20 right-6 z-50 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
              aria-label="Add a trade"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Add a trade</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* React Grid Layout */}
      <div className="w-full">
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={60}
          width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1400) : 1200}
          isDraggable={isCustomizing}
          isResizable={isCustomizing}
          onLayoutChange={handleLayoutChange}
          compactType="vertical"
          preventCollision={false}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {positions.map((pos) => (
            <div key={pos.id} className="widget-container">
              {renderWidget(pos.id)}
            </div>
          ))}
        </GridLayout>
      </div>
      
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
