import { useState, useCallback } from 'react';
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
}

export function MultiImageUpload({ onTradesExtracted }: MultiImageUploadProps) {
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [totalTradesDetected, setTotalTradesDetected] = useState(0);
  const [creditsRequired, setCreditsRequired] = useState(0);
  const [extractedTrades, setExtractedTrades] = useState<any[]>([]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const newImages: UploadedImage[] = [];
    const remainingSlots = 3 - images.length;

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

  const analyzeImages = async () => {
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
                dryRun: true  // Don't deduct credits yet
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
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
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
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isAnalyzing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {image.status === 'analyzing' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {image.status === 'success' && (
                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
              {image.status === 'error' && (
                <div className="absolute top-2 right-2 bg-destructive rounded-full p-1">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            {image.tradesDetected !== undefined && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white text-xs p-2 text-center">
                {image.tradesDetected} {image.tradesDetected === 1 ? 'trade' : 'trades'} detected
              </div>
            )}
          </Card>
        ))}

        {images.length < 3 && (
          <Card className={cn(
            "aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors",
            images.length === 0 && "col-span-3"
          )}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={isAnalyzing}
            />
            <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2 p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Click to upload<br />
                ({images.length}/3 slots used)
              </p>
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