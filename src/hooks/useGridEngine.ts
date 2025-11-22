/**
 * useGridEngine Hook
 * 
 * React hook that wraps the GridEngine class and provides state management
 * with persistence to Supabase
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
    GridWidget,
    GridMatrix,
    GridState,
    DropResult,
    GridValidation,
    GRID_CONSTANTS,
} from '@/types/grid';
import { GridEngine } from '@/lib/GridEngine';

const GRID_VERSION = 5; // Schema version for this grid system

interface UseGridEngineOptions {
    subAccountId: string | undefined;
    dashboardType: 'overview' | 'tradeStation';
    defaultWidgets?: GridWidget[];
}

interface UseGridEngineReturn {
    // State
    widgets: GridWidget[];
    matrix: GridMatrix;
    floors: number;
    isLoading: boolean;
    isSaving: boolean;

    // Actions
    dropWidget: (widget: GridWidget, x: number, y: number) => Promise<DropResult>;
    addWidget: (widget: GridWidget) => Promise<boolean>;
    removeWidget: (widgetId: string) => Promise<boolean>;
    resizeWidget: (widgetId: string, newSize: number, newHeight: number) => Promise<boolean>;
    moveWidget: (widgetId: string, x: number, y: number) => Promise<DropResult>;

    // Validation
    canPlace: (widget: GridWidget, x: number, y: number) => boolean;
    validate: () => GridValidation;

    // Persistence
    saveLayout: () => Promise<boolean>;
    resetLayout: () => Promise<boolean>;

    // Utils
    getWidget: (id: string) => GridWidget | undefined;
}

export function useGridEngine({
    subAccountId,
    dashboardType,
    defaultWidgets = [],
}: UseGridEngineOptions): UseGridEngineReturn {
    const [widgets, setWidgets] = useState<GridWidget[]>([]);
    const [matrix, setMatrix] = useState<GridMatrix>([]);
    const [floors, setFloors] = useState<number>(GRID_CONSTANTS.DEFAULT_FLOORS);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const engineRef = useRef<GridEngine | null>(null);

    // Initialize engine
    useEffect(() => {
        engineRef.current = new GridEngine(GRID_CONSTANTS.DEFAULT_FLOORS);
        setMatrix(engineRef.current.getMatrix());
        setFloors(engineRef.current.getFloorCount());
    }, []);

    // Load layout from database
    useEffect(() => {
        if (!subAccountId || !engineRef.current) {
            setIsLoading(false);
            return;
        }

        const loadLayout = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_settings')
                    .select('layout_json')
                    .eq('sub_account_id', subAccountId)
                    .maybeSingle();

                if (error) throw error;

                const layoutData = data?.layout_json as any;
                const dashboardData = layoutData?.dashboard?.[dashboardType];

                if (dashboardData?.gridType === 'fixed-units' && dashboardData?.version === GRID_VERSION) {
                    // Load saved layout
                    const savedWidgets = dashboardData.widgets || [];

                    if (engineRef.current.loadWidgets(savedWidgets)) {
                        setWidgets(engineRef.current.getWidgets());
                        setMatrix(engineRef.current.getMatrix());
                        setFloors(engineRef.current.getFloorCount());
                        console.log(`[GridEngine] Loaded ${savedWidgets.length} widgets for ${dashboardType}`);
                    } else {
                        console.warn('[GridEngine] Failed to load saved widgets, using defaults');
                        loadDefaultWidgets();
                    }
                } else {
                    // No saved layout or outdated - use defaults
                    console.log('[GridEngine] No valid saved layout, using defaults');
                    loadDefaultWidgets();
                }
            } catch (error) {
                console.error('[GridEngine] Error loading layout:', error);
                loadDefaultWidgets();
            } finally {
                setIsLoading(false);
            }
        };

        loadLayout();
    }, [subAccountId, dashboardType]);

    // Load default widgets
    const loadDefaultWidgets = useCallback(() => {
        if (!engineRef.current || defaultWidgets.length === 0) return;

        if (engineRef.current.loadWidgets(defaultWidgets)) {
            setWidgets(engineRef.current.getWidgets());
            setMatrix(engineRef.current.getMatrix());
            setFloors(engineRef.current.getFloorCount());
        }
    }, [defaultWidgets]);

    // Update React state from engine
    const syncState = useCallback(() => {
        if (!engineRef.current) return;

        setWidgets(engineRef.current.getWidgets());
        setMatrix(engineRef.current.getMatrix());
        setFloors(engineRef.current.getFloorCount());
    }, []);

    // Save layout to database
    const saveLayout = useCallback(async (): Promise<boolean> => {
        if (!subAccountId || !engineRef.current) {
            console.warn('[GridEngine] Cannot save: no subAccountId or engine');
            return false;
        }

        setIsSaving(true);

        try {
            // Get current layout from other dashboard type
            const { data: currentData } = await supabase
                .from('user_settings')
                .select('layout_json')
                .eq('sub_account_id', subAccountId)
                .maybeSingle();

            const existingLayout = (currentData?.layout_json as any)?.dashboard || {};

            // Create grid state for this dashboard
            const gridState: GridState = {
                version: GRID_VERSION,
                gridType: 'fixed-units',
                floors: engineRef.current.getFloorCount(),
                columns: GRID_CONSTANTS.COLUMNS,
                widgets: engineRef.current.getWidgets(),
            };

            // Merge with existing dashboard layouts
            const newLayoutData = {
                dashboard: {
                    ...existingLayout,
                    [dashboardType]: gridState,
                },
            };

            const { error } = await supabase
                .from('user_settings')
                .update({
                    layout_json: newLayoutData as any,
                    updated_at: new Date().toISOString(),
                })
                .eq('sub_account_id', subAccountId);

            if (error) throw error;

            console.log(`[GridEngine] Layout saved for ${dashboardType}`);
            toast.success('Layout salvo');
            return true;
        } catch (error) {
            console.error('[GridEngine] Save failed:', error);
            toast.error('Falha ao salvar layout');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [subAccountId, dashboardType]);

    // Drop widget with automatic displacement
    const dropWidget = useCallback(async (
        widget: GridWidget,
        x: number,
        y: number
    ): Promise<DropResult> => {
        if (!engineRef.current) {
            return {
                success: false,
                displacements: { success: false, moves: [] },
                finalPosition: { x: widget.x, y: widget.y },
                error: 'Engine not initialized',
            };
        }

        const result = engineRef.current.dropWidget(widget, x, y);

        if (result.success) {
            syncState();
            await saveLayout();
        } else {
            toast.error(result.error || 'Não foi possível posicionar o widget');
        }

        return result;
    }, [syncState, saveLayout]);

    // Add new widget
    const addWidget = useCallback(async (widget: GridWidget): Promise<boolean> => {
        if (!engineRef.current) return false;

        // Find first available position
        const freeSpace = engineRef.current.findNearestFreeSpace(widget, 0, 0);

        if (!freeSpace) {
            toast.error('Sem espaço disponível na grade');
            return false;
        }

        const result = engineRef.current.dropWidget(widget, freeSpace.x, freeSpace.y);

        if (result.success) {
            syncState();
            await saveLayout();
            toast.success('Widget adicionado');
            return true;
        }

        return false;
    }, [syncState, saveLayout]);

    // Remove widget
    const removeWidget = useCallback(async (widgetId: string): Promise<boolean> => {
        if (!engineRef.current) return false;

        const success = engineRef.current.removeWidget(widgetId);

        if (success) {
            syncState();
            await saveLayout();
            toast.success('Widget removido');
        }

        return success;
    }, [syncState, saveLayout]);

    // Resize widget
    const resizeWidget = useCallback(async (
        widgetId: string,
        newSize: number,
        newHeight: number
    ): Promise<boolean> => {
        if (!engineRef.current) return false;

        const widget = engineRef.current.getWidget(widgetId);
        if (!widget) return false;

        // Validate new size
        if (newSize < widget.minSize) {
            toast.error('Tamanho menor que o mínimo permitido');
            return false;
        }

        // Update widget with new size
        const resizedWidget: GridWidget = {
            ...widget,
            width: newSize,
            height: newHeight,
        };

        // Try to place at same position
        const result = engineRef.current.dropWidget(resizedWidget, widget.x, widget.y);

        if (result.success) {
            syncState();
            await saveLayout();
            toast.success('Widget redimensionado');
            return true;
        } else {
            toast.error('Não foi possível redimensionar');
            return false;
        }
    }, [syncState, saveLayout]);

    // Move widget
    const moveWidget = useCallback(async (
        widgetId: string,
        x: number,
        y: number
    ): Promise<DropResult> => {
        if (!engineRef.current) {
            return {
                success: false,
                displacements: { success: false, moves: [] },
                finalPosition: { x: 0, y: 0 },
                error: 'Engine not initialized',
            };
        }

        const widget = engineRef.current.getWidget(widgetId);
        if (!widget) {
            return {
                success: false,
                displacements: { success: false, moves: [] },
                finalPosition: { x: 0, y: 0 },
                error: 'Widget not found',
            };
        }

        return dropWidget(widget, x, y);
    }, [dropWidget]);

    // Check if can place
    const canPlace = useCallback((widget: GridWidget, x: number, y: number): boolean => {
        if (!engineRef.current) return false;
        return engineRef.current.canPlace(widget, x, y);
    }, []);

    // Validate grid
    const validate = useCallback((): GridValidation => {
        if (!engineRef.current) {
            return { isValid: false, errors: ['Engine not initialized'] };
        }
        return engineRef.current.validate();
    }, []);

    // Reset to default layout
    const resetLayout = useCallback(async (): Promise<boolean> => {
        if (!engineRef.current) return false;

        loadDefaultWidgets();
        return await saveLayout();
    }, [loadDefaultWidgets, saveLayout]);

    // Get widget by ID
    const getWidget = useCallback((id: string): GridWidget | undefined => {
        return engineRef.current?.getWidget(id);
    }, []);

    return {
        widgets,
        matrix,
        floors,
        isLoading,
        isSaving,
        dropWidget,
        addWidget,
        removeWidget,
        resizeWidget,
        moveWidget,
        canPlace,
        validate,
        saveLayout,
        resetLayout,
        getWidget,
    };
}
