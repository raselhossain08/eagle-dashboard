import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SubscriberActivityErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SubscriberActivityErrorBoundary extends React.Component<
  SubscriberActivityErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: SubscriberActivityErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Subscriber Activity error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/subscribers">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Activity Timeline</h1>
                <p className="text-muted-foreground">
                  Recent activity and events for subscriber
                </p>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Activity Error:</strong> {this.state.error?.message || 'Failed to load subscriber activity'}
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div>
                <p className="text-lg font-medium text-muted-foreground mb-2">Activity Unavailable</p>
                <p className="text-sm text-muted-foreground">
                  There was an error loading the activity timeline. Please try refreshing the page.
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
      );
    }

    return this.props.children;
  }
}