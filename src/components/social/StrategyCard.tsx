import { PremiumCard } from "@/components/ui/PremiumCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SharedStrategy } from "@/types/social";
import { Heart, Copy, TrendingUp } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface StrategyCardProps {
  strategy: SharedStrategy;
  onUpdate?: () => void;
}

export const StrategyCard = ({ strategy, onUpdate }: StrategyCardProps) => {
  const [copying, setCopying] = useState(false);

  const handleCopy = async () => {
    setCopying(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to copy strategies");
        return;
      }

      // Increment uses_count
      await supabase
        .from("shared_strategies")
        .update({ uses_count: strategy.uses_count + 1 })
        .eq("id", strategy.id);

      toast.success("Strategy copied to your account!");
      onUpdate?.();
    } catch (error: any) {
      toast.error("Failed to copy strategy");
    } finally {
      setCopying(false);
    }
  };

  return (
    <PremiumCard className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={strategy.profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {strategy.profile?.full_name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">
                {strategy.profile?.full_name || "Anonymous"}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(strategy.created_at))} ago
              </p>
            </div>
          </div>
        </div>
        {strategy.setup_type && (
          <Badge variant="outline">{strategy.setup_type}</Badge>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">{strategy.title}</h3>
        {strategy.description && (
          <p className="text-sm text-muted-foreground">{strategy.description}</p>
        )}
      </div>

      <div className="space-y-2">
        {strategy.rules.entry && strategy.rules.entry.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-green-500 mb-1">Entry Rules:</p>
            <ul className="text-xs space-y-1 pl-4">
              {strategy.rules.entry.map((rule, idx) => (
                <li key={idx} className="list-disc">{rule}</li>
              ))}
            </ul>
          </div>
        )}
        {strategy.rules.exit && strategy.rules.exit.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-red-500 mb-1">Exit Rules:</p>
            <ul className="text-xs space-y-1 pl-4">
              {strategy.rules.exit.map((rule, idx) => (
                <li key={idx} className="list-disc">{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {strategy.performance_stats && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Win Rate: {strategy.performance_stats.win_rate}%
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            {strategy.likes_count}
          </span>
          <span className="flex items-center gap-1">
            <Copy className="h-4 w-4" />
            {strategy.uses_count} uses
          </span>
        </div>
        <Button size="sm" onClick={handleCopy} disabled={copying} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Strategy
        </Button>
      </div>
    </PremiumCard>
  );
};
