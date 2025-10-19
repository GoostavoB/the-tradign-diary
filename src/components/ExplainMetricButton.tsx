import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExplainMetricButtonProps {
  metricName: string;
  metricValue: string | number;
  context?: string;
  onExplain: (prompt: string) => void;
  className?: string;
}

export const ExplainMetricButton = ({ 
  metricName, 
  metricValue, 
  context, 
  onExplain,
  className 
}: ExplainMetricButtonProps) => {
  const handleClick = () => {
    const prompt = `Can you explain my ${metricName} metric? 
Current value: ${metricValue}
${context ? `Context: ${context}` : ''}

Please provide:
1. What this metric means
2. How it's calculated
3. Why this value matters for my trading performance
4. Actionable insights based on this metric`;

    onExplain(prompt);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClick}
            className={`h-7 w-7 hover:bg-primary/10 hover:text-primary ${className}`}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="glass-strong">
          <p className="text-xs">Ask AI to explain this metric</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
