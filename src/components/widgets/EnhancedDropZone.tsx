import { useDroppable } from '@dnd-kit/core';
import { memo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedDropZoneProps {
  id: string;
  onAddWidget?: () => void;
  showAddButton?: boolean;
}

export const EnhancedDropZone = memo(({ id, onAddWidget, showAddButton = false }: EnhancedDropZoneProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      aria-label="Drop widget here"
      className={`
        relative min-h-[200px] rounded-xl border-2 border-dashed transition-all duration-300 ease-out
        ${isOver 
          ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20' 
          : 'border-border/40 bg-muted/5 hover:border-primary/50 hover:bg-primary/5'
        }
      `}
    >
      {/* Animated background effect when hovering */}
      {isOver && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 animate-pulse" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.15),transparent_50%)] animate-ping" 
               style={{ animationDuration: '1.5s' }} />
        </div>
      )}
      
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full gap-3 p-6">
        <div className={`
          p-4 rounded-full transition-all duration-300
          ${isOver 
            ? 'bg-primary/20 scale-110 shadow-lg shadow-primary/30' 
            : 'bg-muted/30'
          }
        `}>
          {isOver ? (
            <Sparkles className="h-8 w-8 text-primary animate-spin" style={{ animationDuration: '2s' }} />
          ) : (
            <Plus className="h-8 w-8 text-muted-foreground/50" />
          )}
        </div>
        
        <div className="text-center space-y-1">
          <p className={`text-sm font-medium transition-colors ${
            isOver ? 'text-primary' : 'text-muted-foreground/70'
          }`}>
            {isOver ? 'Drop here!' : 'Drop widget here'}
          </p>
          {!isOver && showAddButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddWidget}
              className="mt-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Widget
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

EnhancedDropZone.displayName = 'EnhancedDropZone';
