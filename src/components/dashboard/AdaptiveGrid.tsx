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

  // Fixed mode: use the new 6-subcolumn grid system
  return (
    <SubcolumnGrid
      positions={positions}
      isCustomizing={isCustomizing}
      renderWidget={renderWidget}
      onOpenWidgetLibrary={onOpenWidgetLibrary}
    />
  );
};
