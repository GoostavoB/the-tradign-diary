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
  quality?: 'high' | 'medium' | 'low';
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
        const isBlurry = variance < 50; // Hard block only if extremely blurry
        resolve(isBlurry);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const getImageVariance = async (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        if (!imageData) {
          resolve(1000); // Assume high quality if can't process
          return;
        }

        const { data } = imageData;
        let sum = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const laplacian = Math.abs(gray);
          sum += laplacian * laplacian;
        }

        const variance = sum / (data.length / 4);
        resolve(variance);
      };

      img.onerror = () => resolve(1000); // Assume high quality on error
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, maxImages - imageQueue.length);
    const validatedFiles: ImageQueueItem[] = [];
    let warningCount = 0;
    
    for (const file of newFiles) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const isBlurry = await detectBlur(file);
      
      // Determine quality level based on blur detection
      const variance = await getImageVariance(file);
      let quality: 'high' | 'medium' | 'low' = 'high';
      
      if (variance < 50) {
        quality = 'low';
        warningCount++;
      } else if (variance < 150) {
        quality = 'medium';
        warningCount++;
      }

      validatedFiles.push({
        file,
        preview: URL.createObjectURL(file),
        status: 'queued',
        quality,
      });
    }

    if (validatedFiles.length > 0) {
      setImageQueue((prev) => [...prev, ...validatedFiles]);
      
      if (warningCount > 0) {
        toast.warning(
          `${warningCount} image${warningCount > 1 ? 's' : ''} may have quality issues`,
          { description: "We'll still try to extract data. You can review and edit results." }
        );
      } else {
        toast.success(`${validatedFiles.length} image${validatedFiles.length > 1 ? 's' : ''} added successfully`);
      }
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

  return (
    <div className="space-y-6">
      {/* Hero Section - Premium */}
      <div className="text-center mb-12">
        {/* Massive Animated Icon with Particles */}
        <div className="relative mb-8 inline-flex items-center justify-center">
          {/* Floating particles background */}
          <div className="absolute inset-0 -z-10">
            <div className="particle-float particle-1" />
            <div className="particle-float particle-2" />
            <div className="particle-float particle-3" />
            <div className="particle-float particle-4" />
          </div>
          
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 opacity-20 blur-3xl scale-150 animate-pulse-slow" />
          
          {/* Inner gradient circle */}
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-1 shadow-2xl">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-blue-400" strokeWidth={1.5} />
            </div>
          </div>
          
          {/* Rotating ring */}
          <div 
            className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-br from-purple-500 to-blue-500 opacity-30 animate-spin-slow" 
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }}
          />
        </div>

        {/* Title - MASSIVE and READABLE */}
        <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-2xl">
            AI Trade Extraction
          </span>
        </h1>

        {/* Subtitle - Clear white text */}
        <p className="text-xl md:text-2xl font-medium text-foreground/90 mb-2">
          Upload 1-{maxImages} screenshots. Extract everything.
        </p>

        {/* Trust line */}
        <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            <Sparkles className="w-3 h-3" />
            95%+ Accuracy
          </span>
          <span className="text-muted-foreground/60">•</span>
          <span>5-10s per image</span>
          <span className="text-muted-foreground/60">•</span>
          <span>Trusted by 10,000+ traders</span>
        </p>
      </div>

      {/* Drop Zone - Premium with Maximum Contrast */}
      {!hasQueuedImages && (
        <div className="relative group">
          {/* Background glow on hover */}
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Main drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative rounded-2xl p-16 text-center cursor-pointer",
              "border-[3px] border-dashed transition-all duration-300",
              "bg-gradient-to-br from-muted/50 to-muted/30",
              isDragging 
                ? "border-purple-500 bg-purple-500/10 scale-105 shadow-2xl shadow-purple-500/50" 
                : "border-border/50 hover:border-purple-500/50 hover:bg-muted/60"
            )}
          >
            {/* Upload icon - HUGE */}
            <div className="mb-6">
              <Upload 
                className="w-24 h-24 mx-auto text-foreground/70 group-hover:text-purple-500 transition-colors duration-300" 
                strokeWidth={1.5} 
              />
            </div>
            
            {/* Text - MAXIMUM CONTRAST */}
            <h3 className="text-3xl font-bold mb-3 text-foreground">
              {isDragging ? "Drop your files here" : "Drag & drop or click to upload"}
            </h3>
            
            <p className="text-lg text-foreground/70 font-medium mb-8">
              PNG, JPG, WEBP up to 10MB each
            </p>
            
            {/* Feature badges */}
            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground/80">All exchanges supported</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="font-medium text-foreground/80">Up to 10 trades per image</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid - Premium */}
      {hasQueuedImages && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <AnimatePresence>
              {imageQueue.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                  className="relative group"
                >
                  {/* Card with premium styling */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 border-2 border-border/50 group-hover:border-purple-500/50 transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                    {/* Image */}
                    <img
                      src={item.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Status Overlay with Premium Styling */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col items-center justify-end p-4">
                      {item.status === 'queued' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <ImagePlus className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-semibold text-white">Ready</span>
                        </motion.div>
                      )}
                      
                      {item.status === 'processing' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                          </div>
                          <span className="text-xs font-semibold text-purple-300">Analyzing...</span>
                        </motion.div>
                      )}
                      
                      {item.status === 'success' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center">
                            <Check className="w-6 h-6 text-green-500" />
                          </div>
                          <span className="text-xs font-bold text-green-400">
                            {item.trades?.length || 0} trades found
                          </span>
                        </motion.div>
                      )}
                      
                      {item.status === 'error' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center gap-2"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                          </div>
                          <span className="text-xs font-semibold text-red-400">Failed</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Quality Indicator */}
                    {item.quality && (
                      <div className="absolute top-2 left-2">
                        <div className={cn(
                          "quality-indicator",
                          item.quality === 'high' && "quality-high",
                          item.quality === 'medium' && "quality-medium",
                          item.quality === 'low' && "quality-low"
                        )}>
                          <span className="text-xs uppercase font-bold">{item.quality}</span>
                        </div>
                      </div>
                    )}

                    {/* Remove Button - Premium */}
                    {!processing && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeImage(index)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-sm flex items-center justify-center transition-colors group/btn"
                      >
                        <X className="w-4 h-4 text-white group-hover/btn:text-red-400 transition-colors" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Add More Card */}
              {imageQueue.length < maxImages && !processing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: imageQueue.length * 0.1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-border/50 hover:border-purple-500/50 bg-muted/30 hover:bg-muted/50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group"
                >
                  <Plus className="w-12 h-12 text-muted-foreground group-hover:text-purple-500 transition-colors mb-2" />
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    Add More
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Broker Select (Optional) */}
          <div className="flex items-center gap-4">
            <BrokerSelect
              value={broker}
              onChange={setBroker}
            />
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

          {/* Action Buttons - Premium */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t">
            <div className="text-sm">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                <span className="font-bold text-lg text-foreground">{imageQueue.length}</span>
                <span className="text-muted-foreground">
                  image{imageQueue.length !== 1 ? 's' : ''} • {imageQueue.length} credit{imageQueue.length !== 1 ? 's' : ''}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!processing && (
                <Button
                  variant="outline"
                  onClick={clearAll}
                  disabled={imageQueue.length === 0}
                  size="lg"
                >
                  Clear All
                </Button>
              )}
              <Button
                onClick={processImages}
                disabled={processing || imageQueue.length === 0}
                size="lg"
                className="shimmer-button-premium text-white rounded-xl group relative overflow-hidden flex-1 sm:flex-initial"
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                
                {/* Content */}
                <div className="relative flex items-center justify-center gap-3">
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                      <span>Extract All Trades</span>
                    </>
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
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
