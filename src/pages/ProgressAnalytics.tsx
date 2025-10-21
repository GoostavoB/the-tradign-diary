import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Shield, Zap, Brain, Repeat } from 'lucide-react';

interface TraderIdentity {
  aggression: number;
  patience: number;
  risk_management: number;
  consistency: number;
  discipline: number;
  adaptability: number;
}

export default function ProgressAnalytics() {
  const { user } = useAuth();
  const [identity, setIdentity] = useState<TraderIdentity | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        // Fetch trader identity scores
        const { data: progression } = await supabase
          .from('user_progression')
          .select('trader_identity_scores')
          .eq('user_id', user.id)
          .single();

        if (progression?.trader_identity_scores) {
          setIdentity(progression.trader_identity_scores as any as TraderIdentity);
        }

        // Fetch milestone timeline
        const { data: badges } = await supabase
          .from('unlocked_badges')
          .select('badge_id, tier, unlocked_at')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: true });

        const { data: xpLogs } = await supabase
          .from('xp_activity_log')
          .select('activity_type, xp_earned, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(10);

        setTimeline([
          ...(badges || []).map(b => ({
            type: 'badge',
            title: `Unlocked ${b.badge_id}`,
            tier: b.tier,
            date: b.unlocked_at,
          })),
          ...(xpLogs || []).map(l => ({
            type: 'xp',
            title: l.activity_type,
            xp: l.xp_earned,
            date: l.created_at,
          })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const radarData = identity ? [
    { trait: 'Aggression', value: identity.aggression, icon: '⚡' },
    { trait: 'Patience', value: identity.patience, icon: '⏳' },
    { trait: 'Risk Mgmt', value: identity.risk_management, icon: '🛡️' },
    { trait: 'Consistency', value: identity.consistency, icon: '🎯' },
    { trait: 'Discipline', value: identity.discipline, icon: '💪' },
    { trait: 'Adaptability', value: identity.adaptability, icon: '🔄' },
  ] : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track your evolution as a trader
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Trader Identity Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trader Identity</CardTitle>
                <CardDescription>
                  Your trading personality profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                {identity ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="trait" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Your Profile"
                        dataKey="value"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-12">
                    Trade more to build your identity profile
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Milestone Timeline</CardTitle>
                <CardDescription>
                  Your trading journey highlights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[300px] overflow-auto">
                  {timeline.length > 0 ? (
                    timeline.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                          {item.type === 'badge' ? (
                            <Target className="h-4 w-4 text-primary" />
                          ) : (
                            <Zap className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-12">
                      No milestones yet - keep trading!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trait Breakdown */}
        {identity && (
          <Card>
            <CardHeader>
              <CardTitle>Trait Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <TraitCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Aggression"
                  value={identity.aggression}
                  description="Trade frequency and position sizing"
                />
                <TraitCard
                  icon={<Target className="h-5 w-5" />}
                  title="Patience"
                  value={identity.patience}
                  description="Average trade duration"
                />
                <TraitCard
                  icon={<Shield className="h-5 w-5" />}
                  title="Risk Management"
                  value={identity.risk_management}
                  description="Stop-loss usage and risk per trade"
                />
                <TraitCard
                  icon={<Zap className="h-5 w-5" />}
                  title="Consistency"
                  value={identity.consistency}
                  description="Win rate stability over time"
                />
                <TraitCard
                  icon={<Brain className="h-5 w-5" />}
                  title="Discipline"
                  value={identity.discipline}
                  description="Rule adherence and planning"
                />
                <TraitCard
                  icon={<Repeat className="h-5 w-5" />}
                  title="Adaptability"
                  value={identity.adaptability}
                  description="Strategy adjustments"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

const TraitCard = ({ icon, title, value, description }: any) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-2xl font-bold">{value}/100</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);
