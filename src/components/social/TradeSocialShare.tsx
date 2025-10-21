import { useState } from 'react';
import { Share2, Lock, Globe, Users, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Trade } from '@/types/trade';
import { formatNumber } from '@/utils/formatNumber';

interface TradeSocialShareProps {
  trade: Trade;
  trigger?: React.ReactNode;
}

export const TradeSocialShare = ({ trade, trigger }: TradeSocialShareProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [includeChart, setIncludeChart] = useState(true);
  const [hideAmount, setHideAmount] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create social post
      const { error: postError } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: caption || `${trade.side} trade on ${trade.symbol}`,
          post_type: 'trade_share',
          visibility,
          trade_data: {
            symbol: trade.symbol,
            side: trade.side,
            entry_price: trade.entry_price,
            exit_price: trade.exit_price,
            pnl: hideAmount ? null : trade.pnl,
            roi: trade.roi,
            setup: trade.setup,
            duration_minutes: trade.duration_minutes,
          },
          media_urls: includeChart && trade.screenshot_url ? [trade.screenshot_url] : [],
        });

      if (postError) throw postError;

      toast({
        title: 'Trade shared!',
        description: 'Your trade has been shared to your feed.',
      });

      setOpen(false);
      setCaption('');
    } catch (error) {
      console.error('Error sharing trade:', error);
      toast({
        title: 'Share failed',
        description: 'Could not share your trade. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const profitLoss = trade.pnl || 0;
  const isProfitable = profitLoss > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Preview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{trade.symbol}</CardTitle>
                  <p className="text-sm text-muted-foreground">{trade.setup || 'Trade'}</p>
                </div>
                <Badge variant={isProfitable ? 'default' : 'destructive'}>
                  {isProfitable ? '+' : ''}${profitLoss.toFixed(2)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Side:</span>
                <span className="font-medium capitalize">{trade.side}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry:</span>
                <span className="font-mono">${(trade.entry_price || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exit:</span>
                <span className="font-mono">${(trade.exit_price || 0).toFixed(2)}</span>
              </div>
              {!hideAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI:</span>
                  <span className={`font-medium ${isProfitable ? 'text-neon-green' : 'text-neon-red'}`}>
                    {isProfitable ? '+' : ''}{trade.roi?.toFixed(2)}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Caption */}
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (optional)</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about this trade..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">{caption.length}/500</p>
          </div>

          {/* Visibility */}
          <div className="space-y-3">
            <Label>Who can see this?</Label>
            <RadioGroup value={visibility} onValueChange={(value: any) => setVisibility(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">Anyone can see this trade</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="followers" id="followers" />
                <Label htmlFor="followers" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Followers only</p>
                    <p className="text-xs text-muted-foreground">Only your followers can see</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Private</p>
                    <p className="text-xs text-muted-foreground">Only you can see this</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="include-chart" className="cursor-pointer">Include chart screenshot</Label>
              </div>
              <Switch
                id="include-chart"
                checked={includeChart}
                onCheckedChange={setIncludeChart}
                disabled={!trade.screenshot_url}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="hide-amount" className="cursor-pointer">Hide P&L amount</Label>
              </div>
              <Switch
                id="hide-amount"
                checked={hideAmount}
                onCheckedChange={setHideAmount}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={loading}>
              {loading ? 'Sharing...' : 'Share Trade'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
