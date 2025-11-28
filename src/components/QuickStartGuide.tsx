import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Heart, Settings, Upload, BarChart3, X } from 'lucide-react';
import { useState } from 'react';

interface QuickStartGuideProps {
  onClose?: () => void;
}

export function QuickStartGuide({ onClose }: QuickStartGuideProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    setCompletedSteps(prev =>
      prev.includes(step)
        ? prev.filter(s => s !== step)
        : [...prev, step]
    );
  };

  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Add Your First Trade",
      description: "Navigate to Trades → Add Trade. Upload CSV, connect exchange, or enter manually.",
      time: "30 seconds"
    },
    {
      number: 2,
      icon: BarChart3,
      title: "Check Your Dashboard",
      description: "View real-time metrics: P&L, win rate, current streak, and portfolio allocation.",
      time: "15 seconds"
    },
    {
      number: 3,
      icon: Heart,
      title: "Set Favorites",
      description: "Hover over menu items and click ♥ to add up to 12 favorites for quick access.",
      time: "20 seconds"
    },
    {
      number: 4,
      icon: BarChart3,
      title: "Analyze Performance",
      description: "Visit Trade Analysis to see win rates by asset, setup types, and trading hours.",
      time: "45 seconds"
    },
    {
      number: 5,
      icon: Settings,
      title: "Customize Settings",
      description: "Set theme, language, notifications, and privacy preferences.",
      time: "30 seconds"
    }
  ];

  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <PremiumCard className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>Quick Start Guide</CardTitle>
              <Badge variant={progress === 100 ? "default" : "secondary"}>
                {progress}% Complete
              </Badge>
            </div>
            <CardDescription>
              Get started in 3 minutes. Check off steps as you complete them.
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.number);
          const StepIcon = step.icon;

          return (
            <div key={step.number}>
              {index > 0 && <Separator className="my-4" />}

              <div
                className={`flex gap-4 p-3 rounded-lg transition-all cursor-pointer hover:bg-muted/50 ${isCompleted ? 'bg-primary/5 border border-primary/20' : ''
                  }`}
                onClick={() => toggleStep(step.number)}
              >
                {/* Step Number / Checkmark */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-muted-foreground/30 text-muted-foreground flex items-center justify-center font-bold">
                      {step.number}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <StepIcon className="h-4 w-4 text-primary" />
                      <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {step.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {step.time}
                    </Badge>
                  </div>
                  <p className={`text-sm ${isCompleted ? 'text-muted-foreground' : ''}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {progress === 100 && (
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center space-y-3">
            <p className="font-semibold text-lg">🎉 Congratulations!</p>
            <p className="text-sm text-muted-foreground">
              You're all set up. Start tracking trades and improving your performance!
            </p>
            <Button variant="default" size="sm" onClick={onClose}>
              Start Trading
            </Button>
          </div>
        )}
      </CardContent>
    </PremiumCard>
  );
}