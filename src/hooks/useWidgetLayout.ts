import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WidgetLayout } from '@/types/widget';
import { DEFAULT_DASHBOARD_LAYOUT, WIDGET_CATALOG } from '@/config/widgetCatalog';
import { toast } from 'sonner';

export const useWidgetLayout = (userId: string | undefined) => {
  const [layout, setLayout] = useState<WidgetLayout[]>(DEFAULT_DASHBOARD_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load layout from database
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadLayout = async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('layout_json')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error loading layout:', error);
          return;
        }

        if (data?.layout_json) {
          // Handle both array format and object format with layout property
          const layoutData = data.layout_json as any;
          if (Array.isArray(layoutData)) {
            setLayout(layoutData as WidgetLayout[]);
          } else if (layoutData.layout && Array.isArray(layoutData.layout)) {
            setLayout(layoutData.layout as WidgetLayout[]);
          }
        }
      } catch (error) {
        console.error('Failed to load layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [userId]);

  // Save layout to database
  const saveLayout = useCallback(async (newLayout: WidgetLayout[]) => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          layout_json: { layout: newLayout } as any,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      toast.success('Dashboard layout saved');
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  }, [userId]);

  // Update layout without saving
  const updateLayout = useCallback((newLayout: WidgetLayout[]) => {
    setLayout(newLayout);
  }, []);

  // Add widget to layout with smart positioning
  const addWidget = useCallback((widgetId: string) => {
    const widget = WIDGET_CATALOG[widgetId];
    if (!widget) return;

    // Check if widget already exists
    if (layout.some(item => item.i === widgetId)) {
      toast.info('Widget already added');
      return;
    }

    const widgetWidth = widget.defaultLayout.w;
    const widgetHeight = widget.defaultLayout.h;
    
    let bestX = 0;
    let bestY = 0;

    // If layout is empty, start at origin
    if (layout.length === 0) {
      bestX = 0;
      bestY = 0;
    } else {
      // Sort existing widgets by position (top to bottom, left to right)
      const sortedLayout = [...layout].sort((a, b) => {
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });

      // Get unique Y levels
      const yLevels = [...new Set(sortedLayout.map(item => item.y))].sort((a, b) => a - b);
      
      let found = false;
      
      // Try to fit widget in existing rows first
      for (const y of yLevels) {
        const itemsInRow = sortedLayout.filter(item => item.y === y);
        
        // Check for gaps in this row
        let currentX = 0;
        for (const item of itemsInRow.sort((a, b) => a.x - b.x)) {
          if (item.x - currentX >= widgetWidth) {
            // Found a gap!
            bestX = currentX;
            bestY = y;
            found = true;
            break;
          }
          currentX = item.x + item.w;
        }
        
        if (found) break;
        
        // Check if there's space at the end of the row
        if (currentX + widgetWidth <= 12) {
          bestX = currentX;
          bestY = y;
          found = true;
          break;
        }
      }
      
      // If no gap found, add to a new row
      if (!found) {
        bestX = 0;
        bestY = Math.max(...sortedLayout.map(item => item.y + item.h), 0);
      }
    }
    
    const newItem: WidgetLayout = {
      i: widgetId,
      x: bestX,
      y: bestY,
      ...widget.defaultLayout,
    };

    const newLayout = [...layout, newItem];
    setLayout(newLayout);
    saveLayout(newLayout);
    toast.success(`${widget.title} added`);
  }, [layout, saveLayout]);

  // Remove widget from layout
  const removeWidget = useCallback((widgetId: string) => {
    const newLayout = layout.filter(item => item.i !== widgetId);
    setLayout(newLayout);
    saveLayout(newLayout);
    
    const widget = WIDGET_CATALOG[widgetId];
    toast.success(`${widget?.title || 'Widget'} removed`);
  }, [layout, saveLayout]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_DASHBOARD_LAYOUT);
    saveLayout(DEFAULT_DASHBOARD_LAYOUT);
    toast.success('Dashboard reset to default');
  }, [saveLayout]);

  // Get active widget IDs
  const activeWidgets = layout.map(item => item.i);

  return {
    layout,
    isLoading,
    isSaving,
    updateLayout,
    saveLayout,
    addWidget,
    removeWidget,
    resetLayout,
    activeWidgets,
  };
};
