import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Star } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIMetricsChat } from '@/components/metrics/AIMetricsChat';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { CustomWidgetRenderer } from '@/components/widgets/CustomWidgetRenderer';

const MyMetrics = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user's saved metrics
  const { data: savedMetrics, isLoading } = useQuery({
    queryKey: ['user-metrics', refreshKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('custom_dashboard_widgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_permanent', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleWidgetCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteMetric = async (metricId: string) => {
    try {
      const { error } = await supabase
        .from('custom_dashboard_widgets')
        .delete()
        .eq('id', metricId);

      if (error) throw error;

      toast.success('Metric deleted');
      setRefreshKey(prev => prev + 1);
    } catch (error: any) {
      console.error('Error deleting metric:', error);
      toast.error('Failed to delete metric');
    }
  };

  // Suggested metrics based on common use cases
  const suggestedMetrics = [
    {
      id: 'suggested-1',
      title: 'Top 5 Setups by Win Rate',
      description: 'See which setups perform best',
      prompt: 'Show me my top 5 setups ranked by win rate'
    },
    {
      id: 'suggested-2',
      title: 'Hourly Performance Heatmap',
      description: 'Find your best trading hours',
      prompt: 'Create a heatmap showing my win rate by hour of day'
    },
    {
      id: 'suggested-3',
      title: 'Profit by Day of Week',
      description: 'Identify profitable patterns',
      prompt: 'Show my total profit grouped by day of week'
    },
  ];

  return (
    <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Metrics</h1>
            <p className="text-muted-foreground">
              AI-powered custom metrics that adapt to your trading data
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: AI Chat Interface */}
          <div className="lg:col-span-2">
            <AIMetricsChat onWidgetCreated={handleWidgetCreated} />
          </div>

          {/* Right: Saved Metrics */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-1">Your Metrics</h2>
              <p className="text-sm text-muted-foreground">
                {savedMetrics?.length || 0} custom metrics
              </p>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground">Loading metrics...</p>
                </Card>
              ) : savedMetrics && savedMetrics.length > 0 ? (
                savedMetrics.map((metric) => (
                  <CustomWidgetRenderer
                    key={metric.id}
                    widget={metric}
                    onDelete={() => {
                      handleDeleteMetric(metric.id);
                    }}
                    showAddToDashboard={true}
                  />
                ))
              ) : (
                <Card className="p-6 text-center">
                  <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No metrics yet. Create your first one using the AI chat!
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Suggested Metrics */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Suggested Metrics</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Popular metrics other traders use to improve their performance
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {suggestedMetrics.map((suggestion) => (
              <Card key={suggestion.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <h3 className="font-semibold mb-1">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {suggestion.description}
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Create with AI
                </Button>
              </Card>
            ))}
          </div>
        </Card>
      </div>
  );
};

export default MyMetrics;
