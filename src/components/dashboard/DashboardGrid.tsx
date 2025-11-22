import { DndContext, DragEndEvent, DragStartEvent, MeasuringStrategy, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { AdaptiveGrid } from '@/components/dashboard/AdaptiveGrid';
import { WidgetPosition } from '@/hooks/useGridLayout';
import { ReactNode } from 'react';

interface DashboardGridProps {
    mode: 'adaptive' | 'fixed';
    positions: WidgetPosition[];
    order: string[];
    selectedColumnCount: number;
    isCustomizing: boolean;
    activeId: string | null;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
    renderWidget: (widgetId: string) => ReactNode;
}

export const DashboardGrid = ({
    mode,
    positions,
    order,
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

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
        >
            <SortableContext items={mode === 'adaptive' ? order : positions.map(p => p.id)} strategy={rectSortingStrategy}>
                <AdaptiveGrid
                    mode={mode}
                    positions={positions}
                    order={order}
                    columnCount={selectedColumnCount}
                    isCustomizing={isCustomizing}
                    renderWidget={renderWidget}
                />
            </SortableContext>
        </DndContext>
    );
};
