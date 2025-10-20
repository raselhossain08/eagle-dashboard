'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PredictiveInsightsProps {
  data: Array<{
    date: string;
    actual: number;
    predicted: number;
    confidence: number;
  }>;
  isLoading?: boolean;
}

export function PredictiveInsights({ data, isLoading }: PredictiveInsightsProps) {
  const latestPrediction = data[data.length - 1];
  const trend = latestPrediction?.predicted > data[data.length - 2]?.predicted ? 'up' : 'down';
  const confidenceLevel = latestPrediction?.confidence > 80 ? 'high' : latestPrediction?.confidence > 60 ? 'medium' : 'low';

  if (isLoading) {
    return <div className="h-[300px] animate-pulse bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      {/* Insights Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Period Forecast</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestPrediction?.predicted.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className={`h-3 w-3 mr-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
              {trend === 'up' ? 'Increasing' : 'Decreasing'} trend
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Level</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestPrediction?.confidence}%</div>
            <Badge 
              variant={confidenceLevel === 'high' ? 'default' : confidenceLevel === 'medium' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {confidenceLevel.toUpperCase()} CONFIDENCE
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendation</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {trend === 'up' ? 'Monitor growth' : 'Review activity patterns'}
            </div>
            <div className="text-xs text-muted-foreground">
              {confidenceLevel === 'high' ? 'High reliability' : 'Monitor closely'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Forecast</CardTitle>
          <CardDescription>
            Predicted vs actual activity with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Actual"
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Predicted"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
                <Area 
                  dataKey="confidence" 
                  fill="#f59e0b" 
                  fillOpacity={0.1}
                  stroke="none"
                  name="Confidence"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}