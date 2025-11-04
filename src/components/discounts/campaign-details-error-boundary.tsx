// components/discounts/campaign-details-error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  campaignId?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class CampaignDetailsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Campaign Details Error Boundary caught an error:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorInfo
    });

    // Report error to monitoring service (if available)
    // reportError(error, errorInfo, { context: 'CampaignDetails', campaignId: this.props.campaignId });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border bg-card p-6 m-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="space-y-3">
              <div>
                <strong>Campaign Details Error</strong>
              </div>
              <div>
                Something went wrong while displaying the campaign details. This could be due to:
              </div>
              <div className="text-sm">
                <p>• Corrupted campaign data</p>
                <p>• Component rendering issue</p>
                <p>• Network connectivity problems</p>
                <p>• Browser compatibility issues</p>
              </div>
              
              {/* Error details for debugging */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-2 text-xs bg-muted p-2 rounded">
                  <summary>Error Details (Dev Mode)</summary>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
                
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/discounts/campaigns">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Campaigns
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}