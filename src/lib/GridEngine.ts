/**
 * Grid Engine - Core grid management system
 * 
 * Implements the fixed-unit grid with automatic displacement (iPhone-style)
 * Grid: 12 columns × N rows (expandable)
 * Features:
 * - Occupation tracking matrix
 * - Collision detection
 * - Automatic widget displacement
 * - Placement validation
 */

import {
    GridWidget,
    GridMatrix,
    GridPosition,
    DisplacementPlan,
    DisplacementMove,
    DropResult,
    GridValidation,
    GRID_CONSTANTS,
    WIDGET_SIZE_DIMENSIONS,
    isValidPosition,
} from '@/types/grid';

export class GridEngine {
    private matrix: GridMatrix;
    private floors: number;
    private widgets: Map<string, GridWidget>;

    constructor(initialFloors: number = GRID_CONSTANTS.DEFAULT_FLOORS) {
        this.floors = Math.max(initialFloors, GRID_CONSTANTS.DEFAULT_FLOORS);
        this.matrix = this.createMatrix(this.floors);
        this.widgets = new Map();
    }

    /**
     * Create empty grid matrix
     */
    private createMatrix(rows: number): GridMatrix {
        return Array(rows)
            .fill(null)
            .map(() => Array(GRID_CONSTANTS.COLUMNS).fill(null));
    }

    /**
     * Get current matrix (readonly)
     */
    getMatrix(): GridMatrix {
        return this.matrix.map(row => [...row]);
    }

    /**
     * Get all widgets
     */
    getWidgets(): GridWidget[] {
        return Array.from(this.widgets.values());
    }

    /**
     * Get widget by ID
     */
    getWidget(id: string): GridWidget | undefined {
        return this.widgets.get(id);
    }

