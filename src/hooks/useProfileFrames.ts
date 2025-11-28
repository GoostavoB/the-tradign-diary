import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfileFrame {
  id: string;
  frame_id: string;
  frame_name: string;
  unlock_requirement: string;
  required_level: number | null;
  frame_style: any;
  is_unlocked: boolean;
  is_active: boolean;
}

export const useProfileFrames = () => {
  const { user } = useAuth();
  const [frames, setFrames] = useState<ProfileFrame[]>([]);
  const [activeFrame, setActiveFrame] = useState<ProfileFrame | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFrames = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all frames
      const { data: allFrames } = await supabase
        .from('profile_frames')
        .select('*')
        .order('required_level', { ascending: true });

      // Fetch user's unlocked frames
      const { data: unlockedFrames } = await supabase
        .from('user_profile_frames')
        .select('*')
        .eq('user_id', user.id);

      // Fetch user XP to calculate level
      const { data: xpData } = await supabase
        .from('user_xp_levels')
        .select('total_xp_earned')
        .eq('user_id', user.id)
        .single();

      // Calculate level from total XP
      const calculateLevel = (totalXP: number): number => {
        let level = 1;
        let xpNeeded = 100;
        let totalNeeded = 0;
        
        while (totalNeeded + xpNeeded <= totalXP) {
          totalNeeded += xpNeeded;
          level++;
          xpNeeded = Math.floor(100 * Math.pow(1.5, level - 1));
        }
        
        return level;
      };

      const userLevel = xpData?.total_xp_earned ? calculateLevel(xpData.total_xp_earned) : 1;
      const unlockedIds = new Set(unlockedFrames?.map(f => f.frame_id) || []);

      const formattedFrames = (allFrames || []).map(frame => {
        const unlocked = unlockedFrames?.find(uf => uf.frame_id === frame.frame_id);
        const meetsRequirement = !frame.required_level || userLevel >= frame.required_level;
        
        return {
          ...frame,
          is_unlocked: unlockedIds.has(frame.frame_id) || meetsRequirement,
          is_active: unlocked?.is_active || false,
        };
      });

      setFrames(formattedFrames);
      setActiveFrame(formattedFrames.find(f => f.is_active) || null);
    } catch (error) {
      console.error('Error fetching profile frames:', error);
      toast.error('Failed to load profile frames');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFrames();
  }, [fetchFrames]);

  const selectFrame = async (frameId: string) => {
    if (!user) return;

    try {
      // Deactivate all frames
      await supabase
        .from('user_profile_frames')
        .update({ is_active: false })
        .eq('user_id', user.id);

      // Activate selected frame (insert or update)
      const { error } = await supabase
        .from('user_profile_frames')
        .upsert({
          user_id: user.id,
          frame_id: frameId,
          is_active: true,
        });

      if (error) throw error;

      toast.success('Profile frame updated!');
      fetchFrames();
    } catch (error) {
      console.error('Error selecting frame:', error);
      toast.error('Failed to update profile frame');
    }
  };

  return {
    frames,
    activeFrame,
    loading,
    selectFrame,
    refresh: fetchFrames,
  };
};
