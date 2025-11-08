import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { InviteFriendsModal } from '@/components/gamification/InviteFriendsModal';
import { Users, Trophy, TrendingUp, Zap, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const FriendLeaderboard = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  const { data: friendsData, isLoading: loadingFriends } = useQuery({
    queryKey: ['friend-leaderboard'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get friends (people I follow who follow me back)
      const { data: follows } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!follows) return [];

      const friendIds = follows.map(f => f.following_id);
      friendIds.push(user.id); // Include current user

      // Get leaderboard entries for friends in current season
      const { data: season } = await supabase
        .from('seasonal_competitions')
        .select('id')
        .eq('is_active', true)
        .single();

      if (!season) return [];

      const { data: entries, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          profiles!leaderboard_entries_user_id_fkey(
            id,
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('season_id', season.id)
        .in('user_id', friendIds)
        .is('group_id', null)
        .order('performance_score', { ascending: false });

      if (error) throw error;
      return entries;
    },
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500 to-orange-500';
    if (rank === 2) return 'from-gray-400 to-gray-500';
    if (rank === 3) return 'from-orange-600 to-orange-700';
    return 'from-primary/20 to-primary/10';
  };

  if (loadingFriends) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <>
      <InviteFriendsModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />

      <div className="container mx-auto py-6 space-y-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Friend Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Compete with your trading buddies
            </p>
          </div>
          <Button onClick={() => setInviteModalOpen(true)} size="lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Friends
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Friends</p>
                <p className="text-2xl font-bold">{(friendsData?.length || 0) - 1}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-2xl font-bold">-</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Challenges</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Leaderboard */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            {!friendsData || friendsData.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Friends Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Invite friends to start competing on the leaderboard!
                </p>
                <Button onClick={() => setInviteModalOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Friends
                </Button>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="space-y-4">
                  {friendsData.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-lg glass-subtle ${
                        entry.rank <= 3 ? `bg-gradient-to-r ${getRankColor(entry.rank)}` : ''
                      }`}
                    >
                      <div className={`text-2xl font-bold w-12 text-center ${
                        entry.rank <= 3 ? 'text-white' : ''
                      }`}>
                        #{entry.rank}
                      </div>

                      <Avatar className="w-12 h-12">
                        <AvatarImage src={(entry as any).profiles?.avatar_url} />
                        <AvatarFallback>
                          {(entry as any).profiles?.full_name?.[0] || (entry as any).profiles?.username?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${entry.rank <= 3 ? 'text-white' : ''}`}>
                          {(entry as any).profiles?.full_name || (entry as any).profiles?.username || 'Anonymous'}
                        </p>
                        <p className={`text-sm ${entry.rank <= 3 ? 'text-white/80' : 'text-muted-foreground'}`}>
                          Score: {entry.performance_score.toFixed(2)}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`w-4 h-4 ${entry.rank <= 3 ? 'text-white' : 'text-primary'}`} />
                          <span className={`font-semibold ${entry.rank <= 3 ? 'text-white' : ''}`}>
                            {entry.roi.toFixed(2)}%
                          </span>
                        </div>
                        <p className={`text-sm ${entry.rank <= 3 ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {entry.win_rate.toFixed(1)}% Win Rate
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <Card className="p-12 text-center">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Friend Groups Coming Soon</h3>
              <p className="text-muted-foreground">
                Create custom groups and compete with specific sets of friends!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default FriendLeaderboard;
