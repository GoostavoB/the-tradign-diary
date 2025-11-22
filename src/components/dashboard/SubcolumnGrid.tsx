import { EnhancedDropZone } from '@/components/widgets/EnhancedDropZone';
import { GridGuides } from '@/components/widgets/GridGuides';
import { WidgetPosition } from '@/hooks/useGridLayout';
import { ReactNode } from 'react';

interface SubcolumnGridProps {
  positions: WidgetPosition[];
  isCustomizing: boolean;
  renderWidget: (widgetId: string) => ReactNode;
  onOpenWidgetLibrary?: () => void;
}

export const SubcolumnGrid = ({
  positions,
  isCustomizing,
  renderWidget,
  onOpenWidgetLibrary,
}: SubcolumnGridProps) => {
  // Build grid with 6 subcolumns
  const TOTAL_SUBCOLUMNS = 6;
  const gridCells: ReactNode[] = [];
  const maxRow = Math.max(...positions.map(p => p.row), 0);
  const rowCount = isCustomizing ? maxRow + 2 : maxRow + 1;

  // Create a map of occupied positions
  const occupiedMap: { [key: string]: WidgetPosition } = {};
  positions.forEach(pos => {
    for (let i = 0; i < pos.size; i++) {
      const key = `${pos.row}-${pos.column + i}`;
      occupiedMap[key] = pos;
    }
  });

  // Render grid cells
  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < TOTAL_SUBCOLUMNS; col++) {
      const key = `${row}-${col}`;
      const widget = occupiedMap[key];

      // Skip if this cell is part of a widget that starts at a previous column
      if (widget && widget.column !== col) {
        continue;
      }

      const index = row * TOTAL_SUBCOLUMNS + col;
      const isEmpty = !widget;

      gridCells.push(
        <div
          key={key}
          className={`
            relative transition-all duration-300
            ${widget ? 'min-h-[180px]' : 'min-h-[180px]'}
            ${isCustomizing && isEmpty ? 'border-2 border-dashed rounded-xl border-border/20 hover:border-primary/30 hover:bg-primary/5' : ''}
            ${isCustomizing && widget ? 'border-2 border-dashed rounded-xl border-primary/30' : ''}
            ${!isCustomizing && widget ? 'animate-fade-in' : ''}
            ${isEmpty && !isCustomizing ? 'border border-dashed border-border/10 rounded-xl' : ''}
          `}
          style={{
            gridColumn: widget ? `span ${widget.size}` : 'span 1',
            gridRow: row + 1,
            animationDelay: widget && !isCustomizing ? `${index * 20}ms` : '0ms',
            animationFillMode: 'backwards',
          }}
        >
          {/* Watermark for empty spaces (only visible when not customizing) */}
          {isEmpty && !isCustomizing && (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div className="w-full h-full border-2 border-dashed border-primary/30 rounded-xl" />
            </div>
          )}

          {/* Drop zone in customization mode */}
          {isCustomizing && isEmpty && (
            <EnhancedDropZone 
              id={`dropzone-${col}-${row}`} 
              onAddWidget={onOpenWidgetLibrary}
              showAddButton={true}
            />
          )}

          {/* Render widget */}
          {widget && renderWidget(widget.id)}
        </div>
      );
    }
  }

  return (
    <div className="relative w-full overflow-x-auto">
      {/* Grid guides overlay in customization mode */}
      {isCustomizing && (
        <GridGuides 
          columnCount={TOTAL_SUBCOLUMNS} 
          rowCount={rowCount} 
          show={isCustomizing}
        />
      )}
      
      <div
        className="relative grid gap-6 transition-all duration-500 ease-out min-w-full"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_SUBCOLUMNS}, minmax(140px, 1fr))`,
          gridAutoRows: 'minmax(180px, auto)',
        }}
      >
        {gridCells}
      </div>
    </div>
  );
};
