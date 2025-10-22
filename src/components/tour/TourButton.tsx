import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGuidedTour } from '@/hooks/useGuidedTour';

export const TourButton = () => {
  const { startTour, hasNewUpdates } = useGuidedTour();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Tour da Ferramenta"
        >
          <HelpCircle className="h-5 w-5" />
          {hasNewUpdates && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => startTour('manual-full')}>
          <div className="flex flex-col gap-1">
            <span className="font-medium">Tour Completo</span>
            <span className="text-xs text-muted-foreground">
              Conheça toda a plataforma
            </span>
          </div>
        </DropdownMenuItem>
        {hasNewUpdates && (
          <DropdownMenuItem onClick={() => startTour('manual-updates')}>
            <div className="flex flex-col gap-1">
              <span className="font-medium flex items-center gap-2">
                Novidades
                <span className="h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <span className="text-xs text-muted-foreground">
                Veja as últimas atualizações
              </span>
            </div>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
