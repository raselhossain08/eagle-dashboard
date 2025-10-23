// components/discounts/fraud-detection-panel.tsx
'use client';

import { Redemption } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, Ban } from 'lucide-react';

interface SuspiciousActivity {
  type: 'multiple_ips' | 'bulk_redemptions' | 'unusual_pattern' | 'high_value_new_user';
  count: number;
  details: string;
  redemptions: Redemption[];
  fraudScore?: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface FraudDetectionPanelProps {
  suspiciousActivity: SuspiciousActivity[];
  onInvestigate: (activity: SuspiciousActivity) => void;
  onBlock: (criteria: any) => void;
  isLoading?: boolean;
  isBlocking?: boolean;
}

export function FraudDetectionPanel({
  suspiciousActivity,
  onInvestigate,
  onBlock,
  isLoading,
  isBlocking
}: FraudDetectionPanelProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'multiple_ips':
        return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'bulk_redemptions':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'unusual_pattern':
        return <Ban className="h-5 w-5 text-red-500" />;
      case 'high_value_new_user':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-700">High Risk</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'multiple_ips':
        return 'Multiple IP Addresses';
      case 'bulk_redemptions':
        return 'Bulk Redemptions';
      case 'unusual_pattern':
        return 'Unusual Pattern';
      case 'high_value_new_user':
        return 'High Value New User';
      default:
        return type.replace('_', ' ');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 animate-spin" />
          <span>Analyzing redemption patterns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Fraud Detection Overview
          </CardTitle>
          <CardDescription>
            Monitor suspicious activities and take action to prevent fraud
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{suspiciousActivity.length}</div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {suspiciousActivity.reduce((sum, activity) => sum + activity.count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Suspicious Redemptions</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {suspiciousActivity.filter(a => a.riskLevel === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Suspicious Activities</h3>
        {suspiciousActivity.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All Clear</h3>
              <p className="text-muted-foreground">
                No suspicious redemption activity detected in the recent period.
              </p>
            </CardContent>
          </Card>
        ) : (
          suspiciousActivity.map((activity, index) => (
            <Card key={index} className={`border-l-4 ${
              activity.riskLevel === 'high' ? 'border-l-red-400' :
              activity.riskLevel === 'medium' ? 'border-l-yellow-400' :
              'border-l-green-400'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getActivityIcon(activity.type)}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {getActivityTitle(activity.type)}
                        </h4>
                        {getSeverityBadge(activity.riskLevel)}
                        {activity.fraudScore && (
                          <Badge variant="secondary">
                            Score: {activity.fraudScore}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.details}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-red-600 font-medium">
                          {activity.count} occurrences
                        </span>
                        <span>
                          {activity.redemptions.length} redemptions affected
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onInvestigate(activity)}
                      disabled={isBlocking}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Investigate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onBlock({ 
                        type: activity.type, 
                        pattern: activity.details,
                        riskLevel: activity.riskLevel 
                      })}
                      disabled={isBlocking}
                    >
                      <Ban className="mr-2 h-4 w-4" />
                      {isBlocking ? 'Blocking...' : 'Block'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}