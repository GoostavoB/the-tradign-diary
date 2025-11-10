import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UploadedImage {
  file: File;
  preview: string;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  tradesDetected?: number;
  error?: string;
}

interface MultiImageUploadProps {
  onTradesExtracted: (trades: any[]) => void;
  maxImages?: number;
  preSelectedBroker?: string;
}

export function MultiImageUpload({ onTradesExtracted, maxImages = 10, preSelectedBroker = '' }: MultiImageUploadProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalTradesDetected, setTotalTradesDetected] = useState(0);
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [extractedTrades, setExtractedTrades] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const remainingSlots = 10 - images.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newImages.push({
          file,
          preview: URL.createObjectURL(file),
          status: 'pending',
        });
      }
    });

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    }

    if (files.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} slots available. First ${remainingSlots} images added.`);
    }
  }, [images]);

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only respond to file drags
    const hasFiles = Array.from(e.dataTransfer?.types || []).includes('Files');
    if (!hasFiles) return;
    
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = Math.max(0, dragCounter.current - 1);
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current = 0;
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const analyzeImages = async () => {
    if (!preSelectedBroker || preSelectedBroker.trim() === '') {
      toast.error('Please select a broker first');
      return;
    }

    setIsAnalyzing(true);
    let totalTrades = 0;
    const allTrades: any[] = [];

    try {
      // Analyze each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'analyzing' } : img
        ));

        try {
          // Get session token
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error('Not authenticated');

          // Upload image to storage
          const fileExt = image.file.name.split('.').pop();
          const fileName = `${Date.now()}-${i}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('trade-screenshots')
            .upload(`${user!.id}/${fileName}`, image.file);

          if (uploadError) throw uploadError;

          // Extract trades from image
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-trade-info`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ 
                imagePath: uploadData.path,
                dryRun: true,  // Don't deduct credits yet
                broker: preSelectedBroker  // Pass pre-selected broker
              }),
            }
          );

          if (!response.ok) throw new Error('Failed to analyze image');

          const result = await response.json();
          const tradesFound = Array.isArray(result.trades) ? result.trades.length : 1;
          
          totalTrades += tradesFound;
          allTrades.push(...(Array.isArray(result.trades) ? result.trades : [result.trade]));

          setImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, status: 'success', tradesDetected: tradesFound } : img
          ));
        } catch (error) {
          console.error(`Error analyzing image ${i}:`, error);
          setImages(prev => prev.map((img, idx) => 
            idx === i ? { 
              ...img, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Analysis failed' 
            } : img
          ));
        }
      }

      setTotalTradesDetected(totalTrades);
      setCreditsRequired(totalTrades * 2); // 2 credits per trade
      setExtractedTrades(allTrades);
      setShowConfirmation(true);
    } catch (error) {
      toast.error('Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Process all images and deduct credits
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-multi-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            trades: extractedTrades,
            creditsToDeduct: creditsRequired
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to process trades');

      const result = await response.json();
      
      toast.success(`Successfully imported ${totalTradesDetected} trades!`);
      onTradesExtracted(result.trades);
      
      // Reset state
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      setShowConfirmation(false);
      setExtractedTrades([]);
    } catch (error) {
      toast.error('Failed to import trades');
    }
  };

  return (
    <div className="space-y-6">
      <div className={cn(
        "grid gap-4",
        images.length === 0 ? "grid-cols-1" : "grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      )}>
        {images.map((image, index) => (
          <Card key={index} className="relative group overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={image.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isAnalyzing}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {image.status === 'analyzing' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Analyzing image" />
                </div>
              )}
              {image.status === 'success' && (
                <div className="absolute top-2 right-2 bg-primary/90 rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" aria-label="Analysis successful" />
                </div>
              )}
              {image.status === 'error' && (
                <div className="absolute top-2 right-2 bg-destructive rounded-full p-1">
                  <AlertCircle className="h-4 w-4 text-primary-foreground" aria-label="Analysis failed" />
                </div>
              )}
            </div>
            {image.tradesDetected !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-foreground text-xs p-2 text-center">
                {image.tradesDetected} {image.tradesDetected === 1 ? 'trade' : 'trades'}
              </div>
            )}
          </Card>
        ))}

        {images.length < maxImages && (
          <Card 
            className={cn(
              "relative aspect-square flex flex-col items-center justify-center cursor-pointer border-dashed border-2 transition-all overflow-hidden",
              images.length === 0 && "h-[192px]",
              isDragging 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-muted-foreground/10 hover:border-muted-foreground/30"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Drag overlay */}
            {isDragging && (
              <div
                className="absolute inset-0 z-10 rounded-lg bg-background/80 backdrop-blur-sm ring-2 ring-primary/80 flex items-center justify-center transition-all"
                role="region"
                aria-label="Drop files to upload"
                aria-busy="true"
              >
                <div className="flex flex-col items-center gap-3">
                  <Upload className="h-16 w-16 text-primary/80" />
                  <p className="text-base font-medium">Drop to upload</p>
                  <p className="text-xs text-muted-foreground">Up to {maxImages - images.length} more images</p>
                </div>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={isAnalyzing}
            />
            <label htmlFor="image-upload" className="cursor-pointer relative w-full h-full flex items-center justify-center px-6 py-8">
              {/* Counter - top right */}
              <div className="absolute top-4 right-4 text-xs font-medium text-muted-foreground">
                {images.length}/{maxImages}
              </div>
              
              {/* Main content - centered */}
              <div className="flex flex-col items-center gap-6">
                <Upload className="h-16 w-16 text-muted-foreground/40" />
                
                <div className="flex flex-col items-center gap-2">
                  <p className="text-lg font-medium text-foreground">
                    Upload trade screenshots
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click or drag files here
                  </p>
                </div>
              </div>
              
              {/* Technical specs - bottom left */}
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/80 leading-relaxed">
                <div>PNG, JPEG, WEBP</div>
                <div>Max 10MB per file</div>
                <div>Up to {maxImages} images • 10 trades each</div>
              </div>
            </label>
          </Card>
        )}
      </div>

      {images.length > 0 && (
        <Button
          onClick={analyzeImages}
          disabled={isAnalyzing || images.some(img => img.status === 'analyzing')}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing Images...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Analyze & Detect Trades
            </>
          )}
        </Button>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Trade Import</DialogTitle>
            <DialogDescription>
              Review the detected trades before importing
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Trades detected:</span>
              <span className="font-semibold">{totalTradesDetected}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credits required:</span>
              <span className="font-semibold">{creditsRequired} credits</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cost per trade:</span>
              <span className="text-muted-foreground">2 credits</span>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Images analyzed: {images.filter(img => img.status === 'success').length} / {images.length}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport}>
              Confirm & Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}