import { Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDailyRewards } from '@/hooks/useDailyRewards';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Floating indicator button that shows when daily reward is available
 */
export const DailyRewardIndicator = () => {
  const { reward, loading, setShowRewardModal } = useDailyRewards();

  // Don't show if loading, no reward, or already claimed
  if (loading || !reward || reward.alreadyClaimed) {
    return null;
  }

  return (
    <AnimatePresence>
      {reward.canClaim && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-24 right-6 z-50"
        >
          <Button
            onClick={() => setShowRewardModal(true)}
            className="relative h-14 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-glow animate-bounce-slow"
          >
            <Gift className="w-5 h-5 mr-2" />
            <span className="font-semibold">Daily Reward</span>
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-1 text-xs">
              +{reward.xpReward} XP
            </Badge>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
