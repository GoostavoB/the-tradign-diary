/**
 * GridDashboardDemo - Simple demo of the Grid Engine system
 * 
 * This is a standalone demo to test the grid system before full integration
 */

import { useState } from 'react';
import { useGridEngine } from '@/hooks/useGridEngine';
import { GridContainer } from '@/components/grid';
import { Button } from '@/components/ui/button';
import { DEFAULT_OVERVIEW_LAYOUT } from '@/config/defaultGridLayouts';
import { getWidgetGridConfig } from '@/config/widgetGridConfigs';
import { WIDGET_CATALOG } from '@/config/widgetCatalog';
import { Card } from '@/components/ui/card';
import { Edit, Save, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { useSubAccount } from '@/contexts/SubAccountContext';

export const GridDashboardDemo = () => {
    const { activeSubAccount } = useSubAccount();
    const [isEditing, setIsEditing] = useState(false);

    // Initialize grid engine with default layout
    const {
        widgets,
        floors,
        isLoading,
        dropWidget,
        saveLayout,
    } = useGridEngine({
        subAccountId: activeSubAccount?.id,
        dashboardType: 'overview',
        defaultWidgets: DEFAULT_OVERVIEW_LAYOUT,
    });

    const handleSave = async () => {
        await saveLayout();
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-lg">Loading grid...</div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-4 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Grid Engine Demo</h1>
                        <p className="text-sm text-muted-foreground">
                            {widgets.length} widgets • {floors} floors • 12 columns
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Layout
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Customize
                            </Button>
                        )}
                    </div>
                </div>

                {/* Grid Container */}
                <GridContainer
                    widgets={widgets}
                    floors={floors}
                    isEditing={isEditing}
                    onDrop={async (widget, x, y) => {
                        await dropWidget(widget, x, y);
                    }}
                    renderWidget={(widget) => {
                        const catalogEntry = WIDGET_CATALOG[widget.id];
                        if (!catalogEntry) return null;

                        const WidgetComponent = catalogEntry.component;

                        return (
                            <div key={widget.id} className="w-full h-full">
                                <Card className="w-full h-full p-4">
                                    <h3 className="font-semibold mb-2">{catalogEntry.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {catalogEntry.description}
                                    </p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        Position: ({widget.x}, {widget.y}) | Size: {widget.width}×{widget.height}
                                    </div>
                                </Card>
                            </div>
                        );
                    }}
                />

                {/* Debug Info */}
                {isEditing && (
                    <Card className="p-4 bg-muted/50">
                        <h3 className="font-semibold mb-2">Debug Info</h3>
                        <pre className="text-xs overflow-auto max-h-40">
                            {JSON.stringify(
                                widgets.map(w => ({ id: w.id, x: w.x, y: w.y, w: w.width, h: w.height })),
                                null,
                                2
                            )}
                        </pre>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};
