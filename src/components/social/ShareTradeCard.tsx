import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Share2, Download, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html-to-image';

interface ShareTradeCardProps {
  trade: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareTradeCard({ trade, open, onOpenChange }: ShareTradeCardProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateCard = async () => {
    setIsGenerating(true);
    try {
      const cardElement = document.getElementById('trade-share-card');
      if (!cardElement) return;

      const dataUrl = await html2canvas.toPng(cardElement, {
        quality: 1.0,
        pixelRatio: 2,
      });

      return dataUrl;
    } catch (error) {
      console.error('Error generating card:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate share card',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const dataUrl = await generateCard();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `trade-${trade.id}.png`;
    link.href = dataUrl;
    link.click();

    toast({
      title: 'Downloaded!',
      description: 'Your trade card has been downloaded.',
    });
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/trades/${trade.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Link copied!',
      description: 'Share link copied to clipboard.',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${trade.symbol} Trade`,
          text: `Check out my ${trade.side} trade on ${trade.symbol}`,
          url: `${window.location.origin}/trades/${trade.id}`,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const profitColor = trade.profit >= 0 ? 'text-green-500' : 'text-red-500';
  const profitSign = trade.profit >= 0 ? '+' : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Trade</DialogTitle>
        </DialogHeader>

        <div id="trade-share-card" className="bg-gradient-to-br from-primary/20 to-accent/20 p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{trade.symbol}</h3>
              <p className="text-sm text-muted-foreground">{trade.side}</p>
            </div>
            <div className={`text-right ${profitColor}`}>
              <p className="text-2xl font-bold">{profitSign}{trade.profit?.toFixed(2)}%</p>
              <p className="text-sm">{profitSign}${Math.abs(trade.profit_loss || 0).toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Entry</p>
              <p className="font-semibold">${trade.entry_price?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Exit</p>
              <p className="font-semibold">${trade.exit_price?.toFixed(2)}</p>
            </div>
          </div>

          <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
            The Trading Diary
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleDownload} disabled={isGenerating} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="flex-1">
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          {navigator.share && (
            <Button onClick={handleShare} variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
