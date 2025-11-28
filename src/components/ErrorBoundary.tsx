import { Component, ReactNode } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle runtime errors
 * Prevents entire app crashes and provides user-friendly error UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <PremiumCard className="max-w-lg w-full p-8 space-y-6 glass">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Something went wrong</h2>
                <p className="text-muted-foreground mt-1">
                  We encountered an unexpected error
                </p>
              </div>
            </div>

            {this.state.error && (
              <Alert variant="destructive" className="glass-strong">
                <AlertDescription className="font-mono text-xs break-all">
                  {this.state.error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={this.handleReset}
                className="flex-1 gap-2"
                variant="default"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="flex-1 gap-2"
                variant="outline"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              If this problem persists, please contact support
            </p>
          </PremiumCard>
        </div>
      );
    }

    return this.props.children;
  }
}
