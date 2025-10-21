import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Save, Plus, Trash2, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Annotation {
  id: string;
  label: string;
  x: number;
  y: number;
  relativeX: number; // Percentage
  relativeY: number; // Percentage
}

interface ImageAnnotatorProps {
  imageUrl: string;
  onAnnotationsChange: (annotations: Annotation[]) => void;
  initialAnnotations?: Annotation[];
}

export const ImageAnnotator = ({ imageUrl, onAnnotationsChange, initialAnnotations = [] }: ImageAnnotatorProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onAnnotationsChange(annotations);
  }, [annotations]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAdding || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate relative position (percentage)
    const relativeX = (x / rect.width) * 100;
    const relativeY = (y / rect.height) * 100;

    setPendingPosition({ x, y });
    
    if (newLabel.trim()) {
      addAnnotation(x, y, relativeX, relativeY, newLabel);
      setNewLabel('');
      setPendingPosition(null);
    }
  };

  const addAnnotation = (x: number, y: number, relativeX: number, relativeY: number, label: string) => {
    const annotation: Annotation = {
      id: `annotation-${Date.now()}`,
      label,
      x,
      y,
      relativeX,
      relativeY
    };
    setAnnotations(prev => [...prev, annotation]);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
  };

  const startAdding = () => {
    setIsAdding(true);
    setPendingPosition(null);
  };

  const cancelAdding = () => {
    setIsAdding(false);
    setNewLabel('');
    setPendingPosition(null);
  };

  const commonLabels = [
    'Entry Price',
    'Exit Price',
    'Position Size',
    'Leverage',
    'PnL / Profit',
    'Margin',
    'Fee',
    'Open Time',
    'Close Time',
    'Symbol / Pair'
  ];

  return (
    <Card className="p-4 glass-subtle space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <Label className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Mark Data Fields (Optional)
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Click on the image to mark where specific data fields are located. This helps improve extraction accuracy.
          </p>
        </div>
        {!isAdding ? (
          <Button onClick={startAdding} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Marker
          </Button>
        ) : (
          <Button onClick={cancelAdding} size="sm" variant="ghost">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-3 p-3 border border-accent/20 rounded-lg bg-accent/5">
          <div className="space-y-2">
            <Label htmlFor="label-input" className="text-sm">What data is this?</Label>
            <Input
              id="label-input"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Entry Price, Position Size..."
              className="w-full"
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {commonLabels.map((label) => (
              <Button
                key={label}
                onClick={() => setNewLabel(label)}
                variant="outline"
                size="sm"
                className="text-xs h-7"
              >
                {label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {newLabel ? 'Now click on the image where this data is located' : 'Type or select a label above, then click on the image'}
          </p>
        </div>
      )}

      <div ref={containerRef} className="relative w-full border border-border rounded-lg overflow-hidden bg-muted">
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Annotate trade data"
          className={`w-full h-auto ${isAdding && newLabel ? 'cursor-crosshair' : 'cursor-default'}`}
          onClick={handleImageClick}
        />
        
        {annotations.map((annotation) => {
          if (!imageRef.current) return null;
          const rect = imageRef.current.getBoundingClientRect();
          const displayX = (annotation.relativeX / 100) * rect.width;
          const displayY = (annotation.relativeY / 100) * rect.height;
          
          return (
            <div
              key={annotation.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                left: `${annotation.relativeX}%`,
                top: `${annotation.relativeY}%`,
              }}
            >
              <div className="relative flex flex-col items-center pointer-events-auto">
                <div className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow-lg animate-pulse" />
                <Badge 
                  variant="secondary" 
                  className="mt-1 text-xs whitespace-nowrap bg-accent text-white shadow-lg"
                >
                  {annotation.label}
                  <button
                    onClick={() => removeAnnotation(annotation.id)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            </div>
          );
        })}

        {pendingPosition && isAdding && newLabel && (
          <div
            className="absolute w-3 h-3 rounded-full bg-accent/50 border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-ping"
            style={{
              left: `${pendingPosition.x}px`,
              top: `${pendingPosition.y}px`,
            }}
          />
        )}
      </div>

      {annotations.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Marked Fields ({annotations.length})</Label>
          <div className="flex flex-wrap gap-2">
            {annotations.map((annotation) => (
              <Badge key={annotation.id} variant="outline" className="gap-2">
                <MapPin className="w-3 h-3" />
                {annotation.label}
                <button
                  onClick={() => removeAnnotation(annotation.id)}
                  className="hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
