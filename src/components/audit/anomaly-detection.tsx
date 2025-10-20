'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Clock, MapPin, User, Shield, Bell } from 'lucide-react';
import { useState } from 'react';

interface AnomalyDetectionProps {
  anomalies: Array<{
    id: string;
    type: 'suspicious_login' | 'unusual_activity' | 'failed_attempts' | 'geographic_anomaly' | 'time_anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    timestamp: Date;
    adminEmail?: string;
    ipAddress?: string;
    location?: string;
    confidence: number;
    recommendations: string[];
  }>;
  isLoading?: boolean;
}

export function AnomalyDetection({ anomalies, isLoading }: AnomalyDetectionProps) {
  const [expandedAnomaly, setExpandedAnomaly] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'suspicious_login': return <Shield className="h-4 w-4" />;
      case 'unusual_activity': return <AlertTriangle className="h-4 w-4" />;
      case 'failed_attempts': return <Bell className="h-4 w-4" />;
      case 'geographic_anomaly': return <MapPin className="h-4 w-4" />;
      case 'time_anomaly': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAnomalyTypeLabel = (type: string) => {
    switch (type) {
      case 'suspicious_login': return 'Suspicious Login';
      case 'unusual_activity': return 'Unusual Activity';
      case 'failed_attempts': return 'Failed Attempts';
      case 'geographic_anomaly': return 'Geographic Anomaly';
      case 'time_anomaly': return 'Time Anomaly';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {anomalies.filter(a => a.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {anomalies.filter(a => a.severity === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {anomalies.filter(a => a.severity === 'medium').length}
                </div>
                <div className="text-sm text-muted-foreground">Medium</div>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {anomalies.filter(a => a.severity === 'low').length}
                </div>
                <div className="text-sm text-muted-foreground">Low</div>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <div className="space-y-3">
        {anomalies
          .sort((a, b) => {
            const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
          })
          .map((anomaly) => (
            <Card key={anomaly.id} className={`border-l-4 ${
              anomaly.severity === 'critical' ? 'border-l-red-500' :
              anomaly.severity === 'high' ? 'border-l-orange-500' :
              anomaly.severity === 'medium' ? 'border-l-yellow-500' : 'border-l-blue-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-full mt-1 ${
                      anomaly.severity === 'critical' ? 'bg-red-100 text-red-600' :
                      anomaly.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                      anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {getAnomalyIcon(anomaly.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{anomaly.title}</h4>
                        <Badge variant="outline" className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="secondary">
                          {getAnomalyTypeLabel(anomaly.type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {anomaly.confidence}% confidence
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        {anomaly.description}
                      </p>

                      {/* Additional Info */}
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        {anomaly.adminEmail && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{anomaly.adminEmail}</span>
                          </div>
                        )}
                        {anomaly.ipAddress && (
                          <div className="flex items-center space-x-1">
                            <Shield className="h-3 w-3" />
                            <span>{anomaly.ipAddress}</span>
                          </div>
                        )}
                        {anomaly.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{anomaly.location}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(anomaly.timestamp).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {expandedAnomaly === anomaly.id && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-2">Recommendations:</div>
                          <ul className="text-sm space-y-1">
                            {anomaly.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAnomaly(
                      expandedAnomaly === anomaly.id ? null : anomaly.id
                    )}
                  >
                    {expandedAnomaly === anomaly.id ? 'Hide' : 'View'} Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {anomalies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No Anomalies Detected</h3>
            <p className="text-muted-foreground mt-2">
              No suspicious activity patterns detected in the current audit data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}