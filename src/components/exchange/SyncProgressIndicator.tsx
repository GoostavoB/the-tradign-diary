import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, X, Download } from "lucide-react";

interface SyncProgress {
  connectionId: string;
  exchangeName: string;
  status: 'pending' | 'syncing' | 'completed' | 'error';
  currentType?: 'trades' | 'orders' | 'deposits' | 'withdrawals';
  progress: number;
  itemsProcessed: number;
  totalItems?: number;
  error?: string;
}

interface SyncProgressIndicatorProps {
  syncProgress: SyncProgress[];
  onCancel?: (connectionId: string) => void;
}

export function SyncProgressIndicator({
  syncProgress,
  onCancel,
}: SyncProgressIndicatorProps) {
  if (syncProgress.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {syncProgress.map((sync) => (
        <Card key={sync.connectionId} className="p-4 shadow-lg border-border/50 backdrop-blur-sm bg-card/95">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {sync.status === 'syncing' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {sync.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-success" />
                )}
                {sync.status === 'error' && (
                  <X className="h-4 w-4 text-destructive" />
                )}
                {sync.status === 'pending' && (
                  <Download className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm text-foreground capitalize">
                  {sync.exchangeName}
                </span>
              </div>
              {onCancel && sync.status === 'syncing' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCancel(sync.connectionId)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Progress Bar */}
            {sync.status !== 'completed' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {sync.currentType ? (
                      <>Syncing {sync.currentType}...</>
                    ) : (
                      <>Preparing sync...</>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    {sync.totalItems ? (
                      <>{sync.itemsProcessed} / {sync.totalItems}</>
                    ) : (
                      <>{sync.itemsProcessed} items</>
                    )}
                  </span>
                </div>
                <Progress value={sync.progress} className="h-2" />
              </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center justify-between">
              {sync.status === 'completed' && (
                <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20 text-xs">
                  Completed • {sync.itemsProcessed} items
                </Badge>
              )}
              {sync.status === 'error' && sync.error && (
                <Badge variant="destructive" className="text-xs">
                  {sync.error}
                </Badge>
              )}
              {sync.status === 'syncing' && (
                <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 text-xs">
                  {Math.round(sync.progress)}% complete
                </Badge>
              )}
              {sync.status === 'pending' && (
                <Badge variant="secondary" className="text-xs">
                  Queued
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
