// components/discounts/fraud-detection-panel.tsx
'use client';

import { Redemption } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Eye, Ban } from 'lucide-react';

interface SuspiciousActivity {
  type: 'multiple_ips' | 'bulk_redemptions' | 'unusual_pattern';
  count: number;
  details: string;
  redemptions: Redemption[];
}

interface FraudDetectionPanelProps {
  suspiciousActivity: SuspiciousActivity[];
  onInvestigate: (activity: SuspiciousActivity) => void;
  onBlock: (criteria: any) => void;
  isLoading?: boolean;
}

export function FraudDetectionPanel({
  suspiciousActivity,
  onInvestigate,
  onBlock,
  isLoading
}: FraudDetectionPanelProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'multiple_ips':
        return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'bulk_redemptions':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'unusual_pattern':
        return <Ban className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityBadge = (type: string) => {
    switch (type) {
      case 'multiple_ips':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>;
      case 'bulk_redemptions':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700">High</Badge>;
      case 'unusual_pattern':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Critical</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

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
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-muted-foreground">Resolved Today</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Suspicious Activities</h3>
        {suspiciousActivity.map((activity, index) => (
          <Card key={index} className="border-l-4 border-l-yellow-400">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getActivityIcon(activity.type)}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium capitalize">
                        {activity.type.replace('_', ' ')}
                      </h4>
                      {getSeverityBadge(activity.type)}
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
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Investigate
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onBlock({ type: activity.type, pattern: activity.details })}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Block
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}