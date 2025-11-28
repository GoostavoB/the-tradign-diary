import React, { Component, ReactNode } from 'react';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface WidgetErrorBoundaryProps {
    children: ReactNode;
    widgetId?: string;
    widgetTitle?: string;
}

interface WidgetErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class WidgetErrorBoundary extends Component<
    WidgetErrorBoundaryProps,
    WidgetErrorBoundaryState
> {
    constructor(props: WidgetErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<WidgetErrorBoundaryState> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Widget Error:', {
            widgetId: this.props.widgetId,
            widgetTitle: this.props.widgetTitle,
            error,
            errorInfo,
        });

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <PremiumCard className="border-destructive bg-destructive/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle className="text-base">
                                {this.props.widgetTitle || 'Widget'} Error
                            </CardTitle>
                        </div>
                        <CardDescription className="text-destructive/80">
                            This widget failed to load properly
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="rounded-md bg-muted p-3 text-xs font-mono">
                                    <p className="text-destructive font-semibold mb-1">
                                        {this.state.error.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {this.state.error.message}
                                    </p>
                                </div>
                            )}
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                size="sm"
                                className="w-full"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </PremiumCard>
            );
        }

        return this.props.children;
    }
}
