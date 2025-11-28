import { memo, ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  example?: string;
  children?: ReactNode;
  variant?: 'help' | 'info';
  side?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

/**
 * Standardized tooltip component for metrics and stats
 * Provides consistent help information across the dashboard
 */
const MetricTooltipComponent = ({
  title,
  description,
  calculation,
  example,
  children,
  variant = 'info',
  side = 'top',
  className,
}: MetricTooltipProps) => {
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button
              className={cn(
                "inline-flex items-center justify-center rounded-md text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground h-7 w-7",
                className
              )}
              aria-label={`Information about ${title}`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side} 
          className="max-w-xs glass-strong border-border p-4 space-y-2"
          sideOffset={5}
        >
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
          
          {calculation && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-foreground mb-1">Calculation:</p>
              <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                {calculation}
              </code>
            </div>
          )}
          
          {example && (
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-medium text-foreground mb-1">Example:</p>
              <p className="text-xs text-muted-foreground">{example}</p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const MetricTooltip = memo(MetricTooltipComponent);
MetricTooltip.displayName = 'MetricTooltip';
