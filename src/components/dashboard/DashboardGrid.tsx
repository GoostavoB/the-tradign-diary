import { DndContext, DragEndEvent, DragStartEvent, MeasuringStrategy, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DropZone } from '@/components/widgets/DropZone';
import { WidgetPosition } from '@/hooks/useGridLayout';
import { ReactNode } from 'react';

interface DashboardGridProps {
    positions: WidgetPosition[];
    selectedColumnCount: number;
    isCustomizing: boolean;
    activeId: string | null;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
    renderWidget: (widgetId: string) => ReactNode;
}

export const DashboardGrid = ({
    positions,
    selectedColumnCount,
    isCustomizing,
    activeId,
    onDragStart,
    onDragEnd,
    onDragCancel,
    renderWidget,
}: DashboardGridProps) => {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Generate grid cells
    const gridCells = [];
    const maxRow = Math.max(...positions.map(p => p.row), 0);

    // Create a grid that's at least the size of current widgets + 1 row if customizing
    const rowCount = isCustomizing ? maxRow + 2 : maxRow + 1;

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < selectedColumnCount; col++) {
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
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
        >
            <SortableContext items={positions.map(p => p.id)} strategy={rectSortingStrategy}>
                <div
                    className="grid gap-4 transition-all duration-300 ease-in-out"
                    style={{
                        gridTemplateColumns: `repeat(${selectedColumnCount}, minmax(0, 1fr))`
                    }}
                >
                    {gridCells}
                </div>
            </SortableContext>
        </DndContext>
    );
};
