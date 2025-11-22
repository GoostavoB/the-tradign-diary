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

  // Fixed mode: precise grid positioning with horizontal scroll on small screens
  const gridCells = [];
  const maxRow = Math.max(...positions.map(p => p.row), 0);
  const rowCount = isCustomizing ? maxRow + 2 : maxRow + 1;

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < columnCount; col++) {
      const position = positions.find(p => p.row === row && p.column === col);
      const widgetId = position?.id;
      const index = row * columnCount + col;

      gridCells.push(
        <div
          key={`${col}-${row}`}
          className={`
            relative min-h-[220px] h-full transition-all duration-300
            ${isCustomizing ? 'border-2 border-dashed rounded-xl' : ''}
            ${isCustomizing && !widgetId ? 'border-border/30 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10' : ''}
            ${isCustomizing && widgetId ? 'border-primary/20' : ''}
            ${!isCustomizing && widgetId ? 'animate-fade-in' : ''}
          `}
          style={{
            gridColumn: col + 1,
            gridRow: row + 1,
            animationDelay: widgetId && !isCustomizing ? `${index * 30}ms` : '0ms',
            animationFillMode: 'backwards',
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
    <div className="relative w-full overflow-x-auto">
      {/* Grid guides overlay in fixed mode */}
      <GridGuides 
        columnCount={columnCount} 
        rowCount={rowCount} 
        show={isCustomizing}
      />
      
      <div
        className="relative grid gap-6 transition-all duration-500 ease-out min-w-full"
        style={{
          gridTemplateColumns: `repeat(${columnCount}, minmax(300px, 1fr))`,
          gridAutoRows: 'minmax(220px, auto)',
        }}
      >
        {gridCells}
      </div>
    </div>
  );
};
