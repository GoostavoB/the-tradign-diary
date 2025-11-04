import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Sparkles, Check, Loader2, AlertCircle, Plus, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BrokerSelect } from './BrokerSelect';
import type { ExtractedTrade } from '@/types/trade';
import { cn } from '@/lib/utils';

interface SmartUploadProps {
  onTradesExtracted: (trades: ExtractedTrade[]) => void;
  onShowAnnotator?: () => void;
  maxImages?: number;
}

interface ImageQueueItem {
  file: File;
  preview: string;
  status: 'queued' | 'processing' | 'success' | 'error';
  trades?: ExtractedTrade[];
  error?: string;
}

export function SmartUpload({ onTradesExtracted, onShowAnnotator, maxImages = 10 }: SmartUploadProps) {
  const [imageQueue, setImageQueue] = useState<ImageQueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [totalTradesFound, setTotalTradesFound] = useState(0);
  const [broker, setBroker] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side blur detection
  const detectBlur = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) return resolve(false);

        // Simple blur detection using Laplacian variance
        const data = imageData.data;
        let sum = 0;
        const step = 4;

        for (let i = 0; i < data.length; i += step * 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          sum += gray * gray;
        }

        const variance = sum / (data.length / 4);
        const isBlurry = variance < 1000; // Threshold for blur
        resolve(isBlurry);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, maxImages - imageQueue.length);
    
    // Validate and add files
    const validatedFiles: ImageQueueItem[] = [];
    
    for (const file of newFiles) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      // Check blur
      const isBlurry = await detectBlur(file);
      if (isBlurry) {
        toast.error(`${file.name} is too blurry. Please upload a clearer screenshot.`);
        continue;
      }

      // Add to queue
      validatedFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'queued',
      });
    }

    if (validatedFiles.length > 0) {
      setImageQueue((prev) => [...prev, ...validatedFiles]);
      toast.success(`${validatedFiles.length} image${validatedFiles.length > 1 ? 's' : ''} added`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await handleFileSelect(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setImageQueue((prev) => {
      const newQueue = [...prev];
      URL.revokeObjectURL(newQueue[index].preview);
      newQueue.splice(index, 1);
      return newQueue;
    });
  };

  const clearAll = () => {
    imageQueue.forEach((item) => URL.revokeObjectURL(item.preview));
    setImageQueue([]);
    setProgress(0);
    setCurrentImageIndex(0);
    setTotalTradesFound(0);
  };

  const processImages = async () => {
    if (imageQueue.length === 0) return;

    setProcessing(true);
    setProgress(0);
    setCurrentImageIndex(0);
    setTotalTradesFound(0);

    const allTrades: ExtractedTrade[] = [];
    
    for (let i = 0; i < imageQueue.length; i++) {
      setCurrentImageIndex(i);
      const item = imageQueue[i];
      
      // Update status to processing
      setImageQueue((prev) => {
        const updated = [...prev];
        updated[i] = { ...updated[i], status: 'processing' };
        return updated;
      });

      try {
        // Convert file to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(item.file);
        });
        const imageBase64 = await base64Promise;

        // Call vision extraction
        const { data, error } = await supabase.functions.invoke('vision-extract-trades', {
          body: {
            imageBase64: imageBase64.split(',')[1],
            broker: broker || undefined,
          },
        });

        if (error) throw error;

        if (!data.success) {
          throw new Error(data.error || 'Extraction failed');
        }

        const trades = data.trades || [];
        
        // Update status to success
        setImageQueue((prev) => {
          const updated = [...prev];
          updated[i] = { 
            ...updated[i], 
            status: 'success',
            trades,
          };
          return updated;
        });

        allTrades.push(...trades);
        setTotalTradesFound((prev) => prev + trades.length);

      } catch (error: any) {
        console.error('Extraction error:', error);
        
        // Update status to error
        setImageQueue((prev) => {
          const updated = [...prev];
          updated[i] = { 
            ...updated[i], 
            status: 'error',
            error: error.message || 'Failed to extract',
          };
          return updated;
        });

        toast.error(`Failed to extract from image ${i + 1}`);
      }

      // Update progress
      setProgress(((i + 1) / imageQueue.length) * 100);
    }

    setProcessing(false);

    // Call the callback with all trades
    if (allTrades.length > 0) {
      onTradesExtracted(allTrades);
    } else {
      toast.error('No trades found in any images');
    }
  };

  const hasQueuedImages = imageQueue.length > 0;
  const hasProcessedImages = imageQueue.some((item) => item.status !== 'queued');

  return (
    <div className="space-y-6">
      {/* Hero Upload Zone */}
      <Card className={cn(
        "glass-card-refined p-8 space-y-6",
        !hasQueuedImages && "gradient-ai-border"
      )}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-ai mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text-hero">Smart AI Trade Extraction</h2>
          <p className="text-muted-foreground">Upload 1-{maxImages} screenshots at once</p>
          
          {/* Feature bullets */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              <span>Supports all major exchanges</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              <span>95%+ accuracy</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 text-primary" />
              <span>Up to 10 trades per image</span>
            </div>
          </div>
        </div>

        {/* Drop Zone or Image Queue */}
        {!hasQueuedImages ? (
          <div
            className={cn(
              "drop-zone-premium rounded-xl p-12 text-center cursor-pointer",
              isDragging && "dragging"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drag & drop or click to upload</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP up to 10MB each
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {imageQueue.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="image-card-premium rounded-lg overflow-hidden relative aspect-square"
                  >
                    <img
                      src={item.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end p-2">
                      {item.status === 'queued' && (
                        <div className="text-white text-xs">Ready</div>
                      )}
                      {item.status === 'processing' && (
                        <div className="flex flex-col items-center gap-1">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                          <div className="text-white text-xs">Processing...</div>
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="flex flex-col items-center gap-1">
                          <Check className="w-5 h-5 text-success" />
                          <div className="text-success text-xs">
                            {item.trades?.length || 0} trades
                          </div>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="flex flex-col items-center gap-1">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <div className="text-destructive text-xs">Failed</div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    {!processing && (
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add More Button */}
              {imageQueue.length < maxImages && !processing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/30 hover:border-primary rounded-lg aspect-square flex flex-col items-center justify-center gap-2 transition-colors"
                >
                  <Plus className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add More</span>
                </button>
              )}
            </div>

            {/* Broker Select (Optional) */}
            <div className="flex items-center gap-4">
              <BrokerSelect
                value={broker}
                onChange={setBroker}
              />
            </div>

            {/* Cost Display */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Total Cost: <span className="font-bold text-foreground">{imageQueue.length} credit{imageQueue.length !== 1 ? 's' : ''}</span>
                {' • '}
                Up to <span className="font-bold text-foreground">{imageQueue.length * 10} trades</span>
              </p>
            </div>

            {/* Progress Bar (when processing) */}
            {processing && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Processing Image {currentImageIndex + 1} of {imageQueue.length}
                  </span>
                  <span className="font-bold">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {totalTradesFound} trades found so far
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!processing ? (
                <>
                  <Button
                    onClick={clearAll}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={processImages}
                    size="lg"
                    className="flex-1 shimmer-button text-white font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Extract Trades ({imageQueue.length} credit{imageQueue.length !== 1 ? 's' : ''})
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    setProcessing(false);
                    toast.info('Processing cancelled');
                  }}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Cancel Processing
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Hidden file input for "Add More" */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}
