import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Flame, Sparkles, TrendingUp, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import confetti from 'canvas-confetti';
import { DailyReward } from '@/hooks/useDailyRewards';

interface DailyRewardModalProps {
  open: boolean;
  onClose: () => void;
  reward: DailyReward | null;
  onClaim: () => void;
}

export const DailyRewardModal = ({ open, onClose, reward, onClaim }: DailyRewardModalProps) => {
  if (!reward) return null;

  const handleClaim = () => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#eab308', '#fbbf24', '#fcd34d']
    });
    
    onClaim();
  };

  const getTierInfo = (tier: number) => {
    switch (tier) {
      case 4:
        return { icon: Crown, label: 'Legendary', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-500/10' };
      case 3:
        return { icon: TrendingUp, label: 'Epic', color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-500/10' };
      case 2:
        return { icon: Sparkles, label: 'Rare', color: 'from-blue-500 to-cyan-600', bgColor: 'bg-blue-500/10' };
      default:
        return { icon: Gift, label: 'Common', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-500/10' };
    }
  };

  const tierInfo = getTierInfo(reward.rewardTier);
  const TierIcon = tierInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold gradient-text">
            Daily Login Reward! 🎁
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Streak Counter */}
          <div className="flex items-center justify-center gap-2">
            <Flame className="w-8 h-8 text-orange-500 animate-pulse" />
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">
                {reward.consecutiveDays}
              </p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </div>

          {/* Reward Display */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`relative p-6 rounded-xl ${tierInfo.bgColor} border-2 border-primary/20`}
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className={`bg-gradient-to-r ${tierInfo.color} text-white px-3 py-1`}>
                {tierInfo.label} Reward
              </Badge>
            </div>

            <div className="flex flex-col items-center justify-center gap-3 mt-2">
              <TierIcon className="w-12 h-12 text-primary" />
              
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  +{reward.xpReward}
                </p>
                <p className="text-lg font-semibold text-foreground">XP</p>
              </div>

              {reward.bonusMultiplier > 1 && (
                <Badge variant="secondary" className="mt-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {reward.bonusMultiplier}x Tier Bonus
                </Badge>
              )}
            </div>
          </motion.div>

          {/* Milestone Info */}
          {reward.consecutiveDays % 7 === 0 && (
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20"
            >
              <p className="text-sm font-semibold text-primary">
                🎉 {reward.consecutiveDays === 7 ? 'Weekly' : reward.consecutiveDays === 14 ? 'Bi-weekly' : 'Monthly'} Milestone Bonus!
              </p>
            </motion.div>
          )}

          {/* Next Milestone Preview */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Keep your streak going! 🔥</p>
            {reward.consecutiveDays < 7 && (
              <p className="font-semibold text-foreground">
                Next milestone: Day 7 (200 XP bonus!)
              </p>
            )}
            {reward.consecutiveDays >= 7 && reward.consecutiveDays < 14 && (
              <p className="font-semibold text-foreground">
                Next milestone: Day 14 (300 XP bonus!)
              </p>
            )}
            {reward.consecutiveDays >= 14 && reward.consecutiveDays < 30 && (
              <p className="font-semibold text-foreground">
                Next milestone: Day 30 (500 XP bonus!)
              </p>
            )}
          </div>

          {/* Claim Button */}
          <AnimatePresence>
            {reward.canClaim && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <Button
                  onClick={handleClaim}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all"
                  size="lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Claim Reward
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {reward.alreadyClaimed && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Already claimed today! Come back tomorrow for more rewards 🌟
              </p>
              <Button
                onClick={onClose}
                variant="outline"
                className="mt-4 w-full"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
