'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class EmailTemplatesErrorBoundary extends Component<Props, State> {
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('Email Templates Error:', error);
    console.error('Error Info:', errorInfo);

    // Show toast notification
    toast.error('Failed to load email templates');
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Email Templates Loading Error
              </CardTitle>
              <CardDescription className="text-base">
                We encountered an issue while loading the email templates page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">Error Details:</h4>
                <p className="text-sm text-red-700 font-mono">
                  {this.state.error?.message || 'Unknown error occurred'}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">What you can try:</h4>
                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                  <li>Check your internet connection</li>
                  <li>Verify you have permission to access email templates</li>
                  <li>Try refreshing the page</li>
                  <li>Contact support if the problem persists</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                <Link href="/dashboard/notifications">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                    <FileText className="w-4 h-4" />
                    Back to Notifications
                  </Button>
                </Link>
                <Link href="/dashboard/notifications/templates/create">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                    <Plus className="w-4 h-4" />
                    Create Template
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 w-full sm:w-auto">
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default EmailTemplatesErrorBoundary;