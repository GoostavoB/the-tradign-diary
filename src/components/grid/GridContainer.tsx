/**
 * GridContainer - Main grid visualization component
 * 
 * Renders the fixed-unit grid with drop zones and manages widget positioning
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GridWidget as GridWidgetType, GRID_CONSTANTS } from '@/types/grid';
import { GridDropZone } from './GridDropZone';
import { DndContext, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';

interface GridContainerProps {
    widgets: GridWidgetType[];
    floors: number;
    isEditing: boolean;
    onDrop: (widget: GridWidgetType, x: number, y: number) => void;
    onDragStart?: (widgetId: string) => void;
    onDragEnd?: () => void;
    canPlace?: (widget: GridWidgetType, x: number, y: number) => boolean;
    className?: string;
    renderWidget?: (widget: GridWidgetType) => React.ReactNode;
}

export const GridContainer: React.FC<GridContainerProps> = ({
    widgets,
    floors,
    isEditing,
    onDrop,
    onDragStart,
    onDragEnd,
    canPlace,
    className,
    renderWidget,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [unitSize, setUnitSize] = useState(60); // Responsive unit size in pixels
    const [activeId, setActiveId] = useState<string | null>(null);

    // Calculate responsive unit size
    useEffect(() => {
        if (!containerRef.current) return;

        const updateUnitSize = () => {
            const containerWidth = containerRef.current!.offsetWidth;
            const padding = 32; // Total horizontal padding
            const gaps = (GRID_CONSTANTS.COLUMNS - 1) * 8; // Gaps between units
            const availableWidth = containerWidth - padding - gaps;
            const calculatedUnitSize = Math.floor(availableWidth / GRID_CONSTANTS.COLUMNS);

            // Min and max constraints
            const finalUnitSize = Math.max(40, Math.min(100, calculatedUnitSize));
            setUnitSize(finalUnitSize);
        };

        updateUnitSize();

        const resizeObserver = new ResizeObserver(updateUnitSize);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // Calculate grid height
    const gridHeight = useMemo(() => {
        const rowGaps = (floors - 1) * 8;
        return floors * unitSize + rowGaps;
    }, [floors, unitSize]);

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevent accidental drags
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const widgetId = event.active.id as string;
        setActiveId(widgetId);
        onDragStart?.(widgetId);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            onDragEnd?.();
            return;
        }

        const widgetId = active.id as string;
        const widget = widgets.find(w => w.id === widgetId);

        if (!widget) {
            setActiveId(null);
            onDragEnd?.();
            return;
        }

        // Parse drop zone ID: "dropzone-x-y"
        if (typeof over.id === 'string' && over.id.startsWith('dropzone-')) {
            const [, xStr, yStr] = over.id.split('-');
            const x = parseInt(xStr, 10);
            const y = parseInt(yStr, 10);

            onDrop(widget, x, y);
        }

        setActiveId(null);
        onDragEnd?.();
    };

    const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div
                ref={containerRef}
                className={cn(
                    'relative w-full p-4',
                    'bg-background/50 rounded-lg',
                    className
                )}
                style={{ minHeight: gridHeight + 32 }}
            >
                {/* Grid background with units */}
                <div
                    className="absolute inset-4 pointer-events-none"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, hsl(var(--border)/0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)/0.1) 1px, transparent 1px)
            `,
                        backgroundSize: `${unitSize + 8}px ${unitSize + 8}px`,
                    }}
                />

                {/* Drop zones (only visible in edit mode) */}
                {isEditing && (
                    <div className="absolute inset-4 grid gap-2" style={{
                        gridTemplateColumns: `repeat(${GRID_CONSTANTS.COLUMNS}, ${unitSize}px)`,
                        gridTemplateRows: `repeat(${floors}, ${unitSize}px)`,
                    }}>
                        {Array.from({ length: floors }).map((_, y) =>
                            Array.from({ length: GRID_CONSTANTS.COLUMNS }).map((_, x) => (
                                <GridDropZone
                                    key={`dropzone-${x}-${y}`}
                                    id={`dropzone-${x}-${y}`}
                                    x={x}
                                    y={y}
                                    isActive={activeId !== null}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* Widgets - rendered by renderWidget prop */}
                <div className="relative" style={{ minHeight: gridHeight }}>
                    {renderWidget && widgets.map(widget => renderWidget(widget))}
                </div>

                {/* Drag overlay */}
                <DragOverlay>
                    {activeWidget && (
                        <div
                            className="bg-primary/20 border-2 border-primary rounded-lg opacity-80"
                            style={{
                                width: activeWidget.width * unitSize + (activeWidget.width - 1) * 8,
                                height: activeWidget.height * unitSize + (activeWidget.height - 1) * 8,
                            }}
                        />
                    )}
                </DragOverlay>
            </div>
        </DndContext>
    );
};
