import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useFriendChallenges = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['friend-challenge-notifications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friend_challenge_notifications')
        .select(`
          *,
          challenger:profiles!friend_challenge_notifications_challenger_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const { data: rivals } = useQuery({
    queryKey: ['user-rivals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_rivals')
        .select(`
          *,
          rival:profiles!user_rivals_rival_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('friend_challenge_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-challenge-notifications'] });
    },
  });

  const challengeRival = useMutation({
    mutationFn: async ({ rival_user_id, challenge_message }: { rival_user_id: string; challenge_message?: string }) => {
      const { data, error } = await supabase.functions.invoke('challenge-rival', {
        body: { rival_user_id, challenge_message },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-rivals'] });
      toast.success('Challenge sent! 🔥');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send challenge');
    },
  });

  // Real-time subscription for new notifications
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('friend-challenge-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'friend_challenge_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload: any) => {
            queryClient.invalidateQueries({ queryKey: ['friend-challenge-notifications'] });
            toast.success(payload.new.message, { duration: 5000 });
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return {
    notifications,
    rivals,
    loading: isLoading,
    unreadCount,
    markAsRead: markAsRead.mutate,
    challengeRival: challengeRival.mutate,
    challengingRival: challengeRival.isPending,
  };
};
