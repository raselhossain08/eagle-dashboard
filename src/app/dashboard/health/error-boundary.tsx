'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface HealthErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function HealthErrorFallback({ error, resetErrorBoundary }: HealthErrorFallbackProps) {
  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Health Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">An error occurred while loading the health dashboard:</p>
            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
              {error.message}
            </pre>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={resetErrorBoundary} 
              variant="default"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Reload Page
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>If this issue persists, please contact support with the error details above.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface HealthErrorBoundaryProps {
  children: ReactNode;
}

interface HealthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class HealthErrorBoundary extends Component<HealthErrorBoundaryProps, HealthErrorBoundaryState> {
  constructor(props: HealthErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): HealthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Health Dashboard Error:', error, errorInfo);
    // TODO: Send error to logging service
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <HealthErrorFallback
          error={this.state.error}
          resetErrorBoundary={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}