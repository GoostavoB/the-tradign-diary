import { Button } from '@/components/ui/button';
import { Twitter, Linkedin, Facebook, Send, MessageCircle, Loader2 } from 'lucide-react';
import { useSocialSharing } from '@/hooks/useSocialSharing';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { staggerContainer, fadeInUp } from '@/utils/animations';
import { spacing } from '@/utils/designTokens';

type Platform = 'twitter' | 'linkedin' | 'facebook' | 'telegram' | 'whatsapp';
type ContentType = 'trade' | 'achievement' | 'milestone' | 'general';

interface QuickShareButtonsProps {
  text: string;
  url?: string;
  contentType?: ContentType;
  contentId?: string;
  compact?: boolean;
}

const platformConfig = [
  { 
    platform: 'twitter' as Platform, 
    icon: Twitter, 
    label: 'Twitter', 
    color: 'hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]' 
  },
  { 
    platform: 'linkedin' as Platform, 
    icon: Linkedin, 
    label: 'LinkedIn', 
    color: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]' 
  },
  { 
    platform: 'facebook' as Platform, 
    icon: Facebook, 
    label: 'Facebook', 
    color: 'hover:bg-[#1877F2]/10 hover:text-[#1877F2]' 
  },
  { 
    platform: 'telegram' as Platform, 
    icon: Send, 
    label: 'Telegram', 
    color: 'hover:bg-[#0088cc]/10 hover:text-[#0088cc]' 
  },
  { 
    platform: 'whatsapp' as Platform, 
    icon: MessageCircle, 
    label: 'WhatsApp', 
    color: 'hover:bg-[#25D366]/10 hover:text-[#25D366]' 
  },
];

export const QuickShareButtons = ({ 
  text, 
  url = window.location.href,
  contentType = 'general',
  contentId,
  compact = false
}: QuickShareButtonsProps) => {
  const { recordShare, getShareUrl, canShare, sharesThisWeek } = useSocialSharing();
  const [sharingPlatform, setSharingPlatform] = useState<Platform | null>(null);
  const { success, error: errorHaptic } = useHapticFeedback();

  const handleShare = async (platform: Platform) => {
    if (!canShare) {
      errorHaptic();
      return;
    }

    success();
    setSharingPlatform(platform);

    // Open share window
    const shareUrl = getShareUrl(platform, text, url);
    const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400');

    // Wait a bit for user to share, then record
    setTimeout(async () => {
      if (shareWindow) {
        shareWindow.close();
      }
      
      await recordShare(platform, contentType, contentId);
      success();
      setSharingPlatform(null);
    }, 3000);
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3"
    >
      <div className={`grid ${compact ? 'grid-cols-5 gap-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3'}`}>
        {platformConfig.map(({ platform, icon: Icon, label, color }, index) => (
          <motion.div key={platform} variants={fadeInUp}>
            <Button
              variant="outline"
              size={compact ? "sm" : "default"}
              onClick={() => handleShare(platform)}
              disabled={!canShare || sharingPlatform !== null}
              className={`${color} transition-all w-full min-h-[44px] ${compact ? 'p-2' : ''}`}
              aria-label={`Share on ${label}`}
            >
              {sharingPlatform === platform ? (
                <Loader2 className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} animate-spin`} />
              ) : (
                <Icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
              )}
              {!compact && <span className="ml-2 hidden sm:inline">{label}</span>}
            </Button>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        variants={fadeInUp}
        className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground px-1"
      >
        <span className="font-medium">+50 XP per share</span>
        <span className={`font-semibold ${canShare ? 'text-primary' : 'text-destructive'}`}>
          {sharesThisWeek}/3 this week
        </span>
      </motion.div>
    </motion.div>
  );
};
