import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class NotificationAnalyticsErrorBoundary extends React.Component<
  AnalyticsErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: AnalyticsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analytics error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto max-w-4xl p-4">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Analytics</h1>
                <p className="text-muted-foreground">
                  Monitor email performance and engagement metrics
                </p>
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Analytics Error:</strong> {this.state.error?.message || 'Failed to load analytics dashboard'}
                </AlertDescription>
              </Alert>

              <Card>
                <CardContent className="pt-6 text-center space-y-4">
                  <div>
                    <p className="text-lg font-medium text-muted-foreground mb-2">Analytics Unavailable</p>
                    <p className="text-sm text-muted-foreground">
                      There was an error loading the analytics dashboard. Please try refreshing the page.
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <Button onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Page
                    </Button>
                    <Button variant="outline" onClick={() => this.setState({ hasError: false })}>
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}