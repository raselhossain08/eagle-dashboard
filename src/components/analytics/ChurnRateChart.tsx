'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockChurnData = [
  { month: 'Jan', churnRate: 3.2 },
  { month: 'Feb', churnRate: 2.8 },
  { month: 'Mar', churnRate: 3.5 },
  { month: 'Apr', churnRate: 2.9 },
  { month: 'May', churnRate: 3.1 },
  { month: 'Jun', churnRate: 2.7 },
];

export function ChurnRateChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Churn Rate Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockChurnData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Churn Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="churnRate" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}