'use client';

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SendEmailErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Send Email page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto max-w-4xl p-4">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/dashboard/notifications/email">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Send Email Error</h1>
                  <p className="text-muted-foreground">
                    Something went wrong while loading the email composer
                  </p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Application Error
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {this.state.error?.message || 'An unexpected error occurred'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">What you can try:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Refresh the page to reload the email composer</li>
                        <li>Check your internet connection</li>
                        <li>Clear your browser cache and cookies</li>
                        <li>Try navigating back and opening the page again</li>
                        <li>Contact support if the problem persists</li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => {
                          this.setState({ hasError: false, error: undefined });
                          window.location.reload();
                        }}
                        className="flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                      </Button>
                      
                      <Button variant="outline" asChild className="flex-1">
                        <Link href="/dashboard/notifications/email">
                          <Mail className="h-4 w-4 mr-2" />
                          Back to Email Logs
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Help */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Need help? Contact our support team
                    </p>
                    <Button variant="link" size="sm" asChild>
                      <Link href="/support">Get Support</Link>
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