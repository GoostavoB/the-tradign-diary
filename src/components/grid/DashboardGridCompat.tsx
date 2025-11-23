/**
 * DashboardGridCompat - Compatibility layer between old Dashboard and new GridEngine
 * 
 * This component accepts the same props as the old DashboardGrid but uses
 * the new GridEngine system internally. It translates between the old
 * position-based system and the new grid-based system.
 */

import React, { useEffect, useMemo } from 'react';
import { useGridEngine } from '@/hooks/useGridEngine';
import { GridContainer } from '@/components/grid';
import { GridWidget as GridWidgetComponent } from '@/components/grid/GridWidget';
import { GridWidget as GridWidgetType } from '@/types/grid';
import { getWidgetGridConfig } from '@/config/widgetGridConfigs';
import { useSubAccount } from '@/contexts/SubAccountContext';

interface DashboardGridCompatProps {
    mode: 'free' | 'adaptive';
    positions: any[];
    order: string[];
    selectedColumnCount: number;
    isCustomizing: boolean;
    activeId: string | null;
    onDragStart?: (event: any) => void;
    onDragEnd?: (event: any) => void;
    onDragCancel?: () => void;
    renderWidget: (widgetId: string) => React.ReactNode;
    onOpenWidgetLibrary?: () => void;
}

export const DashboardGridCompat: React.FC<DashboardGridCompatProps> = ({
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
    onOpenWidgetLibrary,
}) => {
    const { activeSubAccount } = useSubAccount();

    // Convert old positions to GridEngine format
    const gridWidgets = useMemo((): GridWidgetType[] => {
        return order.map((widgetId, index) => {
            const gridConfig = getWidgetGridConfig(widgetId);

            // Calculate grid position from index (simple auto-layout)
            // Place widgets in rows of 12 columns
            const widgetsPerRow = Math.floor(12 / gridConfig.defaultSize);
            const row = Math.floor(index / widgetsPerRow);
            const colInRow = index % widgetsPerRow;
            const x = colInRow * gridConfig.defaultSize;
            const y = row * gridConfig.defaultHeight;

            return {
                id: widgetId,
                x,
                y,
                width: gridConfig.defaultSize,
                height: gridConfig.defaultHeight,
                minSize: gridConfig.minSize,
                type: gridConfig.type,
                hasChart: gridConfig.hasChart,
                hasImage: gridConfig.hasImage,
            };
        });
    }, [order]);

    const {
        widgets,
        floors,
        isLoading,
        dropWidget,
        resizeWidget,
    } = useGridEngine({
        subAccountId: activeSubAccount?.id,
        dashboardType: 'overview',
        defaultWidgets: gridWidgets,
    });

    // Sync widgets when order changes
    useEffect(() => {
        // Grid engine will auto-save, we just need to make sure it's updated
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <GridContainer
            widgets={widgets}
            floors={floors}
            isEditing={isCustomizing}
            onDrop={async (widget, x, y) => {
                await dropWidget(widget, x, y);
            }}
            onDragStart={(widgetId) => {
                if (onDragStart) {
                    onDragStart({ active: { id: widgetId } });
                }
            }}
            onDragEnd={() => {
                onDragEnd?.({ active: { id: activeId }, over: null });
            }}
            renderWidget={(widget) => (
                <GridWidgetComponent
                    key={widget.id}
                    widget={widget}
                    unitSize={60}
                    isEditing={isCustomizing}
                    isDragging={widget.id === activeId}
                    onResize={async (widgetId, newSize, newHeight) => {
                        await resizeWidget(widgetId, newSize, newHeight);
                    }}
                >
                    {renderWidget(widget.id)}
                </GridWidgetComponent>
            )}
        />
    );
};
