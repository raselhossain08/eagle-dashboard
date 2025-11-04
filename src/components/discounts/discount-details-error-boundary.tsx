// components/discounts/discount-details-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  discountId?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class DiscountDetailsErrorBoundary extends Component<Props, State> {
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
    console.error('Discount Details Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack,
    });

    // Log to external error reporting service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Discount Details Error: ${error.message}`,
        fatal: false,
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.location.href = '/dashboard/discounts/codes';
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DiscountsDashboardShell
          title="Edit Discount Code"
          description="Update discount code settings and targeting"
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Discounts', href: '/dashboard/discounts' },
            { label: 'Codes', href: '/dashboard/discounts/codes' },
            { label: 'Edit' }
          ]}
        >
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Discount Details Error
              </CardTitle>
              <CardDescription>
                Something went wrong while loading the discount details page. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive font-medium">
                    Error: {this.state.error.message}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="default"
                  size="sm"
                >
                  Reload Page
                </Button>

                <Button 
                  onClick={this.handleGoBack}
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Codes
                </Button>

                <Button 
                  onClick={this.handleGoHome}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="mt-2 p-3 bg-muted text-xs text-muted-foreground overflow-auto rounded-md max-h-60">
                    {this.state.errorInfo}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </DiscountsDashboardShell>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper component for easier usage
export function DiscountDetailsErrorWrapper({ children, discountId }: { children: ReactNode; discountId?: string }) {
  return (
    <DiscountDetailsErrorBoundary discountId={discountId}>
      {children}
    </DiscountDetailsErrorBoundary>
  );
}