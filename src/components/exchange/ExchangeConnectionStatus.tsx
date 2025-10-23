import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ConnectionStatus {
  id: string;
  exchangeName: string;
  healthStatus: 'healthy' | 'degraded' | 'down';
  syncStatus: string;
  lastSyncedAt?: string;
  lastTradeSyncAt?: string;
  lastOrderSyncAt?: string;
  lastDepositSyncAt?: string;
  lastWithdrawalSyncAt?: string;
  syncError?: string;
  failedSyncCount: number;
}

interface ExchangeConnectionStatusProps {
  connection: ConnectionStatus;
  onSync: (connectionId: string) => void;
  onHealthCheck: (connectionId: string) => void;
  isSyncing?: boolean;
}

export function ExchangeConnectionStatus({
  connection,
  onSync,
  onHealthCheck,
  isSyncing = false,
}: ExchangeConnectionStatusProps) {
  const getHealthIcon = () => {
    switch (connection.healthStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'down':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthBadge = () => {
    switch (connection.healthStatus) {
      case 'healthy':
        return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">Healthy</Badge>;
      case 'degraded':
        return <Badge variant="default" className="bg-warning/10 text-warning hover:bg-warning/20">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSyncBadge = () => {
    switch (connection.syncStatus) {
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">Synced</Badge>;
      case 'syncing':
        return <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">Syncing...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending_review':
        return <Badge variant="default" className="bg-warning/10 text-warning hover:bg-warning/20">Review Pending</Badge>;
      default:
        return <Badge variant="secondary">Not Synced</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getHealthIcon()}
            <div>
              <h3 className="font-semibold text-foreground capitalize">
                {connection.exchangeName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {getHealthBadge()}
                {getSyncBadge()}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onHealthCheck(connection.id)}
            >
              <Activity className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(connection.id)}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Sync Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          {connection.lastTradeSyncAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Trades: {formatDistanceToNow(new Date(connection.lastTradeSyncAt), { addSuffix: true })}</span>
            </div>
          )}
          {connection.lastOrderSyncAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Orders: {formatDistanceToNow(new Date(connection.lastOrderSyncAt), { addSuffix: true })}</span>
            </div>
          )}
          {connection.lastDepositSyncAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Deposits: {formatDistanceToNow(new Date(connection.lastDepositSyncAt), { addSuffix: true })}</span>
            </div>
          )}
          {connection.lastWithdrawalSyncAt && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Withdrawals: {formatDistanceToNow(new Date(connection.lastWithdrawalSyncAt), { addSuffix: true })}</span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {connection.syncError && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Sync Error</p>
                <p className="text-xs mt-1">{connection.syncError}</p>
                {connection.failedSyncCount > 1 && (
                  <p className="text-xs mt-1 opacity-80">
                    Failed {connection.failedSyncCount} times
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
