/**
 * Grid Engine Type Definitions
 * 
 * This file defines the core types for the fixed-unit grid system.
 * Grid structure: 12 columns × N rows (starting with 6 rows/floors)
 * Valid widget sizes: 1, 2, 4, 6, 8, 10, 12, 24 units
 */

// Widget sizes in units (based on spec)
export type WidgetSize = 1 | 2 | 4 | 6 | 8 | 10 | 12 | 24;

// Widget types for density-based size restrictions
export type WidgetType = 'simple' | 'visual' | 'calc';

// Grid position (x = column 0-11, y = row 0-based)
export interface GridPosition {
    x: number; // Column position (0-11 for 12-column grid)
    y: number; // Row position (0-based, starts at 0)
}

// Widget dimensions on the grid
export interface GridDimensions {
    width: number;  // Width in horizontal units
    height: number; // Height in vertical units (rows)
}

// Complete widget configuration for the grid
export interface GridWidget {
    id: string;
    x: number; // Column position (0-11)
    y: number; // Row position (0-based)
    width: number; // Size in horizontal units
    height: number; // Size in vertical units (rows occupied)
    minSize: WidgetSize; // Minimum allowed size based on content
    type: WidgetType; // Widget type for validation
    hasChart: boolean; // Contains chart?
    hasImage: boolean; // Contains image?
}

// Grid configuration metadata for widget catalog
export interface WidgetGridConfig {
    type: WidgetType;
    hasChart: boolean;
    hasImage: boolean;
    minSize: WidgetSize; // Minimum size based on density
    defaultSize: WidgetSize; // Default size when added
    defaultHeight: number; // Default height in rows
}

// Grid matrix: [row][col] = widgetId | null
// null = empty cell, string = occupied by widget with that ID
export type GridMatrix = (string | null)[][];

// Grid unit reference (specific cell in the matrix)
export interface GridUnit {
    x: number;
    y: number;
    occupied: boolean;
    widgetId: string | null;
}

// Displacement plan for automatic reorganization
export interface DisplacementMove {
    widgetId: string;
    from: GridPosition;
    to: GridPosition;
}

export interface DisplacementPlan {
    moves: DisplacementMove[];
    success: boolean;
    reason?: string; // Why displacement failed (if success = false)
}

// Result of a drop operation
export interface DropResult {
    success: boolean;
    displacements: DisplacementPlan;
    finalPosition: GridPosition;
    error?: string;
}

// Grid validation result
export interface GridValidation {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}

// Grid state for persistence
export interface GridState {
    version: number; // Schema version for migrations
    gridType: 'fixed-units';
    floors: number; // Number of rows
    columns: number; // Always 12 for now
    widgets: GridWidget[];
}

// Dashboard-specific grid layouts
export interface DashboardLayouts {
    overview: GridState;
    tradeStation: GridState;
}

// Widget size dimension mappings based on spec
// Maps unit count to actual width × height on grid
export const WIDGET_SIZE_DIMENSIONS: Record<WidgetSize, GridDimensions> = {
    1: { width: 1, height: 1 },   // 1 unit = 1×1
    2: { width: 2, height: 1 },   // 2 units = 2×1
    4: { width: 2, height: 2 },   // 4 units = 2×2 block
    6: { width: 3, height: 2 },   // 6 units = 3×2
    8: { width: 4, height: 2 },   // 8 units = 4×2
    10: { width: 5, height: 2 },  // 10 units = 5×2
    12: { width: 6, height: 2 },  // 12 units = 6×2 (half row)
    24: { width: 12, height: 2 }, // 24 units = 12×2 (full width, 2 rows)
};

// Constants
export const GRID_CONSTANTS = {
    COLUMNS: 12, // Total horizontal units
    DEFAULT_FLOORS: 6, // Starting number of rows
    MAX_FLOORS: 50, // Maximum expandable rows (prevent infinite growth)
    MIN_WIDGET_SIZE_VISUAL: 4, // Minimum size for widgets with charts/images
    MIN_WIDGET_SIZE_CALC: 4, // Minimum size for calculation widgets
    MIN_WIDGET_SIZE_SIMPLE: 1, // Minimum size for simple widgets
} as const;

// Helper type guards
export function isValidWidgetSize(size: number): size is WidgetSize {
    return [1, 2, 4, 6, 8, 10, 12, 24].includes(size);
}

export function isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < GRID_CONSTANTS.COLUMNS && y >= 0;
}

// Get minimum size based on widget configuration
export function getMinimumSize(config: WidgetGridConfig): WidgetSize {
    if (config.hasChart || config.hasImage) {
        return Math.max(config.minSize, GRID_CONSTANTS.MIN_WIDGET_SIZE_VISUAL) as WidgetSize;
    }
    if (config.type === 'calc') {
        return Math.max(config.minSize, GRID_CONSTANTS.MIN_WIDGET_SIZE_CALC) as WidgetSize;
    }
    return config.minSize;
}
