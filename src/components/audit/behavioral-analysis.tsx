'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Zap, Shield, UserCheck } from 'lucide-react';

interface BehavioralAnalysisProps {
  data: Array<{
    adminId: string;
    adminEmail: string;
    behaviorPattern: {
      activityFrequency: number;
      riskScore: number;
      successRate: number;
      responseTime: number;
      anomalyScore: number;
    };
    patterns: string[];
    recommendations: string[];
  }>;
  isLoading?: boolean;
}

export function BehavioralAnalysis({ data, isLoading }: BehavioralAnalysisProps) {
  if (isLoading) {
    return <div className="h-[400px] animate-pulse bg-muted rounded-lg" />;
  }

  const getBehaviorIcon = (pattern: string) => {
    switch (pattern.toLowerCase()) {
      case 'high-frequency': return <Zap className="h-4 w-4" />;
      case 'risky-actions': return <AlertTriangle className="h-4 w-4" />;
      case 'slow-response': return <Clock className="h-4 w-4" />;
      case 'security-focused': return <Shield className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Behavioral Radar Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.slice(0, 4).map((admin) => {
          const radarData = [
            { subject: 'Frequency', A: admin.behaviorPattern.activityFrequency, fullMark: 100 },
            { subject: 'Risk', A: admin.behaviorPattern.riskScore, fullMark: 100 },
            { subject: 'Success', A: admin.behaviorPattern.successRate, fullMark: 100 },
            { subject: 'Speed', A: admin.behaviorPattern.responseTime, fullMark: 100 },
            { subject: 'Anomaly', A: admin.behaviorPattern.anomalyScore, fullMark: 100 },
          ];

          return (
            <Card key={admin.adminId}>
              <CardHeader>
                <CardTitle className="text-sm">{admin.adminEmail}</CardTitle>
                <CardDescription>Behavioral Profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis />
                      <Radar
                        name="Behavior"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Patterns */}
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Detected Patterns:</div>
                  <div className="flex flex-wrap gap-1">
                    {admin.patterns.map((pattern, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {getBehaviorIcon(pattern)}
                        <span className="ml-1">{pattern}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-3 space-y-1">
                  <div className="text-sm font-medium">Recommendations:</div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {admin.recommendations.slice(0, 2).map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Anomaly Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Anomaly Detection
          </CardTitle>
          <CardDescription>
            Unusual behavior patterns requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .filter(admin => admin.behaviorPattern.anomalyScore > 70)
              .sort((a, b) => b.behaviorPattern.anomalyScore - a.behaviorPattern.anomalyScore)
              .map((admin) => (
                <div key={admin.adminId} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{admin.adminEmail}</span>
                      <Badge variant="destructive">
                        High Anomaly: {admin.behaviorPattern.anomalyScore}%
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Patterns: {admin.patterns.join(', ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Action Required</div>
                    <div className="text-xs text-muted-foreground">Review activity</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}