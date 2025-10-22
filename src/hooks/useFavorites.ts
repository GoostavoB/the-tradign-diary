import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Favorite {
  id: string;
  page_url: string;
  page_title: string;
  page_icon: string;
  display_order: number;
}

const FAVORITES_CACHE_KEY = 'userFavorites:v1';
const MAX_FAVORITES = 12;

export function useFavorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localFavorites, setLocalFavorites] = useState<Favorite[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(FAVORITES_CACHE_KEY);
      if (cached) {
        setLocalFavorites(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Failed to load favorites from cache:', error);
    }
  }, []);

  // Fetch favorites from database
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      
      // Update localStorage cache
      localStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(data));
      setLocalFavorites(data);
      
      return data as Favorite[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async ({ url, title, icon }: { url: string; title: string; icon: string }) => {
      if (!user) throw new Error('Not authenticated');

      // Check current count
      const currentCount = favorites.length;
      if (currentCount >= MAX_FAVORITES) {
        throw new Error(`Maximum ${MAX_FAVORITES} favorites reached. Remove one to add another.`);
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          page_url: url,
          page_title: title,
          page_icon: icon,
          display_order: currentCount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast.success('Added to favorites');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('page_url', url);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
      toast.success('Removed from favorites');
    },
    onError: (error: Error) => {
      toast.error('Failed to remove favorite');
      console.error(error);
    },
  });

  // Reorder favorites mutation
  const reorderFavoritesMutation = useMutation({
    mutationFn: async (reorderedFavorites: Favorite[]) => {
      if (!user) throw new Error('Not authenticated');

      // Update display_order for each favorite individually
      for (let i = 0; i < reorderedFavorites.length; i++) {
        const fav = reorderedFavorites[i];
        const { error } = await supabase
          .from('user_favorites')
          .update({ display_order: i })
          .eq('id', fav.id)
          .eq('user_id', user.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to reorder favorites');
      console.error(error);
    },
  });

  const isFavorite = useCallback(
    (url: string) => {
      return favorites.some(fav => fav.page_url === url);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    (url: string, title: string, icon: string) => {
      if (isFavorite(url)) {
        removeFavoriteMutation.mutate(url);
      } else {
        addFavoriteMutation.mutate({ url, title, icon });
      }
    },
    [isFavorite, addFavoriteMutation, removeFavoriteMutation]
  );

  return {
    favorites: isLoading ? localFavorites : favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    reorderFavorites: reorderFavoritesMutation.mutate,
    isAddingFavorite: addFavoriteMutation.isPending,
    isRemovingFavorite: removeFavoriteMutation.isPending,
    canAddMore: favorites.length < MAX_FAVORITES,
    maxFavorites: MAX_FAVORITES,
  };
}