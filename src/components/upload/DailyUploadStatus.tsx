import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Crown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDailyUploadLimit } from '@/hooks/useDailyUploadLimit';
import { useState } from 'react';
import { UpgradePrompt } from '@/components/UpgradePrompt';

interface DailyUploadStatusProps {
  className?: string;
}

export const DailyUploadStatus = ({ className }: DailyUploadStatusProps) => {
  const { uploadsToday, dailyLimit, remainingUploads, canUpload, isLoading } = useDailyUploadLimit();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  if (isLoading) {
    return null;
  }

  const percentageUsed = dailyLimit > 0 ? (uploadsToday / dailyLimit) * 100 : 0;
  const isNearLimit = percentageUsed >= 80;
  const isAtLimit = !canUpload;

  return (
    <>
      <Card className={cn('p-4 border-border/50 bg-card/50', className)}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                'p-2 rounded-lg transition-colors',
                isAtLimit ? 'bg-destructive/10' : isNearLimit ? 'bg-amber-500/10' : 'bg-primary/10'
              )}>
                <Upload className={cn(
                  'w-4 h-4',
                  isAtLimit ? 'text-destructive' : isNearLimit ? 'text-amber-500' : 'text-primary'
                )} />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Daily Uploads</h4>
                <p className="text-xs text-muted-foreground">
                  {remainingUploads} of {dailyLimit} remaining
                </p>
              </div>
            </div>
            
            {isAtLimit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowUpgradePrompt(true)}
                className="gap-2 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10"
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span className="text-xs">Upgrade</span>
              </Button>
            )}
          </div>

          <div className="space-y-1">
            <Progress 
              value={percentageUsed} 
              className={cn(
                'h-2',
                isAtLimit && '[&>div]:bg-destructive',
                isNearLimit && !isAtLimit && '[&>div]:bg-amber-500'
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{uploadsToday} used</span>
              <span>{dailyLimit} daily limit</span>
            </div>
          </div>

          {isAtLimit && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <TrendingUp className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Daily limit reached</p>
                <p className="text-xs text-muted-foreground">
                  Upgrade to Pro (5/day) or Elite (20/day) for more uploads
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <UpgradePrompt
        open={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        trigger="upload_limit"
      />
    </>
  );
};
