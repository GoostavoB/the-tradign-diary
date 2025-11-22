import { DropZone } from '@/components/widgets/DropZone';
import { WidgetPosition } from '@/hooks/useGridLayout';
import { ReactNode, useEffect, useState } from 'react';

interface AdaptiveGridProps {
  mode: 'adaptive' | 'fixed';
  positions: WidgetPosition[];
  order: string[];
  columnCount: number;
  isCustomizing: boolean;
  renderWidget: (widgetId: string) => ReactNode;
}

export const AdaptiveGrid = ({
  mode,
  positions,
  order,
  columnCount,
  isCustomizing,
  renderWidget,
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
    // Adaptive mode: widgets flow in order
    return (
      <div
        className="grid gap-4 transition-all duration-300 ease-in-out"
        style={{
          gridTemplateColumns: `repeat(${responsiveColumns}, minmax(0, 1fr))`,
          gridAutoFlow: 'dense',
        }}
      >
        {order.map((widgetId) => (
          <div key={widgetId} className="relative min-h-[200px]">
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
            relative min-h-[200px] h-full
            ${isCustomizing ? 'border-2 border-dashed border-muted/20 rounded-xl transition-colors duration-200' : ''}
            ${isCustomizing && !widgetId ? 'hover:border-primary/50 hover:bg-primary/5' : ''}
          `}
          style={{
            gridColumn: col + 1,
            gridRow: row + 1,
          }}
        >
          {isCustomizing && !widgetId && (
            <DropZone id={`dropzone-${col}-${row}`} />
          )}

          {widgetId && renderWidget(widgetId)}
        </div>
      );
    }
  }

  return (
    <div
      className={`grid gap-4 transition-all duration-300 ease-in-out ${isCustomizing ? 'overflow-x-auto' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(250px, 1fr))`,
      }}
    >
      {gridCells}
    </div>
  );
};
