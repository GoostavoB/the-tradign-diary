import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CustomWidget {
  id: string;
  user_id: string;
  menu_item_id: string | null;
  widget_type: string;
  title: string;
  description: string | null;
  query_config: any;
  display_config: any;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export const useCustomWidgets = (menuItemId?: string) => {
  const [widgets, setWidgets] = useState<CustomWidget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, [menuItemId]);

  const loadWidgets = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('custom_dashboard_widgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (menuItemId) {
        query = query.eq('menu_item_id', menuItemId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setWidgets(data || []);
    } catch (error) {
      console.error('Error loading custom widgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWidgets = () => {
    loadWidgets();
  };

  return { widgets, loading, refreshWidgets };
};