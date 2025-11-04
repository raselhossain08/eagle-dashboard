// components/discounts/discount-codes-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class DiscountCodesErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Discount Codes Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleCreateNew = () => {
    window.location.href = '/dashboard/discounts/codes/new';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl">Discount Codes Dashboard Error</CardTitle>
              <CardDescription>
                Something went wrong while loading the discount codes page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="font-medium">{this.state.error?.message || 'Unknown error occurred'}</p>
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Technical Details (Development Mode)</summary>
                      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                        {this.state.error?.stack}
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Try one of these options to resolve the issue:
                </p>
                
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button 
                    onClick={this.handleReset}
                    variant="default"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  
                  <Button 
                    onClick={this.handleReload}
                    variant="outline"
                    className="w-full"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  <Button 
                    onClick={this.handleCreateNew}
                    variant="ghost"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoBack}
                    variant="ghost"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome}
                    variant="ghost"
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </div>
              </div>

              {/* Additional Help */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  If this error persists, please contact support or try accessing the discount codes later.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}