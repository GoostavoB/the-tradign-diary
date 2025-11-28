import { memo } from 'react';

interface GridGuidesProps {
  columnCount: number;
  rowCount: number;
  show: boolean;
}

export const GridGuides = memo(({ columnCount, rowCount, show }: GridGuidesProps) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Vertical guides */}
      {Array.from({ length: columnCount + 1 }).map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0 w-px bg-primary/10 animate-pulse"
          style={{
            left: `${(i / columnCount) * 100}%`,
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
      
      {/* Horizontal guides */}
      {Array.from({ length: rowCount + 1 }).map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px bg-primary/10 animate-pulse"
          style={{
            top: `${i * 220}px`, // Approximate row height
            animationDelay: `${i * 50}ms`,
          }}
        />
      ))}
      
      {/* Grid overlay pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, hsl(var(--primary)) 0px, transparent 1px, transparent ${100 / columnCount}%, hsl(var(--primary)) ${100 / columnCount}%),
            repeating-linear-gradient(90deg, hsl(var(--primary)) 0px, transparent 1px, transparent 220px, hsl(var(--primary)) 220px)
          `,
        }}
      />
    </div>
  );
});

GridGuides.displayName = 'GridGuides';
