// components/discounts/redemption-analytics-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class RedemptionAnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Redemption Analytics Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry, Application Insights)
      console.error('Production error in Redemption Analytics:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleNavigateHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Analytics Dashboard Error</CardTitle>
              <CardDescription>
                We encountered an unexpected error while loading the redemption analytics dashboard.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  Error Details: {this.state.error?.message || 'Unknown error occurred'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="rounded-lg border p-4 bg-muted/50">
                  <summary className="cursor-pointer font-medium text-sm mb-2">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto mt-2">
                      Component Stack: {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>
                
                <Button variant="outline" onClick={this.handleNavigateHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>If this problem persists, please contact support.</p>
                
                <div className="flex items-center justify-center gap-4 pt-2">
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <a href="/dashboard/discounts">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Discounts Overview
                    </a>
                  </Button>
                  <span className="text-muted-foreground">•</span>
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <a href="/dashboard/discounts/codes">
                      Discount Codes
                    </a>
                  </Button>
                  <span className="text-muted-foreground">•</span>
                  <Button variant="link" size="sm" asChild className="h-auto p-0">
                    <a href="/dashboard/discounts/redemptions">
                      Redemptions
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}