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
      
      {/* Single unified grid that respects both column and row positioning */}
      <div 
        className="relative grid gap-4 transition-all duration-500 ease-out"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_SUBCOLUMNS}, minmax(100px, 1fr))`,
          gridTemplateRows: `repeat(${rowCount}, minmax(180px, auto))`,
        }}
      >
        {positions.map((widget, index) => {
          // Calculate grid row span based on widget height
          const widgetHeight = widget.height || 2;
          const rowSpan = Math.ceil(widgetHeight / 2); // Each row unit is 2 height units
          
          return (
            <div
              key={widget.id}
              className={`
                relative transition-all duration-300
                ${isCustomizing ? 'border-2 border-dashed rounded-xl border-primary/30' : ''}
                ${!isCustomizing ? 'animate-fade-in' : ''}
              `}
              style={{
                gridColumn: `${widget.column + 1} / span ${widget.size}`,
                gridRow: `${widget.row + 1} / span ${rowSpan}`,
                animationDelay: !isCustomizing ? `${index * 50}ms` : '0ms',
                animationFillMode: 'backwards',
              }}
            >
              {isCustomizing && (
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-md shadow-lg z-10 font-medium">
                  Size: {widget.size} | Height: {widget.height}
                </div>
              )}
              {renderWidget(widget.id)}
            </div>
          );
        })}
        
        {/* Empty grid cells for customization mode */}
        {isCustomizing && positions.length === 0 && (
          <div
            className="border-2 border-dashed rounded-xl border-border/20 hover:border-primary/30 hover:bg-primary/5 transition-all"
            style={{ gridColumn: '1 / -1', gridRow: '1 / -1' }}
          >
            <EnhancedDropZone 
              id="dropzone-empty" 
              onAddWidget={onOpenWidgetLibrary}
              showAddButton={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
