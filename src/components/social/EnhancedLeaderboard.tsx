import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Target, Zap, Medal, Crown, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatNumber } from '@/utils/formatNumber';

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_pnl: number;
  win_rate: number;
  total_trades: number;
  streak: number;
  roi: number;
  level: number;
  is_current_user?: boolean;
}

type LeaderboardType = 'pnl' | 'winrate' | 'roi' | 'streak';

export const EnhancedLeaderboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('pnl');
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    loadLeaderboard();
    subscribeToLeaderboard();
  }, [activeTab, timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Call edge function to calculate leaderboard
      const { data, error } = await supabase.functions.invoke('calculate-leaderboard', {
        body: { type: activeTab, timeframe },
      });

      if (error) throw error;

      const leaderboardData = data.leaderboard.map((entry: any, index: number) => ({
        ...entry,
        rank: index + 1,
        is_current_user: entry.user_id === user?.id,
      }));

      setLeaders(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLeaderboard = () => {
    const channel = supabase
      .channel('leaderboard_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trades',
        },
        () => {
          loadLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
    if (rank === 3) return 'from-orange-500/20 to-orange-600/20 border-orange-500/50';
    return '';
  };

  const getMetricValue = (entry: LeaderboardEntry) => {
    switch (activeTab) {
      case 'pnl':
        return `$${entry.total_pnl.toFixed(2)}`;
      case 'winrate':
        return `${entry.win_rate.toFixed(1)}%`;
      case 'roi':
        return `${entry.roi.toFixed(1)}%`;
      case 'streak':
        return `${entry.streak} wins`;
      default:
        return '';
    }
  };

  const getMetricLabel = () => {
    switch (activeTab) {
      case 'pnl':
        return 'Total P&L';
      case 'winrate':
        return 'Win Rate';
      case 'roi':
        return 'ROI';
      case 'streak':
        return 'Current Streak';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Leaderboard</h2>
            <p className="text-sm text-muted-foreground">Top traders in the community</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeframe === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('week')}
          >
            Week
          </Button>
          <Button
            variant={timeframe === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('month')}
          >
            Month
          </Button>
          <Button
            variant={timeframe === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('all')}
          >
            All Time
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeaderboardType)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pnl" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            P&L
          </TabsTrigger>
          <TabsTrigger value="winrate" className="gap-2">
            <Target className="h-4 w-4" />
            Win Rate
          </TabsTrigger>
          <TabsTrigger value="roi" className="gap-2">
            <Zap className="h-4 w-4" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="streak" className="gap-2">
            <Trophy className="h-4 w-4" />
            Streak
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Loading leaderboard...
              </CardContent>
            </Card>
          ) : leaders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No data yet</p>
                <p className="text-sm mt-1">Be the first to trade and climb the ranks!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaders.map((entry) => (
                <Card
                  key={entry.user_id}
                  className={`${entry.is_current_user ? 'ring-2 ring-primary' : ''} ${
                    entry.rank <= 3 ? `bg-gradient-to-r ${getRankColor(entry.rank)}` : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 min-w-[60px]">
                        {entry.rank <= 3 ? (
                          getRankIcon(entry.rank)
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            #{entry.rank}
                          </span>
                        )}
                      </div>

                      <Avatar className="h-12 w-12">
                        <AvatarImage src={entry.avatar_url} />
                        <AvatarFallback>{entry.username?.[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{entry.username}</p>
                          {entry.is_current_user && (
                            <Badge variant="secondary" className="text-xs">You</Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Lvl {entry.level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {entry.total_trades} trades
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold">{getMetricValue(entry)}</p>
                        <p className="text-xs text-muted-foreground">{getMetricLabel()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
