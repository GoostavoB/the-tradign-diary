import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBlur } from '@/contexts/BlurContext';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export const BlurToggleButton = () => {
  const { isBlurred, toggleBlur } = useBlur();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBlur}
            className="h-9 w-9"
          >
            {isBlurred ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isBlurred ? 'Show values' : 'Hide values'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
