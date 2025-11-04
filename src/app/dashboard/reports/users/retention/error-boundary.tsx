'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';

interface RetentionErrorBoundaryProps {
  children: React.ReactNode;
}

interface RetentionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class RetentionErrorBoundary extends React.Component<
  RetentionErrorBoundaryProps,
  RetentionErrorBoundaryState
> {
  constructor(props: RetentionErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): RetentionErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Retention Error Boundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Force page reload to reset state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              User Retention Analysis
            </h1>
            <p className="text-muted-foreground">
              Cohort analysis and user retention metrics over time
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error Loading Retention Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Retention Analysis Failed
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  {this.state.error?.message || 'An unexpected error occurred while loading the retention analysis dashboard.'}
                </p>
                <div className="text-xs text-red-500 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded border">
                  {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Analysis
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                >
                  Back to Reports
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>If this problem persists, please contact support with the error details above.</p>
                <p className="mt-2">This error may be caused by:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Network connectivity issues</li>
                  <li>Backend service unavailability</li>
                  <li>Invalid date range or cohort parameters</li>
                  <li>Insufficient user permissions</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}