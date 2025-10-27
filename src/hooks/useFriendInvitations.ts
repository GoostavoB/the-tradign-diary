import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useFriendInvitations = () => {
  const queryClient = useQueryClient();

  const { data: sentInvitations, isLoading: loadingSent } = useQuery({
    queryKey: ['friend-invitations', 'sent'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friend_invitations')
        .select('*')
        .eq('inviter_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: receivedInvitations, isLoading: loadingReceived } = useQuery({
    queryKey: ['friend-invitations', 'received'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('friend_invitations')
        .select(`
          *,
          inviter:profiles!friend_invitations_inviter_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('invitee_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const sendInvitation = useMutation({
    mutationFn: async (invitee_email: string) => {
      const { data, error } = await supabase.functions.invoke('send-friend-invitation', {
        body: { invitee_email },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-invitations'] });
      toast.success('Invitation sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation');
    },
  });

  const acceptInvitation = useMutation({
    mutationFn: async (invitation_code: string) => {
      const { data, error } = await supabase.functions.invoke('accept-friend-invitation', {
        body: { invitation_code },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friend-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-follows'] });
      toast.success('Friend invitation accepted! 🎉');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept invitation');
    },
  });

  return {
    sentInvitations,
    receivedInvitations,
    loading: loadingSent || loadingReceived,
    sendInvitation: sendInvitation.mutate,
    sendingInvitation: sendInvitation.isPending,
    acceptInvitation: acceptInvitation.mutate,
    acceptingInvitation: acceptInvitation.isPending,
  };
};
