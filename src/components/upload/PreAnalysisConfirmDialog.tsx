import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Image } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PreAnalysisConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageCount: number;
  creditsRequired: number;
  currentBalance: number;
  onConfirm: () => void;
  onPurchaseCredits: () => void;
  isAnalyzing: boolean;
  broker: string;
  onBrokerChange: (broker: string) => void;
}

export const PreAnalysisConfirmDialog = ({
  open,
  onOpenChange,
  imageCount,
  creditsRequired,
  currentBalance,
  onConfirm,
  onPurchaseCredits,
  isAnalyzing,
  broker,
  onBrokerChange,
}: PreAnalysisConfirmDialogProps) => {
  const hasEnoughCredits = currentBalance >= creditsRequired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Image Analysis</DialogTitle>
          <DialogDescription>
            Review the cost before proceeding with AI-powered trade extraction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="broker-select">Broker/Exchange</Label>
            <Select value={broker} onValueChange={onBrokerChange}>
              <SelectTrigger id="broker-select">
                <SelectValue placeholder="Select broker (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Binance">Binance</SelectItem>
                <SelectItem value="Bybit">Bybit</SelectItem>
                <SelectItem value="OKX">OKX</SelectItem>
                <SelectItem value="Bitget">Bitget</SelectItem>
                <SelectItem value="HTX">HTX</SelectItem>
                <SelectItem value="KuCoin">KuCoin</SelectItem>
                <SelectItem value="Gate.io">Gate.io</SelectItem>
                <SelectItem value="MEXC">MEXC</SelectItem>
                <SelectItem value="BingX">BingX</SelectItem>
                <SelectItem value="Kraken">Kraken</SelectItem>
                <SelectItem value="Coinbase">Coinbase</SelectItem>
                <SelectItem value="Bitfinex">Bitfinex</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be automatically applied to all detected trades
            </p>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            <p className="text-muted-foreground">
              <strong>Processing limits:</strong> Up to 10 trades per image. Rate limits: 15 images/minute, 150 images/hour. 
              Large batches will be automatically queued and processed progressively.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Images to analyze</span>
            </div>
            <span className="text-lg font-bold">{imageCount}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Credits required</span>
            <span className="text-lg font-bold">{creditsRequired}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Cost per upload</span>
            <span className="text-lg font-bold">1 credit</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-medium">Your current balance</span>
            <span className={`text-lg font-bold ${hasEnoughCredits ? 'text-green-600' : 'text-destructive'}`}>
              {currentBalance}
            </span>
          </div>

          {!hasEnoughCredits && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-destructive mb-1">Insufficient Credits</p>
                <p className="text-muted-foreground">
                  You need {creditsRequired - currentBalance} more credit{creditsRequired - currentBalance !== 1 ? 's' : ''} to proceed.
                  Purchase additional credits to continue.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!hasEnoughCredits && (
            <Button
              onClick={onPurchaseCredits}
              variant="default"
              className="w-full sm:w-auto"
            >
              Purchase Credits
            </Button>
          )}
          <Button
            onClick={onConfirm}
            disabled={!hasEnoughCredits || isAnalyzing}
            variant={hasEnoughCredits ? 'default' : 'secondary'}
            className="w-full sm:w-auto"
          >
            {isAnalyzing ? 'Analyzing...' : 'Proceed with Analysis'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
