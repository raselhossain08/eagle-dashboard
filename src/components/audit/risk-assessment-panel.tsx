import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { RiskAssessmentData } from '@/types/audit';
import { cn } from '@/lib/utils';

interface RiskAssessmentPanelProps {
  data: RiskAssessmentData;
}

export function RiskAssessmentPanel({ data }: RiskAssessmentPanelProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Info className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getOverallRiskColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Overall Risk Score</h3>
          <p className="text-sm text-muted-foreground">
            Based on recent activity patterns and security events
          </p>
        </div>
        <div className="text-right">
          <div className={cn("text-3xl font-bold", getOverallRiskColor(data.overallRiskScore))}>
            {data.overallRiskScore}
          </div>
          <div className="text-sm text-muted-foreground">
            {data.overallRiskScore < 30 ? 'Low Risk' : 
             data.overallRiskScore < 70 ? 'Medium Risk' : 'High Risk'}
          </div>
        </div>
      </div>

      <Progress 
        value={data.overallRiskScore} 
        className={cn(
          "h-2",
          data.overallRiskScore < 30 ? "bg-green-200" :
          data.overallRiskScore < 70 ? "bg-yellow-200" : "bg-red-200"
        )}
      />

      {/* Risk Factors */}
      <div>
        <h4 className="text-sm font-medium mb-3">Risk Factors</h4>
        <div className="space-y-3">
          {data.riskFactors.map((factor, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={cn("p-1 rounded-full", getRiskLevelColor(factor.level))}>
                  {getRiskIcon(factor.level)}
                </div>
                <div>
                  <div className="font-medium text-sm">{factor.factor}</div>
                  <div className="text-xs text-muted-foreground">{factor.description}</div>
                </div>
              </div>
              <Badge variant="outline" className={getRiskLevelColor(factor.level)}>
                {factor.count} events
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Recommendations</h4>
          <ul className="space-y-2">
            {data.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}