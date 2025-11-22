import { DragOverlay } from '@dnd-kit/core';
import { memo } from 'react';

interface DragPreviewOverlayProps {
  activeId: string | null;
  renderPreview: (id: string) => React.ReactNode;
}

export const DragPreviewOverlay = memo(({ activeId, renderPreview }: DragPreviewOverlayProps) => {
  return (
    <DragOverlay
      dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}
    >
      {activeId ? (
        <div className="opacity-90 scale-105 rotate-3 shadow-2xl shadow-primary/50 ring-4 ring-primary/60 rounded-xl bg-background/95 backdrop-blur-sm">
          {renderPreview(activeId)}
        </div>
      ) : null}
    </DragOverlay>
  );
});

DragPreviewOverlay.displayName = 'DragPreviewOverlay';
