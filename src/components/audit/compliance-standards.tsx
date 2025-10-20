'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertTriangle, FileText, Shield, Lock } from 'lucide-react';

interface ComplianceStandardsProps {
  data: {
    sox: ComplianceData;
    gdpr: ComplianceData;
    hipaa: ComplianceData;
  };
}

interface ComplianceData {
  overallScore: number;
  requirements: Array<{
    id: string;
    name: string;
    description: string;
    status: 'compliant' | 'non-compliant' | 'partial';
    evidence: string[];
    lastAudit: Date;
  }>;
  recommendations: string[];
  lastAssessment: Date;
}

export function ComplianceStandards({ data }: ComplianceStandardsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'non-compliant': return 'destructive';
      case 'partial': return 'secondary';
      default: return 'outline';
    }
  };

  const renderComplianceView = (standard: string, complianceData: ComplianceData) => (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{complianceData.overallScore}%</h3>
              <p className="text-muted-foreground">Overall Compliance Score</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Last Assessment</div>
              <div className="font-medium">
                {new Date(complianceData.lastAssessment).toLocaleDateString()}
              </div>
            </div>
          </div>
          <Progress value={complianceData.overallScore} className="mt-4" />
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Requirements</CardTitle>
          <CardDescription>
            Detailed breakdown of compliance requirements and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.requirements.map((requirement) => (
              <div key={requirement.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start space-x-3 flex-1">
                  {getStatusIcon(requirement.status)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{requirement.name}</h4>
                      <Badge variant={getStatusVariant(requirement.status)}>
                        {requirement.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {requirement.description}
                    </p>
                    
                    {/* Evidence */}
                    {requirement.evidence.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium">Evidence:</div>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {requirement.evidence.map((evidence, index) => (
                            <li key={index}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right text-sm text-muted-foreground">
                  Last audit: {new Date(requirement.lastAudit).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {complianceData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Improvement Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {complianceData.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <Tabs defaultValue="sox" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="sox" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          SOX Compliance
        </TabsTrigger>
        <TabsTrigger value="gdpr" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          GDPR Compliance
        </TabsTrigger>
        <TabsTrigger value="hipaa" className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          HIPAA Compliance
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sox">
        {renderComplianceView('SOX', data.sox)}
      </TabsContent>

      <TabsContent value="gdpr">
        {renderComplianceView('GDPR', data.gdpr)}
      </TabsContent>

      <TabsContent value="hipaa">
        {renderComplianceView('HIPAA', data.hipaa)}
      </TabsContent>
    </Tabs>
  );
}