'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface UserReportsErrorBoundaryProps {
  children: React.ReactNode;
}

interface UserReportsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class UserReportsErrorBoundary extends React.Component<
  UserReportsErrorBoundaryProps,
  UserReportsErrorBoundaryState
> {
  constructor(props: UserReportsErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): UserReportsErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('User Reports Error Boundary caught an error:', error, errorInfo);
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
            <h1 className="text-3xl font-bold tracking-tight">User Analytics</h1>
            <p className="text-muted-foreground">
              User engagement, acquisition, and behavior analytics
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Error Loading User Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Something went wrong
                </h4>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  {this.state.error?.message || 'An unexpected error occurred while loading the user analytics dashboard.'}
                </p>
                <div className="text-xs text-red-500 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/40 p-2 rounded border">
                  {this.state.error?.stack?.split('\n').slice(0, 3).join('\n')}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReset} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reload Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                >
                  Go Back
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>If this problem persists, please contact support with the error details above.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}