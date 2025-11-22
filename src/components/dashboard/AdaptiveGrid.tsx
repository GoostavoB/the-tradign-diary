import { EnhancedDropZone } from '@/components/widgets/EnhancedDropZone';
import { GridGuides } from '@/components/widgets/GridGuides';
import { WidgetPosition } from '@/hooks/useGridLayout';
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
    if (mode === 'fixed') {
      setResponsiveColumns(columnCount);
      return;
    }

    const updateColumns = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setResponsiveColumns(1); // Mobile: 1 column
      } else if (width < 1280) {
        setResponsiveColumns(2); // Tablet: 2 columns
      } else {
        setResponsiveColumns(Math.min(columnCount, 4)); // Desktop: user preference
      }
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [mode, columnCount]);

  if (mode === 'adaptive') {
    // Adaptive mode: widgets flow in order with compact layout
    return (
      <div
        className="grid gap-4 transition-all duration-300 ease-in-out auto-rows-auto"
        style={{
          gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
          gridAutoFlow: 'dense',
        }}
      >
        {order.map((widgetId) => (
          <div 
            key={widgetId} 
            className={`
              relative min-h-[200px] transition-all duration-200
              ${isCustomizing ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-xl' : ''}
            `}
          >
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>
    );
  }

  // Fixed mode: widgets stay at exact grid positions
  const gridCells = [];
  const maxRow = Math.max(...positions.map(p => p.row), 0);
  const rowCount = isCustomizing ? maxRow + 2 : maxRow + 1;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < columnCount; col++) {
      const position = positions.find(p => p.row === row && p.column === col);
      const widgetId = position?.id;

      gridCells.push(
        <div
          key={`${col}-${row}`}
          className={`
            relative min-h-[200px] h-full transition-all duration-200
            ${isCustomizing ? 'border-2 border-dashed rounded-xl' : ''}
            ${isCustomizing && !widgetId ? 'border-border/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10' : ''}
            ${isCustomizing && widgetId ? 'border-primary/20' : ''}
          `}
          style={{
            gridColumn: col + 1,
            gridRow: row + 1,
          }}
        >
          {isCustomizing && !widgetId && (
            <EnhancedDropZone 
              id={`dropzone-${col}-${row}`} 
              onAddWidget={onOpenWidgetLibrary}
              showAddButton={true}
            />
          )}

          {widgetId && renderWidget(widgetId)}
        </div>
      );
    }
  }

  return (
    <div className="relative">
      {/* Grid guides overlay in fixed mode */}
      <GridGuides 
        columnCount={columnCount} 
        rowCount={rowCount} 
        show={isCustomizing}
      />
      
      <div
        className={`relative grid gap-4 transition-all duration-300 ease-in-out ${isCustomizing ? 'overflow-x-auto' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(250px, 1fr))`,
        }}
      >
        {gridCells}
      </div>
    </div>
  );
};
