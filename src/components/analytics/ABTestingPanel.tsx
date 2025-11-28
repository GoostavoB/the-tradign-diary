import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Play, Pause, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ABTestingPanelProps {
  tests?: Array<{
    id: string;
    name: string;
    status: 'draft' | 'running' | 'completed';
    variants: Array<{
      name: string;
      traffic: number;
      conversions: number;
      confidence: number;
    }>;
    metric: string;
  }>;
}

export function ABTestingPanel({ tests = [] }: ABTestingPanelProps) {
  const mockTests = tests.length > 0 ? tests : [
    {
      id: '1',
      name: 'Dashboard Layout Test',
      status: 'running' as const,
      variants: [
        { name: 'Control', traffic: 50, conversions: 245, confidence: 95 },
        { name: 'Variant A', traffic: 50, conversions: 278, confidence: 97 },
      ],
      metric: 'Trade Creation Rate',
    },
    {
      id: '2',
      name: 'CTA Button Color',
      status: 'completed' as const,
      variants: [
        { name: 'Blue', traffic: 50, conversions: 412, confidence: 99 },
        { name: 'Green', traffic: 50, conversions: 389, confidence: 91 },
      ],
      metric: 'Click-through Rate',
    },
  ];

  const statusColors = {
    draft: 'bg-gray-500/20 text-gray-500',
    running: 'bg-blue-500/20 text-blue-500',
    completed: 'bg-green-500/20 text-green-500',
  };

  return (
    <PremiumCard className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <FlaskConical className="h-5 w-5 text-neon-blue" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">A/B Testing</h3>
            <p className="text-sm text-muted-foreground">Active experiments</p>
          </div>
        </div>
        <Button size="sm">
          <Play className="mr-2 h-4 w-4" />
          New Test
        </Button>
      </div>

      <div className="space-y-4">
        {mockTests.map((test) => (
          <PremiumCard key={test.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{test.name}</h4>
                <p className="text-sm text-muted-foreground">{test.metric}</p>
              </div>
              <Badge className={statusColors[test.status]}>
                {test.status}
              </Badge>
            </div>

            <div className="space-y-3">
              {test.variants.map((variant) => {
                const winner = variant.confidence > 95 && variant.conversions > test.variants[0].conversions;

                return (
                  <div key={variant.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{variant.name}</span>
                        {winner && <Check className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{variant.conversions} conversions</span>
                        <span>{variant.confidence}% confidence</span>
                      </div>
                    </div>
                    <Progress value={variant.traffic} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              {test.status === 'running' && (
                <Button size="sm" variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              <Button size="sm" variant="ghost">
                View Details
              </Button>
            </div>
          </PremiumCard>
        ))}
      </div>
    </PremiumCard>
  );
}
