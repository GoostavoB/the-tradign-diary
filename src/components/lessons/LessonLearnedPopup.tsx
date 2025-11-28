import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Brain, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getTagColor } from "@/constants/tradingTags";

interface ErrorStats {
  tag: string;
  count: number;
  avgLoss: number;
  totalLoss: number;
}

export function LessonLearnedPopup() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartRef = useRef<number>(0);

  // Check if user has seen popup today
  const { data: hasSeenToday } = useQuery({
    queryKey: ['lesson-learned-today', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_learned_log')
        .select('id')
        .eq('user_id', user?.id)
        .eq('shown_date', new Date().toISOString().split('T')[0])
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id,
  });

  // Fetch error statistics from last 7 days
  const { data: errorStats } = useQuery({
    queryKey: ['error-stats-week', user?.id],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: trades, error } = await supabase
        .from('trades')
        .select('error_tags, pnl')
        .eq('user_id', user?.id)
        .gte('trade_date', sevenDaysAgo.toISOString())
        .not('error_tags', 'is', null);

      if (error) throw error;

      const statsMap = new Map<string, { count: number; totalLoss: number }>();

      trades?.forEach((trade) => {
        const pnl = Number(trade.pnl) || 0;
        trade.error_tags?.forEach((tag: string) => {
          const stats = statsMap.get(tag) || { count: 0, totalLoss: 0 };
          stats.count++;
          if (pnl < 0) stats.totalLoss += Math.abs(pnl);
          statsMap.set(tag, stats);
        });
      });

      const results: ErrorStats[] = Array.from(statsMap.entries())
        .map(([tag, stats]) => ({
          tag,
          count: stats.count,
          avgLoss: stats.totalLoss / stats.count,
          totalLoss: stats.totalLoss,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return results;
    },
    enabled: !!user?.id && !hasSeenToday,
  });

  // Show popup on first visit of the day if there are errors
  useEffect(() => {
    if (hasSeenToday === false && errorStats && errorStats.length > 0) {
      // Small delay for better UX
      const timer = setTimeout(() => setOpen(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenToday, errorStats]);

  // Log confirmation mutation
  const confirmMutation = useMutation({
    mutationFn: async (holdDuration: number) => {
      const { error } = await supabase
        .from('lesson_learned_log')
        .insert({
          user_id: user?.id,
          shown_date: new Date().toISOString().split('T')[0],
          hold_duration_seconds: holdDuration,
          errors_shown: errorStats?.map(e => e.tag) || [],
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-learned-today'] });
      setOpen(false);
      toast.success("Lesson acknowledged! Keep improving! 💪");
    },
    onError: () => {
      toast.error("Failed to save confirmation");
    },
  });

  const handleMouseDown = () => {
    setIsHolding(true);
    holdStartRef.current = Date.now();
    
    holdTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      const progress = Math.min((elapsed / 5000) * 100, 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        handleComplete();
      }
    }, 50);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleComplete = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
    
    const duration = (Date.now() - holdStartRef.current) / 1000;
    confirmMutation.mutate(duration);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearInterval(holdTimerRef.current);
      }
    };
  }, []);

  if (!errorStats || errorStats.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-orange-500" />
            Daily Lesson Learned
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Review Your Mistakes</p>
              <p className="text-muted-foreground">
                Here are your most common trading errors from the past week:
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {errorStats.map((error, index) => (
              <div key={error.tag} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <Badge className={getTagColor(error.tag, 'error')}>
                      {error.tag}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      {error.count} occurrence{error.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    -${error.totalLoss.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${error.avgLoss.toFixed(2)} avg
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">💡 Remember:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Every mistake is a learning opportunity</li>
              <li>• Review these patterns before your next trade</li>
              <li>• Use tags consistently to track progress</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button
              className="w-full relative overflow-hidden"
              size="lg"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={confirmMutation.isPending}
            >
              <span className="relative z-10">
                {isHolding 
                  ? `Hold to acknowledge... (${Math.floor(holdProgress / 20)}s)` 
                  : "Hold for 5 seconds to acknowledge"}
              </span>
              <div 
                className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-green-600/30 transition-all duration-100"
                style={{ width: `${holdProgress}%` }}
              />
            </Button>
            <Progress value={holdProgress} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              This ensures you've taken time to reflect on these patterns
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
