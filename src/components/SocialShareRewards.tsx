import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { Twitter, Linkedin, Facebook, Share2, CheckCircle2, Gift } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  shareUrl: (text: string, url: string) => string;
  reward: number;
}

export const SocialShareRewards = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [sharedPlatforms, setSharedPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [totalCredits, setTotalCredits] = useState<number>(0);

  // Load shared platforms for current week
  useEffect(() => {
    const loadSharedPlatforms = async () => {
      if (!user) return;

      try {
        // Get Monday of current week
        const today = new Date();
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        const weekStart = monday.toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('social_shares')
          .select('platform')
          .eq('user_id', user.id)
          .eq('week_start', weekStart);

        if (error) throw error;

        const platforms = new Set(data?.map(s => s.platform) || []);
        setSharedPlatforms(platforms);
      } catch (error) {
        console.error('Error loading shared platforms:', error);
      }
    };

    loadSharedPlatforms();
  }, [user]);

  const platforms: SocialPlatform[] = [
    {
      name: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "hover:text-[#1DA1F2]",
      shareUrl: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      reward: 2
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "hover:text-[#0A66C2]",
      shareUrl: (text, url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      reward: 2
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "hover:text-[#1877F2]",
      shareUrl: (text, url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      reward: 2
    }
  ];

  const handleShare = async (platform: SocialPlatform) => {
    if (!user) {
      toast.error('Please login to claim rewards');
      return;
    }

    setLoading(platform.name);

    try {
      const shareText = t('social.shareText') || "Check out The Trading Diary - AI-powered crypto trading journal!";
      const shareUrl = window.location.origin;
      
      // Open share window
      const shareWindow = window.open(
        platform.shareUrl(shareText, shareUrl),
        '_blank',
        'width=600,height=400'
      );

      // Wait a moment to ensure user completes the share
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Record the share in database
      const { data, error } = await supabase.rpc('record_social_share', {
        p_platform: platform.name
      });

      if (error) throw error;

      const result = data as { success: boolean; message: string; rewards: number; total_credits?: number };

      if (result.success) {
        // Mark as shared locally
        setSharedPlatforms(prev => new Set(prev).add(platform.name));
        setTotalCredits(result.total_credits || 0);

        toast.success(t('social.shareSuccess', { platform: platform.name, uploads: platform.reward }), {
          description: `${t('social.shareRewardDescription')} Total: ${result.total_credits} credits`,
          icon: <Gift className="h-5 w-5 text-primary" />
        });
      } else {
        toast.info(result.message);
      }

      // Close the share window if still open
      if (shareWindow && !shareWindow.closed) {
        shareWindow.close();
      }
    } catch (error) {
      console.error('Error recording share:', error);
      toast.error('Failed to record share. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const totalRewards = Array.from(sharedPlatforms).reduce((sum, platformName) => {
    const platform = platforms.find(p => p.name === platformName);
    return sum + (platform?.reward || 0);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          <CardTitle>{t('social.shareRewards')}</CardTitle>
        </div>
        <CardDescription>
          {t('social.shareDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reward Summary */}
        {totalRewards > 0 && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" />
                <span className="font-semibold">{t('social.earnedRewards')}</span>
              </div>
              <span className="text-2xl font-bold text-primary">+{totalRewards}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('social.uploadsEarned')}
            </p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="grid gap-3">
          {platforms.map((platform) => {
            const isShared = sharedPlatforms.has(platform.name);
            
            return (
              <Button
                key={platform.name}
                variant={isShared ? "outline" : "default"}
                className={`w-full justify-between ${platform.color} transition-colors`}
                onClick={() => handleShare(platform)}
                disabled={isShared || loading === platform.name}
              >
                <div className="flex items-center gap-2">
                  {platform.icon}
                  <span>{t('social.shareOn', { platform: platform.name })}</span>
                </div>
                {isShared ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <span className="text-sm font-semibold">+{platform.reward} uploads</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          {t('social.shareLimit')}
        </div>
      </CardContent>
    </Card>
  );
};
