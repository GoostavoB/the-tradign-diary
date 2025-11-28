import { memo, ReactNode } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WidgetResizeControls } from './WidgetResizeControls';
import { WidgetSize, WidgetHeight } from '@/types/widget';

interface WidgetWrapperProps {
  id: string;
  title?: string;
  children: ReactNode;
  isEditMode?: boolean;
  isCompact?: boolean;
  onRemove?: () => void;
  onExpand?: () => void;
  onResize?: (newSize?: WidgetSize, newHeight?: WidgetHeight) => void;
  currentSize?: WidgetSize;
  currentHeight?: WidgetHeight;
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
  onResize,
  currentSize,
  currentHeight,
  className,
  headerActions,
}: WidgetWrapperProps) => {
  return (
    <PremiumCard
      className={cn(
        "h-full flex flex-col",
        isEditMode && "ring-2 ring-primary/50 scale-[0.99]",
        className
      )}
      title={title}
      action={headerActions}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-50 flex gap-1">
          <div className="cursor-move p-1.5 rounded bg-background/80 hover:bg-background border border-primary/20 text-primary">
            <GripVertical className="h-4 w-4" />
          </div>

          {onResize && currentSize && currentHeight && (
            <WidgetResizeControls
              currentSize={currentSize}
              currentHeight={currentHeight}
              onResize={onResize}
            />
          )}

          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7"
              onClick={onRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-hidden",
        isCompact ? "mt-0" : "mt-2"
      )}>
        {children}
      </div>
    </PremiumCard>
  );
});


WidgetWrapper.displayName = 'WidgetWrapper';
