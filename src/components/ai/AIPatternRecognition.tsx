import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertCircle, Target, Lightbulb, BarChart3 } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Pattern {
  id: string;
  type: 'winning_setup' | 'losing_setup' | 'time_pattern' | 'behavior_pattern';
  name: string;
  description: string;
  confidence: number;
  frequency: number;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface AIInsight {
  category: string;
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
}

export const AIPatternRecognition = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  useEffect(() => {
    loadPreviousAnalysis();
  }, [user]);

  const loadPreviousAnalysis = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_analysis_cache')
        .select('*')
        .eq('user_id', user.id)
        .eq('analysis_type', 'pattern_recognition')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const result = data.result as any;
        setPatterns(result.patterns || []);
        setInsights(result.insights || []);
        setLastAnalysis(new Date(data.created_at));
      }
    } catch (error) {
      console.error('Error loading previous analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    if (!user) return;

    setAnalyzing(true);
    try {
      // Call AI edge function for pattern recognition
      const { data, error } = await supabase.functions.invoke('ai-pattern-recognition', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      setPatterns(data.patterns || []);
      setInsights(data.insights || []);
      setLastAnalysis(new Date());

      toast({
        title: 'Analysis complete!',
        description: `Found ${data.patterns?.length || 0} patterns and ${data.insights?.length || 0} insights.`,
      });
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: 'Analysis failed',
        description: 'Could not complete pattern recognition. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getPatternIcon = (type: Pattern['type']) => {
    switch (type) {
      case 'winning_setup':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'losing_setup':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'time_pattern':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'behavior_pattern':
        return <Target className="h-5 w-5 text-purple-500" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <PremiumCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                AI Pattern Recognition
              </CardTitle>
              <CardDescription>
                Discover patterns in your trading behavior
                {lastAnalysis && (
                  <span className="block mt-1">
                    Last analysis: {lastAnalysis.toLocaleDateString()} at {lastAnalysis.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button onClick={runAnalysis} disabled={analyzing || loading}>
              {analyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </PremiumCard>

      {loading ? (
        <PremiumCard>
          <CardContent className="p-8 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            Loading previous analysis...
          </CardContent>
        </PremiumCard>
      ) : patterns.length === 0 && insights.length === 0 ? (
        <PremiumCard>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Brain className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
            <p className="mb-4">
              Run an AI analysis to discover patterns in your trading behavior
            </p>
            <Button onClick={runAnalysis} disabled={analyzing}>
              <Brain className="h-4 w-4 mr-2" />
              Start Analysis
            </Button>
          </CardContent>
        </PremiumCard>
      ) : (
        <Tabs defaultValue="patterns" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patterns">
              Patterns ({patterns.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              Insights ({insights.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patterns" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {patterns.map((pattern) => (
                <PremiumCard key={pattern.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getPatternIcon(pattern.type)}
                        <div>
                          <CardTitle className="text-lg">{pattern.name}</CardTitle>
                          <CardDescription className="mt-1">
                            Detected {pattern.frequency} times
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getImpactColor(pattern.impact)}>
                        {pattern.impact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence</span>
                        <span className="font-medium">{pattern.confidence}%</span>
                      </div>
                      <Progress value={pattern.confidence} />
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium mb-1">Recommendation</p>
                          <p className="text-sm text-muted-foreground">
                            {pattern.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </PremiumCard>
              ))}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <ScrollArea className="h-[600px] pr-4">
              {insights.map((insight, index) => (
                <PremiumCard key={index} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{insight.category}</Badge>
                        <Badge
                          variant={
                            insight.priority === 'high'
                              ? 'destructive'
                              : insight.priority === 'medium'
                                ? 'default'
                                : 'secondary'
                          }
                        >
                          {insight.priority} priority
                        </Badge>
                      </div>
                      {insight.actionable && (
                        <Badge variant="secondary">Actionable</Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{insight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                  </CardContent>
                </PremiumCard>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
