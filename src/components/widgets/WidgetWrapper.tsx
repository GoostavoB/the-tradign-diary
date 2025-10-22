import { memo, ReactNode } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Trash2, Maximize2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WidgetWrapperProps {
  id: string;
  title?: string;
  children: ReactNode;
  isEditMode?: boolean;
  isCompact?: boolean;
  onRemove?: () => void;
  onExpand?: () => void;
  className?: string;
  headerActions?: ReactNode;
}

export const WidgetWrapper = memo(({
  id,
  title,
  children,
  isEditMode = false,
  isCompact = false,
  onRemove,
  onExpand,
  className,
  headerActions,
}: WidgetWrapperProps) => {
  return (
    <GlassCard 
      className={cn(
        "relative flex flex-col overflow-hidden",
        "transition-all duration-200",
        isEditMode && "animate-border-pulse",
        isCompact && "widget-compact",
        className
      )}
    >
      {/* Enhanced Shimmer Effects for Edit Mode */}
      {isEditMode && (
        <>
          {/* Background pulsing overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-lg bg-primary/5 animate-edit-pulse" />
          
          {/* Sweeping shimmer effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            <div 
              className="absolute w-[200%] h-[200%] -left-[100%] -top-[100%] animate-shimmer"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.25) 30%, hsl(var(--primary) / 0.4) 50%, hsl(var(--primary) / 0.25) 70%, transparent)',
                transform: 'rotate(45deg)',
              }}
            />
          </div>

          {/* Corner highlights */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-8 h-0.5 bg-gradient-to-l from-primary/60 to-transparent animate-edit-pulse" />
            <div className="absolute top-0 right-0 w-0.5 h-8 bg-gradient-to-b from-primary/60 to-transparent animate-edit-pulse" />
          </div>
          <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-primary/60 to-transparent animate-edit-pulse" />
            <div className="absolute bottom-0 left-0 w-0.5 h-8 bg-gradient-to-t from-primary/60 to-transparent animate-edit-pulse" />
          </div>
        </>
      )}
      
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
          <div className="drag-handle cursor-move p-1.5 rounded bg-background/90 hover:bg-background shadow-lg border border-primary/30">
            <GripVertical className="h-4 w-4 text-primary" />
          </div>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 bg-background/90 hover:bg-destructive hover:text-destructive-foreground shadow-lg border border-primary/30"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-visible",
        isCompact ? "px-4 py-3" : "px-6 py-4"
      )}>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h3 className={cn("font-semibold", isCompact ? "text-base" : "text-lg")}>{title}</h3>
            <div className="flex items-center gap-2">
              {headerActions}
              {onExpand && !isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onExpand}
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </GlassCard>
  );
});

WidgetWrapper.displayName = 'WidgetWrapper';
