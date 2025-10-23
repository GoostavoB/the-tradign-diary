import { Award, Trophy, Star, TrendingUp, Target, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AchievementBadgeProps {
  achievement: {
    id: string;
    name: string;
    description: string;
    icon: string;
    progress: number;
    total: number;
    unlocked: boolean;
    points: number;
  };
}

const iconMap: Record<string, any> = {
  trophy: Trophy,
  star: Star,
  trending: TrendingUp,
  target: Target,
  zap: Zap,
  award: Award,
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Award;
  const progress = (achievement.progress / achievement.total) * 100;

  return (
    <Card className={`p-4 transition-all ${achievement.unlocked ? 'border-primary' : 'opacity-60'}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${achievement.unlocked ? 'bg-primary/20' : 'bg-muted'}`}>
          <Icon className={`h-6 w-6 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold">{achievement.name}</h4>
            <p className="text-sm text-muted-foreground">{achievement.description}</p>
          </div>

          {!achievement.unlocked && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{achievement.progress} / {achievement.total}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">{achievement.points} points</span>
            {achievement.unlocked && (
              <span className="text-xs text-green-500 font-medium">✓ Unlocked</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
