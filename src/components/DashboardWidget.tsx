import { ReactNode, memo } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Settings2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  id: string;
  title: string;
  children: ReactNode;
  isCustomizing?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: (id: string) => void;
  className?: string;
}

const DashboardWidgetComponent = ({
  id,
  title,
  children,
  isCustomizing = false,
  isVisible = true,
  onToggleVisibility,
  className
}: DashboardWidgetProps) => {
  if (!isVisible && !isCustomizing) return null;

  return (
    <PremiumCard
      className={cn(
        "relative glass h-full transition-all duration-200 overflow-hidden",
        !isVisible && isCustomizing && "opacity-50 ring-2 ring-destructive/50 bg-destructive/5",
        isCustomizing && "cursor-move ring-2 ring-primary/40 hover:ring-primary/60 hover:shadow-2xl hover:scale-[1.02] bg-primary/5",
        className
      )}
    >
      {/* Widget Header */}
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-3">
        <div className="flex items-center gap-2 drag-handle">
          {isCustomizing && (
            <GripVertical className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          )}
          <h3 className="text-base font-semibold leading-none tracking-tight">{title}</h3>
        </div>

        {isCustomizing && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
              onClick={() => onToggleVisibility?.(id)}
              title={isVisible ? "Hide widget" : "Show widget"}
            >
              {isVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className={cn(
        "p-6 pt-0 pb-4",
        !isVisible && isCustomizing && "pointer-events-none"
      )}>
        {children}
      </div>

      {/* Overlay when customizing and hidden */}
      {isCustomizing && !isVisible && (
        <div className="absolute inset-0 glass-strong rounded-xl flex items-center justify-center">
          <div className="text-center space-y-2">
            <EyeOff className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">Widget Hidden</p>
          </div>
        </div>
      )}
    </PremiumCard>
  );
};

export const DashboardWidget = memo(DashboardWidgetComponent);
DashboardWidget.displayName = 'DashboardWidget';
