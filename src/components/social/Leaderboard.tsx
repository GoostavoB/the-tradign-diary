import { useState, useEffect } from "react";
import { PremiumCard } from "@/components/ui/PremiumCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  rank: number;
}

export const Leaderboard = () => {
  const [weeklyLeaders, setWeeklyLeaders] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaders, setMonthlyLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // This is a simplified version - in production, you'd aggregate trade data
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_visibility", "public")
        .limit(10);

      // Mock leaderboard data (in production, calculate from actual trades)
      const mockLeaders: LeaderboardEntry[] = (profiles || []).map((profile, idx) => ({
        user_id: profile.id,
        username: profile.username || "user",
        full_name: profile.full_name || "Anonymous",
        avatar_url: profile.avatar_url || "",
        total_profit: Math.random() * 10000,
        win_rate: 50 + Math.random() * 40,
        total_trades: Math.floor(Math.random() * 100) + 10,
        rank: idx + 1
      })).sort((a, b) => b.total_profit - a.total_profit);

      setWeeklyLeaders(mockLeaders);
      setMonthlyLeaders([...mockLeaders].sort((a, b) => b.win_rate - a.win_rate));
    } catch (error: any) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const LeaderboardList = ({ leaders }: { leaders: LeaderboardEntry[] }) => (
    <div className="space-y-3">
      {leaders.map((leader) => (
        <PremiumCard key={leader.user_id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 text-center">
                {leader.rank <= 3 ? (
                  <Trophy className={`h-6 w-6 ${leader.rank === 1 ? "text-yellow-500" :
                      leader.rank === 2 ? "text-gray-400" :
                        "text-amber-700"
                    }`} />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground">
                    {leader.rank}
                  </span>
                )}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarImage src={leader.avatar_url || undefined} />
                <AvatarFallback>{leader.full_name[0] || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{leader.full_name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  @{leader.username}
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-semibold text-green-500">
                  ${leader.total_profit.toFixed(0)}
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end text-sm">
                <Target className="h-3 w-3" />
                <span className="text-muted-foreground">
                  {leader.win_rate.toFixed(1)}% • {leader.total_trades} trades
                </span>
              </div>
            </div>
          </div>
        </PremiumCard>
      ))}
    </div>
  );

  return (
    <PremiumCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-primary" />
        Top Traders
      </h3>

      <Tabs defaultValue="weekly">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <LeaderboardList leaders={weeklyLeaders} />
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <LeaderboardList leaders={monthlyLeaders} />
        </TabsContent>
      </Tabs>
    </PremiumCard>
  );
};
