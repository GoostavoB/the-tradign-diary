import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PROFIT_MILESTONES = [
  { amount: 100, tier: 'bronze', xp: 50 },
  { amount: 1000, tier: 'bronze', xp: 100 },
  { amount: 5000, tier: 'silver', xp: 250 },
  { amount: 10000, tier: 'gold', xp: 500 },
  { amount: 15000, tier: 'gold', xp: 750 },
  { amount: 25000, tier: 'platinum', xp: 1000 },
  { amount: 50000, tier: 'platinum', xp: 2000 },
  { amount: 100000, tier: 'diamond', xp: 5000 },
  { amount: 250000, tier: 'diamond', xp: 10000 },
  { amount: 500000, tier: 'diamond', xp: 25000 },
  { amount: 1000000, tier: 'diamond', xp: 50000 },
];

export const useProfitMilestoneBadges = (totalProfitLoss: number, userId?: string) => {
  const { toast } = useToast();
  const processingRef = useRef(false);
  const lastCheckedProfitRef = useRef<number>(0);

  useEffect(() => {
    if (!userId || processingRef.current || totalProfitLoss === lastCheckedProfitRef.current) {
      return;
    }

    const checkMilestones = async () => {
      processingRef.current = true;
      lastCheckedProfitRef.current = totalProfitLoss;

      try {
        // Get already unlocked profit milestones
        const { data: unlockedBadges } = await supabase
          .from('unlocked_badges')
          .select('tier, unlocked_at')
          .eq('user_id', userId)
          .eq('badge_id', 'profit_milestone');

        // Track which amounts we've already unlocked by checking tier + requirement
        const { data: badgeTiers } = await supabase
          .from('badge_tiers')
          .select('tier, requirement_multiplier')
          .eq('badge_id', 'profit_milestone');

        const unlockedAmounts = new Set<number>();
        if (badgeTiers && unlockedBadges) {
          unlockedBadges.forEach(unlocked => {
            const tierInfo = badgeTiers.find(t => t.tier === unlocked.tier);
            if (tierInfo) {
              unlockedAmounts.add(tierInfo.requirement_multiplier);
            }
          });
        }

        // Check which milestones should be unlocked
        for (const milestone of PROFIT_MILESTONES) {
          if (totalProfitLoss >= milestone.amount && !unlockedAmounts.has(milestone.amount)) {
            // Insert badge unlock
            const { error: badgeError } = await supabase
              .from('unlocked_badges')
              .insert({
                user_id: userId,
                badge_id: 'profit_milestone',
                tier: milestone.tier,
                unlocked_at: new Date().toISOString(),
              });

            if (badgeError) {
              console.error('Error unlocking badge:', badgeError);
              continue;
            }

            // Award XP
            const { error: xpError } = await supabase
              .from('user_xp_levels')
              .upsert({
                user_id: userId,
                total_xp: milestone.xp,
              }, {
                onConflict: 'user_id',
                ignoreDuplicates: false,
              });

            if (xpError) {
              console.error('Error awarding XP:', xpError);
            }

            // Show notification
            toast({
              title: '🏆 Profit Milestone Achieved!',
              description: `You've reached $${milestone.amount.toLocaleString()} in total trading profit! +${milestone.xp} XP`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('Error checking profit milestones:', error);
      } finally {
        processingRef.current = false;
      }
    };

    checkMilestones();
  }, [totalProfitLoss, userId, toast]);
};
