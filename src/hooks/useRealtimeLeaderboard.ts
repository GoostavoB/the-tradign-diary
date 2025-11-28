import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface LeaderboardEntry {
  user_id: string;
  rank: number;
  performance_score: number;
  roi: number;
  win_rate: number;
  consistency_index: number;
}

export const useRealtimeLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [rankChanges, setRankChanges] = useState<Map<string, 'up' | 'down'>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('rank', { ascending: true })
      .limit(100);

    if (data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time changes
    const channel: RealtimeChannel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leaderboard_entries',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const oldEntry = entries.find(e => e.user_id === payload.new.user_id);
            const newEntry = payload.new as LeaderboardEntry;

            if (oldEntry) {
              // Detect rank change
              if (newEntry.rank < oldEntry.rank) {
                setRankChanges(prev => new Map(prev).set(newEntry.user_id, 'up'));
              } else if (newEntry.rank > oldEntry.rank) {
                setRankChanges(prev => new Map(prev).set(newEntry.user_id, 'down'));
              }

              // Clear rank change indicator after 3 seconds
              setTimeout(() => {
                setRankChanges(prev => {
                  const updated = new Map(prev);
                  updated.delete(newEntry.user_id);
                  return updated;
                });
              }, 3000);
            }

            // Update entries
            setEntries(prev => {
              const updated = prev.map(e =>
                e.user_id === newEntry.user_id ? newEntry : e
              );
              return updated.sort((a, b) => a.rank - b.rank);
            });
          } else if (payload.eventType === 'INSERT') {
            fetchLeaderboard(); // Refetch all when new entry added
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard, entries]);

  return {
    entries,
    rankChanges,
    loading,
    refresh: fetchLeaderboard,
  };
};
