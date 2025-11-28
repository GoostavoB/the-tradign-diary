import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  widgetId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget Error Boundary caught error:', error, errorInfo);
    console.error('Widget ID:', this.props.widgetId);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <PremiumCard className="p-6 border-destructive/50 bg-destructive/5">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">Widget Error</h3>
              <p className="text-sm text-muted-foreground">
                This widget encountered an error and couldn't be displayed.
              </p>
              {this.state.error && (
                <p className="text-xs text-muted-foreground mt-2 font-mono">
                  {this.state.error.message}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </PremiumCard>
      );
    }

    return this.props.children;
  }
}
