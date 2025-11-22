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
  // Build grid with 6 subcolumns (3 columns x 2 subcolumns each)
  const TOTAL_SUBCOLUMNS = 6;
  const maxRow = Math.max(...positions.map(p => p.row), 0);
  const rowCount = isCustomizing ? maxRow + 2 : maxRow + 1;

  // Group widgets by row
  const rowGroups: { [row: number]: WidgetPosition[] } = {};
  positions.forEach(pos => {
    if (!rowGroups[pos.row]) rowGroups[pos.row] = [];
    rowGroups[pos.row].push(pos);
  });

  // Sort widgets in each row by column
  Object.keys(rowGroups).forEach(row => {
    rowGroups[Number(row)].sort((a, b) => a.column - b.column);
  });

  return (
    <div className="relative w-full">
      {/* Grid guides overlay in customization mode */}
      {isCustomizing && (
        <GridGuides 
          columnCount={TOTAL_SUBCOLUMNS} 
          rowCount={rowCount} 
          show={isCustomizing}
        />
      )}
      
      <div className="space-y-6">
        {/* Render each row */}
        {Array.from({ length: rowCount }).map((_, rowIndex) => {
          const rowWidgets = rowGroups[rowIndex] || [];
          const hasWidgets = rowWidgets.length > 0;

          return (
            <div
              key={rowIndex}
              className="relative grid gap-6 transition-all duration-500 ease-out"
              style={{
                gridTemplateColumns: `repeat(${TOTAL_SUBCOLUMNS}, minmax(140px, 1fr))`,
                minHeight: '180px',
              }}
            >
              {hasWidgets ? (
                // Render widgets in this row
                rowWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    className={`
                      relative min-h-[180px] transition-all duration-300
                      ${isCustomizing ? 'border-2 border-dashed rounded-xl border-primary/30' : ''}
                      ${!isCustomizing ? 'animate-fade-in' : ''}
                    `}
                    style={{
                      gridColumn: `${widget.column + 1} / span ${widget.size}`,
                      animationDelay: !isCustomizing ? `${index * 50}ms` : '0ms',
                      animationFillMode: 'backwards',
                    }}
                  >
                    {renderWidget(widget.id)}
                  </div>
                ))
              ) : isCustomizing ? (
                // Empty row in customization mode - show drop zones
                <div
                  className="border-2 border-dashed rounded-xl border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  style={{ gridColumn: '1 / -1' }}
                >
                  <EnhancedDropZone 
                    id={`dropzone-row-${rowIndex}`} 
                    onAddWidget={onOpenWidgetLibrary}
                    showAddButton={true}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};
