import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Star, TrendingUp, Zap, Crown } from 'lucide-react';
import { AchievementProgress } from '@/hooks/useAchievementProgress';
import { motion } from 'framer-motion';

interface AchievementCardProps {
  progress: AchievementProgress;
  index: number;
}

export const AchievementCard = ({ progress, index }: AchievementCardProps) => {
  const { achievement, current_progress, max_progress, completed } = progress;

  const getRarityInfo = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return { 
          color: 'from-yellow-500 to-amber-600', 
          bgColor: 'bg-yellow-500/10',
          icon: Crown,
          label: 'Legendary'
        };
      case 'epic':
        return { 
          color: 'from-purple-500 to-pink-600', 
          bgColor: 'bg-purple-500/10',
          icon: Zap,
          label: 'Epic'
        };
      case 'rare':
        return { 
          color: 'from-blue-500 to-cyan-600', 
          bgColor: 'bg-blue-500/10',
          icon: TrendingUp,
          label: 'Rare'
        };
      default:
        return { 
          color: 'from-green-500 to-emerald-600', 
          bgColor: 'bg-green-500/10',
          icon: Star,
          label: 'Common'
        };
    }
  };

  const rarityInfo = getRarityInfo(achievement.rarity);
  const RarityIcon = rarityInfo.icon;
  const progressPercent = (current_progress / max_progress) * 100;
  const isLocked = !completed && achievement.is_secret;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className={`relative p-4 transition-all duration-300 hover:shadow-lg ${
          completed ? `${rarityInfo.bgColor} border-2 border-primary/30` : 'opacity-70'
        }`}
      >
        {/* Rarity Badge */}
        <div className="absolute -top-2 -right-2">
          <Badge className={`bg-gradient-to-r ${rarityInfo.color} text-white px-2 py-1 text-xs`}>
            {rarityInfo.label}
          </Badge>
        </div>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${rarityInfo.bgColor} flex items-center justify-center ${
            completed ? '' : 'grayscale'
          }`}>
            {isLocked ? (
              <Lock className="w-6 h-6 text-muted-foreground" />
            ) : (
              <RarityIcon className={`w-6 h-6 ${completed ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`font-semibold ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                {isLocked ? '???' : achievement.name}
              </h3>
              {achievement.xp_reward > 0 && (
                <Badge variant="secondary" className="text-xs">
                  +{achievement.xp_reward} XP
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {isLocked ? 'Complete prerequisite achievements to unlock' : achievement.description}
            </p>

            {/* Progress Bar */}
            {max_progress > 1 && !isLocked && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{current_progress} / {max_progress}</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}

            {/* Completion Badge */}
            {completed && (
              <Badge className="mt-2 bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                ✓ Completed
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
