// app/dashboard/discounts/redemptions/suspicious/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { FraudDetectionPanel } from '@/components/discounts/fraud-detection-panel';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Shield, AlertTriangle } from 'lucide-react';
import { useSuspiciousRedemptions, useBlockSuspiciousActivity, useExportRedemptions } from '@/hooks/use-redemptions';
import { toast } from 'sonner';

export default function FraudDetectionPage() {
  // Fetch suspicious redemptions data
  const { 
    data: suspiciousActivity, 
    isLoading, 
    error, 
    refetch 
  } = useSuspiciousRedemptions();

  // Mutations
  const blockActivity = useBlockSuspiciousActivity();
  const exportRedemptions = useExportRedemptions();

  const handleInvestigate = (activity: any) => {
    console.log('Investigating:', activity);
    // You could open a detailed investigation modal here
    toast.info('Investigation started for suspicious activity');
  };

  const handleBlock = async (criteria: any) => {
    try {
      await blockActivity.mutateAsync(criteria);
      toast.success('Suspicious activity blocked successfully');
      refetch(); // Refresh the data
    } catch (error: any) {
      toast.error('Failed to block suspicious activity');
      console.error('Block failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportRedemptions.mutateAsync({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
        format: 'csv',
        filters: { search: 'suspicious' } // Filter for suspicious redemptions
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `suspicious-redemptions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Suspicious activity report exported successfully');
    } catch (error: any) {
      toast.error('Failed to export report');
      console.error('Export failed:', error);
    }
  };

  const actions = (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
      disabled={isLoading || exportRedemptions.isPending}
    >
      <Download className="mr-2 h-4 w-4" />
      {exportRedemptions.isPending ? 'Exporting...' : 'Export Report'}
    </Button>
  );

  return (
    <DiscountsDashboardShell
      title="Fraud Detection"
      description="Monitor and investigate suspicious redemption activity"
      actions={actions}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Discounts', href: '/dashboard/discounts' },
        { label: 'Redemptions', href: '/dashboard/discounts/redemptions' },
        { label: 'Fraud Detection' }
      ]}
    >
      {/* Error State */}
      {error && (
        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load suspicious activity data: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 animate-spin" />
            <span>Analyzing redemption patterns...</span>
          </div>
        </div>
      )}

      {/* Fraud Detection Panel */}
      {suspiciousActivity && (
        <FraudDetectionPanel
          suspiciousActivity={suspiciousActivity}
          onInvestigate={handleInvestigate}
          onBlock={handleBlock}
          isBlocking={blockActivity.isPending}
        />
      )}

      {/* No Suspicious Activity */}
      {!isLoading && suspiciousActivity && suspiciousActivity.length === 0 && (
        <div className="text-center p-8">
          <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">All Clear</h3>
          <p className="text-muted-foreground">
            No suspicious redemption activity detected in the recent period.
          </p>
        </div>
      )}
    </DiscountsDashboardShell>
  );
}