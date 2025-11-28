import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useEffect, useRef, useState } from 'react';
import { X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from './ErrorBoundary';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
  isEditMode: boolean;
  onRemove: () => void;
  className?: string;
}

export const SortableWidget = memo(({ id, children, isEditMode, onRemove, className }: SortableWidgetProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const nodeRef = useRef<HTMLDivElement | null>(null);
  const [lockedSize, setLockedSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (isDragging && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      setLockedSize({ width: rect.width, height: rect.height });
    } else if (!isDragging) {
      setLockedSize(null);
    }
  }, [isDragging]);

  const transformStr = transform
    ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
    : undefined;

  const style = {
    transform: transformStr,
    transition: isDragging ? 'transform 0s linear' : (transition || undefined),
    opacity: 1,
    touchAction: 'none',
    zIndex: isDragging ? 1000 : 'auto',
    width: isDragging && lockedSize ? `${lockedSize.width}px` : undefined,
    height: isDragging && lockedSize ? `${lockedSize.height}px` : undefined,
  } as React.CSSProperties;

  return (
    <div
      ref={(el) => { setNodeRef(el); nodeRef.current = el; }}
      style={style}
      data-sortable-id={id}
      className={`
        widget-item relative rounded-xl transition-all duration-200
        ${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''} 
        ${isDragging ? 'dragging ring-4 ring-primary/60 shadow-2xl shadow-primary/40 scale-105 z-50' : ''} 
        ${isEditMode && !isDragging ? 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background hover:ring-primary/50 animate-pulse-slow' : ''}
        ${className || ''}
      `}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
    >
      {/* Drag handle indicator in edit mode */}
      {isEditMode && !isDragging && (
        <div className="absolute top-2 left-2 z-40 p-1.5 rounded-md bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200">
          <GripVertical className="h-4 w-4 text-primary" />
        </div>
      )}

      {/* Widget dimension indicator in edit mode */}
      {isEditMode && !isDragging && (
        <div className="absolute bottom-2 right-2 z-40 px-2 py-1 rounded-md bg-background/90 backdrop-blur-sm border border-border/50 text-xs font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200">
          {Math.round(lockedSize?.width || 0)}×{Math.round(lockedSize?.height || 0)}
        </div>
      )}

      {/* Remove button in edit mode */}
      {isEditMode && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 z-50 h-7 w-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Wrap children in measurable content div for masonry with error boundary */}
      <div className="widget-content group">
        <div className={isDragging ? 'pointer-events-none' : ''}>
          <ErrorBoundary widgetId={id}>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
});

SortableWidget.displayName = 'SortableWidget';
