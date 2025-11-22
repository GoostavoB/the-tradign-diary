import { WidgetPosition } from '@/hooks/useGridLayout';
import { EnhancedDropZone } from '@/components/widgets/EnhancedDropZone';
import { GridGuides } from '@/components/widgets/GridGuides';
import { ReactNode, useState, useEffect } from 'react';
import { useDndContext } from '@dnd-kit/core';
import { toGridWidgets, isWithinBounds, hasCollision } from '@/utils/gridValidator';

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
  const TOTAL_SUBCOLUMNS = 6;
  const { active, over } = useDndContext();
  const [hoveredCell, setHoveredCell] = useState<{ column: number; row: number; size: number; height: number } | null>(null);
  const [isValidDrop, setIsValidDrop] = useState(true);
  
  // Calculate required rows dynamically based on widget positions
  const maxRow = positions.reduce((max, pos) => {
    const widgetEndRow = pos.row + Math.ceil(pos.height / 2);
    return Math.max(max, widgetEndRow);
  }, 0);
  
  // Add extra rows in customization mode for drop zones
  const totalRows = isCustomizing ? Math.max(maxRow + 3, 6) : maxRow;

  // Track active widget and validate drop zones in real-time
  useEffect(() => {
    if (!active || !over) {
      setHoveredCell(null);
      return;
    }

    const overId = over.id as string;
    if (!overId.startsWith('dropzone-')) {
      setHoveredCell(null);
      return;
    }

    const [, colStr, rowStr] = overId.split('-');
    const targetCol = parseInt(colStr, 10);
    const targetRow = parseInt(rowStr, 10);

    // Get active widget
    const activePos = positions.find(p => p.id === active.id);
    if (!activePos) {
      setIsValidDrop(false);
      return;
    }

    setHoveredCell({ 
      column: targetCol, 
      row: targetRow,
      size: activePos.size,
      height: activePos.height
    });

    // Validate if this drop would be valid
    const gridWidgets = toGridWidgets(positions);
    const testWidget = {
      ...activePos,
      column: targetCol,
      row: targetRow
    };

    const withinBounds = isWithinBounds(testWidget, TOTAL_SUBCOLUMNS);
    const noCollision = !hasCollision(testWidget, gridWidgets, activePos.id);
    
    setIsValidDrop(withinBounds && noCollision);
  }, [active, over, positions]);

  return (
    <div className="relative w-full">
      {/* Grid guides overlay in customization mode */}
      {isCustomizing && (
        <GridGuides 
          columnCount={TOTAL_SUBCOLUMNS} 
          rowCount={totalRows} 
          show={isCustomizing}
        />
      )}
      
      {/* Single unified grid that respects both column and row positioning */}
      <div 
        className="relative grid gap-4 transition-all duration-500 ease-out"
        style={{
          gridTemplateColumns: `repeat(${TOTAL_SUBCOLUMNS}, minmax(100px, 1fr))`,
          gridTemplateRows: `repeat(${totalRows}, minmax(180px, auto))`,
        }}
      >
        {/* Visual feedback for hovered drop zone */}
        {isCustomizing && hoveredCell && active && (
          <div
            className={`absolute pointer-events-none transition-all duration-200 rounded-xl border-2 z-50 ${
              isValidDrop 
                ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20' 
                : 'bg-destructive/10 border-destructive shadow-lg shadow-destructive/20'
            }`}
            style={{
              gridColumn: `${hoveredCell.column + 1} / span ${hoveredCell.size}`,
              gridRow: `${hoveredCell.row + 1} / span ${Math.ceil(hoveredCell.height / 2)}`,
            }}
          >
            <div className={`absolute inset-0 flex items-center justify-center text-sm font-semibold ${
              isValidDrop ? 'text-primary' : 'text-destructive'
            }`}>
              {isValidDrop ? '✓ Valid Position' : '✗ Invalid Position'}
            </div>
          </div>
        )}

        {/* Render actual widgets */}
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
                  Col: {widget.column} | Size: {widget.size} | Height: {widget.height}
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
