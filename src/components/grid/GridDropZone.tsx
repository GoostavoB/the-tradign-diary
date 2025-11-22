/**
 * GridDropZone - Individual drop zone for grid units
 * 
 * Provides visual feedback during drag operations
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface GridDropZoneProps {
    id: string;
    x: number;
    y: number;
    isActive: boolean;
}

export const GridDropZone: React.FC<GridDropZoneProps> = ({
    id,
    x,
    y,
    isActive,
}) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: { x, y },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'relative rounded transition-colors duration-150',
                isActive && 'bg-muted/30',
                isOver && 'bg-primary/20 ring-2 ring-primary/50'
            )}
        >
            {/* Grid coordinate indicator (visible on hover in edit mode) */}
            {isActive && isOver && (
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground pointer-events-none">
                    {x},{y}
                </div>
            )}
        </div>
    );
};
