import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, ArrowRight, TrendingUp, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const GoalInsightCard = memo(() => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const { data: goal, isLoading } = useQuery({
    queryKey: ['active-goal', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('trading_goals')
        .select('*')
        .eq('user_id', user.id)
        .gte('deadline', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleClick = () => {
    navigate('/goals');
  };

  if (authLoading || (isLoading && user)) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-4 bg-muted rounded w-5/6"></div>
        </div>
      </Card>
    );
  }

  if (!goal) {
    return (
      <Card 
        className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
        onClick={handleClick}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Target className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Your Goals</h3>
            </div>
            <Badge variant="default" className="text-xs shrink-0">
              Personal
            </Badge>
          </div>

          <div className="space-y-3 py-2">
            <Trophy className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-center text-muted-foreground">
              No active goals yet
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full h-8 text-xs gap-1 group-hover:gap-2 transition-all"
          >
            Create Your First Goal
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </Card>
    );
  }

  const progress = Math.min(100, (goal.current_value / goal.target_value) * 100);
  const isCompleted = progress >= 100;

  const getGoalTypeLabel = (type: string) => {
    switch(type) {
      case 'profit': return 'Profit Target';
      case 'win_rate': return 'Win Rate';
      case 'trades': return 'Trade Count';
      case 'streak': return 'Win Streak';
      case 'roi': return 'ROI Target';
      default: return 'Goal';
    }
  };

  const formatGoalValue = (type: string, value: number) => {
    switch(type) {
      case 'profit': return `$${value.toLocaleString()}`;
      case 'win_rate': return `${value.toFixed(1)}%`;
      case 'trades': return value.toString();
      case 'streak': return `${value} wins`;
      case 'roi': return `${value.toFixed(1)}%`;
      default: return value.toString();
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      onClick={handleClick}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Target className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm line-clamp-1">{goal.title}</h3>
          </div>
          <Badge variant="default" className="text-xs shrink-0">
            Personal
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">{getGoalTypeLabel(goal.goal_type)}</span>
            <span className="text-lg font-bold text-foreground tabular-nums">
              {formatGoalValue(goal.goal_type, goal.current_value)}
            </span>
            <span className="text-xs text-muted-foreground">
              / {formatGoalValue(goal.goal_type, goal.target_value)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isCompleted ? 'bg-success' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>

          <div className="pt-1">
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {isCompleted 
                ? '🎉 Goal achieved! Time to set a new challenge' 
                : `${progress.toFixed(0)}% complete - Keep pushing!`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className={`text-xs font-medium ${isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
            {isCompleted ? (
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Completed
              </span>
            ) : (
              `${(goal.target_value - goal.current_value).toFixed(0)} to go`
            )}
          </span>
          <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 group-hover:gap-2 transition-all">
            View Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
});

GoalInsightCard.displayName = 'GoalInsightCard';
