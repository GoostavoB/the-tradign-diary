import { WidgetPosition } from '@/hooks/useGridLayout';
import { SubcolumnGrid } from './SubcolumnGrid';
import { ReactNode, useEffect, useState } from 'react';

interface AdaptiveGridProps {
  mode: 'adaptive' | 'fixed';
  positions: WidgetPosition[];
  order: string[];
  columnCount: number;
  isCustomizing: boolean;
  renderWidget: (widgetId: string) => ReactNode;
  onOpenWidgetLibrary?: () => void;
}

export const AdaptiveGrid = ({
  mode,
  positions,
  order,
  columnCount,
  isCustomizing,
  renderWidget,
  onOpenWidgetLibrary,
}: AdaptiveGridProps) => {
  const [responsiveColumns, setResponsiveColumns] = useState(columnCount);

  // Responsive column calculation for adaptive mode
  useEffect(() => {
    console.log('[AdaptiveGrid] 📐 Grid Mode:', { 
      mode, 
      columnCount, 
      positionCount: positions.length, 
      orderCount: order.length,
      isCustomizing 
    });
    
    if (mode === 'fixed') {
      console.log('[AdaptiveGrid] 🔒 Fixed mode - using SubcolumnGrid with 6 subcolumns');
      setResponsiveColumns(columnCount);
      return;
    }

    const updateColumns = () => {
      const width = window.innerWidth;
      let cols = columnCount;
      if (width < 768) {
        cols = 1; // Mobile: 1 column
      } else if (width < 1280) {
        cols = 2; // Tablet: 2 columns
      } else {
        cols = Math.min(columnCount, 4); // Desktop: user preference
      }
      console.log('[AdaptiveGrid] 📱 Responsive columns:', { width, cols });
      setResponsiveColumns(cols);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [mode, columnCount, positions.length, order.length, isCustomizing]);

  if (mode === 'adaptive') {
    console.log('[AdaptiveGrid] 🌊 Rendering Adaptive Grid:', { responsiveColumns, widgetCount: order.length });
    // Adaptive mode: responsive flowing grid with dense packing
    return (
      <div
        className="grid gap-6 auto-rows-auto transition-all duration-500 ease-out"
        style={{
          gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
          gridAutoFlow: 'dense',
        }}
      >
        {order.map((widgetId, index) => (
          <div 
            key={widgetId} 
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards',
            }}
          >
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>
    );
  }

  // Fixed mode: use the new 6-subcolumn grid system
  console.log('[AdaptiveGrid] 🧩 Rendering SubcolumnGrid (Fixed mode):', { 
    positionCount: positions.length,
    sizeDistribution: positions.reduce((acc, p) => {
      acc[`size${p.size}`] = (acc[`size${p.size}`] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  });
  
  return (
    <SubcolumnGrid
      positions={positions}
      isCustomizing={isCustomizing}
      renderWidget={renderWidget}
      onOpenWidgetLibrary={onOpenWidgetLibrary}
    />
  );
};