    /**
     * Get occupied units for a widget
     */
    getOccupiedUnits(widgetId: string): GridPosition[] {
        const units: GridPosition[] = [];

        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < GRID_CONSTANTS.COLUMNS; x++) {
                if (this.matrix[y][x] === widgetId) {
                    units.push({ x, y });
                }
            }
        }

        return units;
    }

    /**
     * Check if a widget can be placed at the given position
     */
    canPlace(widget: GridWidget, x: number, y: number, excludeWidgetId?: string): boolean {
        const dims = WIDGET_SIZE_DIMENSIONS[widget.width as keyof typeof WIDGET_SIZE_DIMENSIONS] || {
            width: widget.width,
            height: widget.height,
        };

        // Check boundaries
        if (x < 0 || x + dims.width > GRID_CONSTANTS.COLUMNS) {
            return false;
        }

        if (y < 0) {
            return false;
        }

        // Auto-expand floors if needed
        const requiredFloors = y + dims.height;
        if (requiredFloors > this.floors) {
            if (requiredFloors > GRID_CONSTANTS.MAX_FLOORS) {
                return false; // Exceeds maximum
            }
            // Will auto-expand in placeWidget
        }

        // Check for conflicts in the target area
        for (let row = y; row < y + dims.height; row++) {
            // Expand matrix temporarily if needed for checking
            if (row >= this.matrix.length) {
                continue; // Will be expanded later
            }

            for (let col = x; col < x + dims.width; col++) {
                const occupant = this.matrix[row]?.[col];
                if (occupant && occupant !== excludeWidgetId) {
                    return false; // Occupied by another widget
                }
            }
        }

        return true;
    }

    /**
     * Place a widget on the grid
     */
    placeWidget(widget: GridWidget, x: number, y: number): boolean {
        const dims = WIDGET_SIZE_DIMENSIONS[widget.width as keyof typeof WIDGET_SIZE_DIMENSIONS] || {
            width: widget.width,
            height: widget.height,
        };

        // Auto-expand floors if needed
        const requiredFloors = y + dims.height;
        if (requiredFloors > this.floors) {
            this.expandFloors(requiredFloors);
        }

        // Clear old position if widget already exists
        if (this.widgets.has(widget.id)) {
            this.clearWidget(widget.id);
        }

        // Mark cells as occupied
        for (let row = y; row < y + dims.height; row++) {
            for (let col = x; col < x + dims.width; col++) {
                this.matrix[row][col] = widget.id;
            }
        }

        // Update widget position
        const updatedWidget: GridWidget = {
            ...widget,
            x,
            y,
        };

        this.widgets.set(widget.id, updatedWidget);
        return true;
    }

    /**
     * Clear a widget from the grid
     */
    clearWidget(widgetId: string): void {
        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < GRID_CONSTANTS.COLUMNS; x++) {
                if (this.matrix[y][x] === widgetId) {
                    this.matrix[y][x] = null;
                }
            }
        }
        this.widgets.delete(widgetId);
    }

    /**
     * Remove widget from grid
     */
    removeWidget(widgetId: string): boolean {
        if (!this.widgets.has(widgetId)) {
            return false;
        }
        this.clearWidget(widgetId);
        return true;
    }

    /**
     * Expand grid floors
     */
    private expandFloors(newFloorCount: number): void {
        while (this.matrix.length < newFloorCount) {
            this.matrix.push(Array(GRID_CONSTANTS.COLUMNS).fill(null));
        }
        this.floors = newFloorCount;
    }

    /**
     * Find widgets that conflict with a target area
     */
    private findConflicts(targetWidget: GridWidget, x: number, y: number): GridWidget[] {
        const dims = WIDGET_SIZE_DIMENSIONS[targetWidget.width as keyof typeof WIDGET_SIZE_DIMENSIONS] || {
            width: targetWidget.width,
            height: targetWidget.height,
        };

        const conflictIds = new Set<string>();

        for (let row = y; row < y + dims.height; row++) {
            if (row >= this.matrix.length) continue;

            for (let col = x; col < x + dims.width; col++) {
                const occupant = this.matrix[row]?.[col];
                if (occupant && occupant !== targetWidget.id) {
                    conflictIds.add(occupant);
                }
            }
        }

        return Array.from(conflictIds)
            .map(id => this.widgets.get(id))
            .filter((w): w is GridWidget => w !== undefined);
    }

    /**
     * Find nearest free space for a widget (expanding radius search)
     */
    findNearestFreeSpace(
        widget: GridWidget,
        preferX: number,
        preferY: number,
        maxRadius: number = 20
    ): GridPosition | null {
        const dims = WIDGET_SIZE_DIMENSIONS[widget.width as keyof typeof WIDGET_SIZE_DIMENSIONS] || {
            width: widget.width,
            height: widget.height,
        };

        // Try the preferred position first
        if (this.canPlace(widget, preferX, preferY, widget.id)) {
            return { x: preferX, y: preferY };
        }

        // Expanding radius search in reading order (left-to-right, top-to-bottom)
        for (let radius = 1; radius <= maxRadius; radius++) {
            for (let dy = -radius; dy <= radius; dy++) {
                for (let dx = -radius; dx <= radius; dx++) {
                    // Skip if not on the edge of current radius (already checked)
                    if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) {
                        continue;
                    }

                    const testX = preferX + dx;
                    const testY = preferY + dy;

                    if (testY < 0 || testX < 0 || testX + dims.width > GRID_CONSTANTS.COLUMNS) {
                        continue;
                    }

                    if (this.canPlace(widget, testX, testY, widget.id)) {
                        return { x: testX, y: testY };
                    }
                }
            }
        }

        return null; // No free space found
    }

    /**
     * Calculate automatic displacement plan (iPhone-style)
     */
    displaceWidgets(targetWidget: GridWidget, targetX: number, targetY: number): DisplacementPlan {
        const conflicts = this.findConflicts(targetWidget, targetX, targetY);

        if (conflicts.length === 0) {
            return { success: true, moves: [] };
        }

        // Sort conflicts by size (smallest first for easier displacement)
        conflicts.sort((a, b) => {
            const sizeA = a.width * a.height;
            const sizeB = b.width * b.height;
            return sizeA - sizeB;
        });

        const moves: DisplacementMove[] = [];
        const movedWidgets = new Set<string>();

        // Create temporary engine state for simulation
        const originalState = this.saveState();

        try {
            for (const conflictWidget of conflicts) {
                if (movedWidgets.has(conflictWidget.id)) {
                    continue; // Already moved
                }

                // Find free space for this widget
                const newPos = this.findNearestFreeSpace(
                    conflictWidget,
                    targetX,
                    targetY,
                    15 // search radius
                );

                if (!newPos) {
                    // Cannot displace - restore and fail
                    this.restoreState(originalState);
                    return {
                        success: false,
                        moves: [],
                        reason: `Cannot find space for widget ${conflictWidget.id}`,
                    };
                }

                // Move the widget in simulation
                this.clearWidget(conflictWidget.id);
                this.placeWidget(conflictWidget, newPos.x, newPos.y);

                moves.push({
                    widgetId: conflictWidget.id,
                    from: { x: conflictWidget.x, y: conflictWidget.y },
                    to: newPos,
                });

                movedWidgets.add(conflictWidget.id);
            }

            // Success - restore original state (caller will apply moves)
            this.restoreState(originalState);
            return { success: true, moves };

        } catch (error) {
            // Error during displacement - restore
            this.restoreState(originalState);
            return {
                success: false,
                moves: [],
                reason: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Attempt to drop a widget with automatic displacement
     */
    dropWidget(widget: GridWidget, x: number, y: number): DropResult {
        // Check if can place directly
        if (this.canPlace(widget, x, y, widget.id)) {
            this.placeWidget(widget, x, y);
            return {
                success: true,
                displacements: { success: true, moves: [] },
                finalPosition: { x, y },
            };
        }

        // Need to displace
        const displacementPlan = this.displaceWidgets(widget, x, y);

        if (!displacementPlan.success) {
            return {
                success: false,
                displacements: displacementPlan,
                finalPosition: { x: widget.x, y: widget.y },
                error: displacementPlan.reason,
            };
        }

        // Apply displacements
        for (const move of displacementPlan.moves) {
            const movedWidget = this.widgets.get(move.widgetId);
            if (movedWidget) {
                this.placeWidget(movedWidget, move.to.x, move.to.y);
            }
        }

        // Place target widget
        this.placeWidget(widget, x, y);

        return {
            success: true,
            displacements: displacementPlan,
            finalPosition: { x, y },
        };
    }

    /**
     * Validate entire grid state
     */
    validate(): GridValidation {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check for overlaps
        const occupancyCount: { [key: string]: number } = {};

        for (let y = 0; y < this.matrix.length; y++) {
            for (let x = 0; x < GRID_CONSTANTS.COLUMNS; x++) {
                const widgetId = this.matrix[y][x];
                if (widgetId) {
                    const key = `${y},${x}`;
                    occupancyCount[key] = (occupancyCount[key] || 0) + 1;
                    if (occupancyCount[key] > 1) {
                        errors.push(`Overlap detected at position (${x}, ${y})`);
                    }
                }
            }
        }

        // Check each widget
        for (const widget of this.widgets.values()) {
            const dims = WIDGET_SIZE_DIMENSIONS[widget.width as keyof typeof WIDGET_SIZE_DIMENSIONS];

            if (!dims) {
                errors.push(`Invalid widget size for ${widget.id}: ${widget.width}`);
                continue;
            }

            // Check boundaries
            if (widget.x < 0 || widget.x + dims.width > GRID_CONSTANTS.COLUMNS) {
                errors.push(`Widget ${widget.id} exceeds horizontal boundaries`);
            }

            if (widget.y < 0) {
                errors.push(`Widget ${widget.id} has negative Y position`);
            }

            // Check minimum size
            if (widget.width < widget.minSize) {
                warnings.push(`Widget ${widget.id} is smaller than minimum size`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }

    /**
     * Save current grid state
     */
    private saveState(): { matrix: GridMatrix; widgets: Map<string, GridWidget>; floors: number } {
        return {
            matrix: this.matrix.map(row => [...row]),
            widgets: new Map(this.widgets),
            floors: this.floors,
        };
    }

    /**
     * Restore grid state
     */
    private restoreState(state: { matrix: GridMatrix; widgets: Map<string, GridWidget>; floors: number }): void {
        this.matrix = state.matrix;
        this.widgets = state.widgets;
        this.floors = state.floors;
    }

    /**
     * Get current floor count
     */
    getFloorCount(): number {
        return this.floors;
    }

    /**
     * Load widgets from saved state
     */
    loadWidgets(widgets: GridWidget[]): boolean {
        // Clear current state
        this.matrix = this.createMatrix(this.floors);
        this.widgets.clear();

        // Calculate required floors
        const maxY = Math.max(...widgets.map(w => {
            const dims = WIDGET_SIZE_DIMENSIONS[w.width as keyof typeof WIDGET_SIZE_DIMENSIONS] || { height: w.height };
            return w.y + dims.height;
        }), GRID_CONSTANTS.DEFAULT_FLOORS);

        this.expandFloors(maxY);

        // Place each widget
        for (const widget of widgets) {
            if (!this.placeWidget(widget, widget.x, widget.y)) {
                console.error('Failed to place widget during load:', widget.id);
                return false;
            }
        }

        return true;
    }
}
