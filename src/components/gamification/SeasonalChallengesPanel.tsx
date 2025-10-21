import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Trophy, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SeasonalChallenge {
  id: string;
  challenge_type: string;
  title: string;
  description: string;
  current_progress: number;
  target_value: number;
  xp_reward: number;
  cosmetic_reward: string | null;
  is_completed: boolean;
}

export const SeasonalChallengesPanel = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<SeasonalChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonName, setSeasonName] = useState('');

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Get current active season
        const { data: activeSeason } = await supabase
          .from('seasonal_competitions')
          .select('*')
          .eq('is_active', true)
          .single();

        if (!activeSeason) {
          setLoading(false);
          return;
        }

        setSeasonName(activeSeason.season_name);

        // Fetch user's seasonal challenges
        const { data } = await supabase
          .from('seasonal_challenges')
          .select('*')
          .eq('user_id', user.id)
          .eq('season_id', activeSeason.id)
          .order('created_at', { ascending: true });

        setChallenges(data || []);
      } catch (error) {
        console.error('Error fetching seasonal challenges:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seasonal Challenges
          </CardTitle>
          <CardDescription>No active season challenges right now</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const completedCount = challenges.filter(c => c.is_completed).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'seasonal_trades':
        return TrendingUp;
      case 'seasonal_profit':
        return Trophy;
      case 'seasonal_consistency':
        return Target;
      default:
        return Trophy;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {seasonName} Challenges
            </CardTitle>
            <CardDescription>
              Complete these epic challenges for exclusive rewards
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg">
            {completedCount}/{challenges.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {challenges.map(challenge => {
          const Icon = getIcon(challenge.challenge_type);
          const progress = Math.min((challenge.current_progress / challenge.target_value) * 100, 100);

          return (
            <div key={challenge.id} className="space-y-2 p-4 rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{challenge.title}</p>
                      {challenge.is_completed && (
                        <Badge variant="default">✓ Complete</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {challenge.current_progress}/{challenge.target_value}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-2 text-right shrink-0">
                  <Badge variant="outline" className="mb-1">
                    +{challenge.xp_reward} XP
                  </Badge>
                  {challenge.cosmetic_reward && (
                    <Badge variant="secondary" className="block">
                      🎁 {challenge.cosmetic_reward}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
