import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, TrendingUp, Flame, Star, X, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Confetti } from './gamification/Confetti';

interface WeeklyStats {
  xpGained: number;
  achievementsUnlocked: number;
  challengesCompleted: number;
  bestTrade: {
    symbol: string;
    pnl: number;
    roi: number;
  } | null;
  nextGoal: string;
}

export const WeeklySummaryRecap = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    checkAndShowRecap();
  }, [user]);

  const checkAndShowRecap = async () => {
    if (!user) return;

    const lastRecapKey = `weekly_recap_${user.id}`;
    const lastRecapDate = localStorage.getItem(lastRecapKey);
    const now = new Date();
    const dayOfWeek = now.getDay();
    
    // Show recap on Monday (1) or Sunday (0) evening
    const shouldShow = (dayOfWeek === 1 || dayOfWeek === 0) && 
                       (!lastRecapDate || 
                        new Date(lastRecapDate).getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (shouldShow) {
      const weeklyStats = await fetchWeeklyStats();
      if (weeklyStats) {
        setStats(weeklyStats);
        setShow(true);
        setShowConfetti(weeklyStats.xpGained > 100);
        localStorage.setItem(lastRecapKey, now.toISOString());
      }
    }
  };

  const fetchWeeklyStats = async (): Promise<WeeklyStats | null> => {
    if (!user) return null;

    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // Fetch XP gained this week
      const { data: xpData } = await supabase
        .from('xp_activity_log')
        .select('xp_earned')
        .eq('user_id', user.id)
        .gte('created_at', oneWeekAgo.toISOString());

      const xpGained = xpData?.reduce((sum, log) => sum + (log.xp_earned || 0), 0) || 0;

      // Fetch achievements unlocked this week
      const { count: achievementsCount } = await supabase
        .from('unlocked_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('unlocked_at', oneWeekAgo.toISOString());

      // Fetch challenges completed this week
      const { data: challengesData } = await supabase
        .from('daily_challenges')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .gte('completed_at', oneWeekAgo.toISOString());

      // Fetch best trade this week
      const { data: tradesData } = await supabase
        .from('trades')
        .select('symbol, pnl, roi')
        .eq('user_id', user.id)
        .gte('trade_date', oneWeekAgo.toISOString())
        .order('pnl', { ascending: false })
        .limit(1)
        .single();

      // Calculate next goal
      const { data: progression } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let nextGoal = "Keep trading to level up!";
      if (progression) {
        if (progression.daily_streak < 7) {
          nextGoal = `Maintain a ${7 - progression.daily_streak} more day streak for +100 XP`;
        } else if (progression.rank === 'rookie_trader') {
          nextGoal = "Complete 10 trades to reach Active Trader rank";
        }
      }

      return {
        xpGained,
        achievementsUnlocked: achievementsCount || 0,
        challengesCompleted: challengesData?.length || 0,
        bestTrade: tradesData || null,
        nextGoal
      };
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return null;
    }
  };

  if (!show || !stats) return null;

  return (
    <>
      {showConfetti && <Confetti active={showConfetti} />}
      
      <Dialog open={show} onOpenChange={setShow}>
        <DialogContent className="max-w-2xl border-primary/20">
          <button
            onClick={() => setShow(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 pt-6"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block"
              >
                <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Weekly Recap</h2>
              <p className="text-muted-foreground">
                Here's how you performed this week
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center glass-subtle">
                <div className="text-3xl font-bold text-primary mb-1">
                  +{stats.xpGained}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Star className="w-4 h-4" />
                  XP Earned
                </div>
              </Card>

              <Card className="p-4 text-center glass-subtle">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.achievementsUnlocked}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Achievements
                </div>
              </Card>

              <Card className="p-4 text-center glass-subtle">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.challengesCompleted}
                </div>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4" />
                  Challenges
                </div>
              </Card>
            </div>

            {stats.bestTrade && (
              <Card className="p-6 glass-strong border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold">Best Trade of the Week</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{stats.bestTrade.symbol}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      ROI: {stats.bestTrade.roi.toFixed(2)}%
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    +${stats.bestTrade.pnl.toFixed(2)}
                  </Badge>
                </div>
              </Card>
            )}

            <Card className="p-6 bg-primary/10 border-primary/30">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Next Goal
              </h3>
              <p className="text-sm text-muted-foreground">{stats.nextGoal}</p>
            </Card>

            <div className="flex gap-3">
              <Button 
                className="flex-1" 
                onClick={() => setShow(false)}
              >
                Continue Trading
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Implement share functionality
                  alert('Share feature coming soon!');
                }}
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
};
