import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBlur } from '@/contexts/BlurContext';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { BlurredCurrency } from '@/components/ui/BlurredValue';

export const BlurSettings = () => {
  const { isBlurred, setBlurred } = useBlur();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Privacy Settings</CardTitle>
        </div>
        <CardDescription>
          Protect sensitive financial information from unwanted viewing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label htmlFor="blur-toggle" className="flex items-center gap-2">
              {isBlurred ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Blur Sensitive Data
            </Label>
            <p className="text-sm text-muted-foreground">
              Hide financial numbers and balances throughout the app
            </p>
          </div>
          <Switch
            id="blur-toggle"
            checked={isBlurred}
            onCheckedChange={setBlurred}
          />
        </div>

        {/* Preview */}
        <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Preview:</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Account Balance:</span>
              <span className="font-semibold">
                <BlurredCurrency amount={12345.67} showToggle />
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total P&L:</span>
              <span className="font-semibold text-green-600">
                <BlurredCurrency amount={5678.90} showToggle />
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Tip:</strong> Each blurred value can be temporarily revealed by clicking the eye icon next to it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
