'use client';

import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, ArrowLeft, FileX } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

class EditTemplateErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Edit Template Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                  <Link href="/dashboard/notifications/templates">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-destructive">
                    Template Editor Error
                  </h1>
                  <p className="text-muted-foreground">
                    Something went wrong while loading or editing the template
                  </p>
                </div>
              </div>

              {/* Error Details */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Error Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <FileX className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Error:</strong> {this.state.error?.message || 'Unknown error occurred while processing template'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <h4 className="font-medium">Troubleshooting Steps:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      <li>Check your internet connection and try refreshing</li>
                      <li>Verify you have proper permissions to edit templates</li>
                      <li>Ensure the template ID is valid and exists</li>
                      <li>Try accessing the template from the templates list</li>
                      <li>Contact support if the problem persists</li>
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={this.handleRetry} className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retry Loading
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard/notifications/templates">
                        Back to Templates
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Information */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-600">Development Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Error Stack:</strong>
                        <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                          {this.state.error.stack}
                        </pre>
                      </div>
                      {this.state.errorInfo && (
                        <div>
                          <strong>Component Stack:</strong>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <strong className="text-blue-800">Debug Info:</strong>
                        <div className="text-blue-700 text-xs mt-1">
                          URL: {window.location.href}<br/>
                          Timestamp: {new Date().toISOString()}<br/>
                          User Agent: {navigator.userAgent}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EditTemplateErrorBoundary;