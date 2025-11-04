// app/dashboard/discounts/redemptions/suspicious/page.tsx
'use client';

import { DiscountsDashboardShell } from '@/components/discounts/discounts-dashboard-shell';
import { FraudDetectionPanel } from '@/components/discounts/fraud-detection-panel';
import { RealTimeFraudAlerts } from '@/components/discounts/real-time-fraud-alerts';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Shield, AlertTriangle } from 'lucide-react';
import { useEnhancedFraudDetection, useExportFraudReport } from '@/hooks/use-fraud-detection';
import { toast } from 'sonner';

export default function FraudDetectionPage() {
  // Enhanced fraud detection with real-time capabilities
  const {
    suspiciousActivities,
    fraudMetrics,
    realTimeAlerts,
    isLoading,
    error,
    blockActivity,
    startInvestigation,
    exportReport,
    isBlocking,
    isStartingInvestigation,
    isExporting,
    refetchActivities
  } = useEnhancedFraudDetection({
    autoRefresh: true,
    enableRealTimeAlerts: true
  });

  const handleInvestigate = async (activity: any) => {
    try {
      await startInvestigation({
        activityId: activity.id,
        priority: activity.riskLevel === 'high' ? 'high' : 'medium',
        notes: `Investigating ${activity.type} activity with fraud score ${activity.fraudScore}`
      });
    } catch (error: any) {
      console.error('Investigation failed:', error);
    }
  };

  const handleBlock = async (criteria: any) => {
    try {
      await blockActivity({
        type: criteria.type,
        pattern: criteria.pattern,
        riskLevel: criteria.riskLevel,
        reason: `Blocking ${criteria.type} pattern detected by ML model`
      });
    } catch (error: any) {
      console.error('Block failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await exportReport({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
        format: 'csv',
        includeDetails: true,
        riskLevels: ['medium', 'high']
      });
    } catch (error: any) {
      console.error('Export failed:', error);
    }
  };

  const actions = (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
        disabled={isLoading || isExporting}
      >
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export Report'}
      </Button>
      {realTimeAlerts.length > 0 && (
        <Button 
          variant="destructive" 
          size="sm"
          className="animate-pulse"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          {realTimeAlerts.length} Live Alerts
        </Button>
      )}
    </div>
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

      {/* Real-time Fraud Metrics Dashboard */}
      {fraudMetrics && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">High Risk Alerts</p>
                <p className="text-2xl font-bold text-red-700">{fraudMetrics.highRiskAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-700">{fraudMetrics.mediumRiskAlerts}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Prevented Loss</p>
                <p className="text-2xl font-bold text-green-700">${fraudMetrics.preventedLoss.toLocaleString()}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-blue-700">{fraudMetrics.accuracyRate}%</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fraud Detection Panel - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <FraudDetectionPanel
            suspiciousActivity={suspiciousActivities}
            onInvestigate={handleInvestigate}
            onBlock={handleBlock}
            isLoading={isLoading}
            isBlocking={isBlocking || isStartingInvestigation}
          />
        </div>

        {/* Real-time Alerts Sidebar - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <RealTimeFraudAlerts
            onAlertClick={(alert) => {
              console.log('Alert clicked:', alert);
              // Could open detailed view modal here
            }}
            maxHeight="600px"
          />
        </div>
      </div>
    </DiscountsDashboardShell>
  );
}