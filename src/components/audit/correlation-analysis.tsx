'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

interface CorrelationAnalysisProps {
  data: Array<{
    action1: string;
    action2: string;
    correlation: number;
    frequency: number;
    significance: 'high' | 'medium' | 'low';
  }>;
  isLoading?: boolean;
}

export function CorrelationAnalysis({ data, isLoading }: CorrelationAnalysisProps) {
  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (isLoading) {
    return <div className="h-[400px] animate-pulse bg-muted rounded-lg" />;
  }

  const chartData = data.map(item => ({
    x: item.correlation,
    y: item.frequency,
    significance: item.significance,
    name: `${item.action1} ↔ ${item.action2}`
  }));

  return (
    <div className="space-y-6">
      {/* Correlation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Action Correlation Matrix</CardTitle>
          <CardDescription>
            Relationships between different audit actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="x" 
                  type="number"
                  name="Correlation"
                  domain={[-1, 1]}
                />
                <YAxis 
                  dataKey="y" 
                  type="number"
                  name="Frequency"
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-background border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm">Correlation: {data.x.toFixed(3)}</p>
                          <p className="text-sm">Frequency: {data.y}</p>
                          <p className="text-sm">Significance: {data.significance}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Correlations" data={chartData}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getSignificanceColor(entry.significance)} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Correlations */}
      <Card>
        <CardHeader>
          <CardTitle>Top Correlated Actions</CardTitle>
          <CardDescription>
            Most strongly related audit actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data
              .filter(item => Math.abs(item.correlation) > 0.7)
              .sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))
              .slice(0, 10)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.action1}</span>
                      <span className="text-muted-foreground">↔</span>
                      <span className="font-medium">{item.action2}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>Frequency: {item.frequency}</span>
                      <span>Significance: </span>
                      <Badge 
                        variant={
                          item.significance === 'high' ? 'destructive' : 
                          item.significance === 'medium' ? 'secondary' : 'default'
                        }
                      >
                        {item.significance}
                      </Badge>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    item.correlation > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(3)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}