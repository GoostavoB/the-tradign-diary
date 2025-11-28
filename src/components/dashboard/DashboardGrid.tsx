import { DndContext, DragEndEvent, DragStartEvent, MeasuringStrategy, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { AdaptiveGrid } from '@/components/dashboard/AdaptiveGrid';
import { DragPreviewOverlay } from '@/components/widgets/DragPreviewOverlay';
import { WidgetPosition } from '@/hooks/useGridLayout';
import { ReactNode } from 'react';

interface DashboardGridProps {
    positions: WidgetPosition[];
    order: string[];
    selectedColumnCount: number;
    isCustomizing: boolean;
    activeId: string | null;
    onDragStart: (event: DragStartEvent) => void;
    onDragEnd: (event: DragEndEvent) => void;
    onDragCancel: () => void;
    renderWidget: (widgetId: string) => ReactNode;
    onOpenWidgetLibrary?: () => void;
}

export const DashboardGrid = ({
    positions,
    order,
    selectedColumnCount,
    isCustomizing,
    activeId,
    onDragStart,
    onDragEnd,
    onDragCancel,
    renderWidget,
    onOpenWidgetLibrary,
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
            <SortableContext items={order} strategy={rectSortingStrategy}>
                <AdaptiveGrid
                    positions={positions}
                    order={order}
                    columnCount={selectedColumnCount}
                    isCustomizing={isCustomizing}
                    renderWidget={renderWidget}
                    onOpenWidgetLibrary={onOpenWidgetLibrary}
                />
            </SortableContext>

            {/* Enhanced drag preview overlay */}
            <DragPreviewOverlay
                activeId={activeId}
                renderPreview={renderWidget}
            />
        </DndContext>
    );
};
