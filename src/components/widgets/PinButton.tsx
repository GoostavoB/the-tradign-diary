import { Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PinButtonProps {
  isPinned: boolean;
  onToggle: () => void;
  className?: string;
}

export function PinButton({ isPinned, onToggle, className }: PinButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className={cn(
              "h-8 w-8 rounded-full transition-all hover:scale-110",
              isPinned 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted",
              className
            )}
          >
            {isPinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isPinned ? 'Unpin widget' : 'Pin widget to top'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
