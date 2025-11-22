/**
 * GridWidget - Widget wrapper for grid positioning
 * 
 * Positions and sizes widgets on the grid using transform translate3d
 * for smooth animations
 */

import React, { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { GridWidget as GridWidgetType } from '@/types/grid';
import { GripVertical, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GridWidgetProps {
    widget: GridWidgetType;
    unitSize: number;
    isEditing: boolean;
    isDragging?: boolean;
    onResize?: (widgetId: string, newSize: number, newHeight: number) => void;
    children?: React.ReactNode;
}

const GridWidgetComponent: React.FC<GridWidgetProps> = ({
    widget,
    unitSize,
    isEditing,
    isDragging = false,
    onResize,
    children,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: widget.id,
        disabled: !isEditing,
    });

    // Calculate position and size in pixels
    const gapSize = 8;
    const x = widget.x * (unitSize + gapSize);
    const y = widget.y * (unitSize + gapSize);
    const width = widget.width * unitSize + (widget.width - 1) * gapSize;
    const height = widget.height * unitSize + (widget.height - 1) * gapSize;

    // Transform for dragging (only apply x/y translation from DnD)
    const style = {
        position: 'absolute' as const,
        left: 0,
        top: 0,
        width: `${width}px`,
        height: `${height}px`,
        transform: CSS.Translate.toString(transform)
            ? `translate3d(${x}px, ${y}px, 0) ${CSS.Translate.toString(transform)}`
            : `translate3d(${x}px, ${y}px, 0)`,
        transition: transition || 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isDragging ? 1000 : 1,
    };

    const handleGrowSize = () => {
        // Increase size logically (1 -> 2 -> 4 -> 6 -> etc.)
        const sizeProgression = [1, 2, 4, 6, 8, 10, 12, 24];
        const currentIndex = sizeProgression.indexOf(widget.width);
        if (currentIndex < sizeProgression.length - 1) {
            const newSize = sizeProgression[currentIndex + 1];
            onResize?.(widget.id, newSize, widget.height);
        }
    };

    const handleShrinkSize = () => {
        const sizeProgression = [1, 2, 4, 6, 8, 10, 12, 24];
        const currentIndex = sizeProgression.indexOf(widget.width);
        if (currentIndex > 0) {
            const newSize = sizeProgression[currentIndex - 1];

            // Don't shrink below minimum
            if (newSize >= widget.minSize) {
                onResize?.(widget.id, newSize, widget.height);
            }
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group',
                isDragging && 'opacity-50 cursor-grabbing'
            )}
        >
            <Card className={cn(
                'h-full overflow-hidden transition-shadow duration-200',
                isEditing && 'ring-2 ring-primary/20 hover:ring-primary/40',
                isDragging && 'shadow-2xl ring-2 ring-primary'
            )}>
                {/* Drag handle (only in edit mode) */}
                {isEditing && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 cursor-grab active:cursor-grabbing bg-background/80 backdrop-blur-sm"
                            {...attributes}
                            {...listeners}
                        >
                            <GripVertical className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Resize controls (only in edit mode) */}
                {isEditing && onResize && (
                    <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                            onClick={handleShrinkSize}
                            disabled={widget.width <= widget.minSize}
                            title="Diminuir tamanho"
                        >
                            <Minimize2 className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 bg-background/80 backdrop-blur-sm"
                            onClick={handleGrowSize}
                            disabled={widget.width >= 24}
                            title="Aumentar tamanho"
                        >
                            <Maximize2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}

                {/* Widget content */}
                <div className="h-full w-full overflow-auto">
                    {children}
                </div>
            </Card>
        </div>
    );
};

export const GridWidget = memo(GridWidgetComponent);
GridWidget.displayName = 'GridWidget';
