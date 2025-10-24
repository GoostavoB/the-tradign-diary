import { useState, useEffect } from 'react';
import { Trophy, Star, Target, Zap, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'zap';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  xpReward: number;
}

export const AchievementsPanel = () => {
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_upload',
      title: t('achievements.firstUpload'),
      description: t('achievements.firstUploadDesc'),
      icon: 'star',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      xpReward: 50
    },
    {
      id: 'trade_master',
      title: t('achievements.tradeMaster'),
      description: t('achievements.tradeMasterDesc'),
      icon: 'trophy',
      progress: 0,
      maxProgress: 100,
      unlocked: false,
      xpReward: 500
    },
    {
      id: 'error_tracker',
      title: t('achievements.errorTracker'),
      description: t('achievements.errorTrackerDesc'),
      icon: 'target',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      xpReward: 100
    },
    {
      id: 'social_sharer',
      title: t('achievements.socialSharer'),
      description: t('achievements.socialSharerDesc'),
      icon: 'zap',
      progress: 0,
      maxProgress: 3,
      unlocked: false,
      xpReward: 75
    }
  ]);

  const getIcon = (icon: Achievement['icon']) => {
    switch (icon) {
      case 'star': return Star;
      case 'target': return Target;
      case 'zap': return Zap;
      default: return Trophy;
    }
  };

  return (
    <div className="space-y-4" role="region" aria-labelledby="achievements-heading">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="achievements-heading" className="text-xl font-bold">{t('achievements.title')}</h2>
      </div>

      <ul className="grid gap-3" role="list">
        {achievements.map((achievement) => {
          const Icon = getIcon(achievement.icon);
          const progressPercent = (achievement.progress / achievement.maxProgress) * 100;

          return (
            <Card
              key={achievement.id}
              className={cn(
                "p-4 transition-all",
                achievement.unlocked 
                  ? "bg-primary/5 border-primary/20" 
                  : "opacity-75"
              )}
              role="listitem"
              aria-label={`${achievement.title}: ${achievement.description}. Progress: ${achievement.progress} of ${achievement.maxProgress}. ${achievement.unlocked ? 'Unlocked' : 'Locked'}`}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  achievement.unlocked 
                    ? "bg-gradient-to-br from-primary to-primary-dark" 
                    : "bg-muted"
                )}>
                  {achievement.unlocked ? (
                    <Icon className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      +{achievement.xpReward} XP
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{achievement.progress} / {achievement.maxProgress}</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </ul>
    </div>
  );
};
