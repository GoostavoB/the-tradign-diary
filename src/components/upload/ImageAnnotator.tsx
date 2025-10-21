import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, Save, Plus, Trash2, MapPin, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [customLabel, setCustomLabel] = useState('');
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
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
    setCustomLabel('');
    setPendingPosition(null);
  };

  const handleCustomLabelSubmit = () => {
    if (customLabel.trim()) {
      setNewLabel(customLabel.trim());
      setCustomLabel('');
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));

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
    <>
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
          <Button onClick={() => setIsDialogOpen(true)} size="sm" variant="outline">
            <Maximize2 className="w-4 h-4 mr-2" />
            Open Annotator
          </Button>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mark Data Fields on Trade Screenshot
                </DialogTitle>
                <DialogDescription className="mt-2">
                  Click on the image to mark where specific data fields are located. Create custom labels for any field from your broker.
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleZoomOut} size="sm" variant="outline">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button onClick={handleZoomIn} size="sm" variant="outline">
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex flex-col lg:flex-row h-[calc(95vh-140px)] overflow-hidden">
            {/* Left Panel - Controls */}
            <div className="w-full lg:w-80 border-r border-border p-6 space-y-4 overflow-y-auto">
              {!isAdding ? (
                <Button onClick={startAdding} className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Marker
                </Button>
              ) : (
                <Button onClick={cancelAdding} className="w-full" variant="ghost" size="lg">
                  <X className="w-4 h-4 mr-2" />
                  Cancel Adding
                </Button>
              )}

              {isAdding && (
                <div className="space-y-4 p-4 border border-accent/20 rounded-lg bg-accent/5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Quick Select Field</Label>
                    <div className="flex flex-wrap gap-2">
                      {commonLabels.map((label) => (
                        <Button
                          key={label}
                          onClick={() => setNewLabel(label)}
                          variant={newLabel === label ? "default" : "outline"}
                          size="sm"
                          className="text-xs"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-label" className="text-sm font-semibold">Create Custom Field</Label>
                    <div className="flex gap-2">
                      <Input
                        id="custom-label"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="e.g., Stop Loss, Take Profit..."
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomLabelSubmit()}
                      />
                      <Button onClick={handleCustomLabelSubmit} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {newLabel && (
                    <div className="p-3 bg-primary/10 rounded-md">
                      <p className="text-sm font-medium mb-1">Selected: {newLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        Now click on the image where this field is located
                      </p>
                    </div>
                  )}
                </div>
              )}

              {annotations.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Marked Fields ({annotations.length})</Label>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                      {annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="flex items-center justify-between p-2 border border-border rounded-md hover:bg-accent/5 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-accent" />
                            <span className="text-sm font-medium">{annotation.label}</span>
                          </div>
                          <Button
                            onClick={() => removeAnnotation(annotation.id)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            {/* Right Panel - Image */}
            <div className="flex-1 overflow-auto bg-muted p-4">
              <div 
                ref={containerRef} 
                className="relative inline-block min-w-full"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Annotate trade data"
                  className={`w-full h-auto shadow-2xl rounded-lg ${isAdding && newLabel ? 'cursor-crosshair' : 'cursor-default'}`}
                  onClick={handleImageClick}
                />
                
                {annotations.map((annotation) => {
                  if (!imageRef.current) return null;
                  
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
                        <div className="w-4 h-4 rounded-full bg-accent border-2 border-white shadow-lg animate-pulse" />
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
                    className="absolute w-4 h-4 rounded-full bg-accent/50 border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 animate-ping"
                    style={{
                      left: `${pendingPosition.x}px`,
                      top: `${pendingPosition.y}px`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
