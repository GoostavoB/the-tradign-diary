/**
 * GridDashboardWrapper - Bridge between Grid Engine and existing Dashboard widgets
 * 
 * This component wraps the Grid Engine and renders existing widget components
 * within the grid system, maintaining compatibility with current Dashboard logic
 */

import React, { useCallback, useMemo } from 'react';
import { useGridEngine } from '@/hooks/useGridEngine';
import { GridContainer } from '@/components/grid';
import { GridWidget as GridWidgetComponent } from '@/components/grid/GridWidget';
import { GridWidget as GridWidgetType } from '@/types/grid';
import { WIDGET_CATALOG } from '@/config/widgetCatalog';
import { DEFAULT_OVERVIEW_LAYOUT } from '@/config/defaultGridLayouts';

interface GridDashboardWrapperProps {
    subAccountId: string | undefined;
    dashboardType: 'overview' | 'tradeStation';
    isCustomizing: boolean;
    widgetProps: Record<string, any>; // Props to pass to individual widgets
    onAddWidget?: (widgetId: string) => void;
    onRemoveWidget?: (widgetId: string) => void;
}

export const GridDashboardWrapper: React.FC<GridDashboardWrapperProps> = ({
    subAccountId,
    dashboardType,
    isCustomizing,
    widgetProps = {},
    onAddWidget,
    onRemoveWidget,
}) => {
    const {
        widgets,
        floors,
        isLoading,
        dropWidget,
        removeWidget: removeGridWidget,
        resizeWidget,
    } = useGridEngine({
        subAccountId,
        dashboardType,
        defaultWidgets: dashboardType === 'overview' ? DEFAULT_OVERVIEW_LAYOUT : [],
    });

    // Handle widget removal
    const handleRemoveWidget = useCallback(async (widgetId: string) => {
        await removeGridWidget(widgetId);
        onRemoveWidget?.(widgetId);
    }, [removeGridWidget, onRemoveWidget]);

    // Handle widget resize
    const handleResizeWidget = useCallback(async (widgetId: string, newSize: number, newHeight: number) => {
        await resizeWidget(widgetId, newSize, newHeight);
    }, [resizeWidget]);

    // Render individual widget content
    const renderWidgetContent = useCallback((widget: GridWidgetType) => {
        const catalogEntry = WIDGET_CATALOG[widget.id];
        if (!catalogEntry) {
            console.warn(`Widget ${widget.id} not found in catalog`);
            return (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Widget not found: {widget.id}
                </div>
            );
        }

        const WidgetComponent = catalogEntry.component;
        const props = widgetProps[widget.id] || {};

        return <WidgetComponent {...props} />;
    }, [widgetProps]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-sm text-muted-foreground">Loading dashboard...</div>
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
            renderWidget={(widget) => (
                <GridWidgetComponent
                    key={widget.id}
                    widget={widget}
                    unitSize={60} // Will be calculated dynamically
                    isEditing={isCustomizing}
                    onResize={handleResizeWidget}
                >
                    {renderWidgetContent(widget)}
                </GridWidgetComponent>
            )}
        />
    );
};
