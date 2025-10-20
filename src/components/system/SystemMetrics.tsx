// src/components/system/SystemMetrics.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockMetricsData = [
  { time: '00:00', cpu: 45, memory: 65, disk: 55, requests: 1200 },
  { time: '04:00', cpu: 35, memory: 60, disk: 53, requests: 800 },
  { time: '08:00', cpu: 60, memory: 75, disk: 58, requests: 2500 },
  { time: '12:00', cpu: 75, memory: 80, disk: 62, requests: 3500 },
  { time: '16:00', cpu: 65, memory: 70, disk: 59, requests: 2800 },
  { time: '20:00', cpu: 50, memory: 65, disk: 56, requests: 1800 },
];

interface SystemMetricsProps {
  timeframe?: '1h' | '24h' | '7d' | '30d';
}

export function SystemMetrics({ timeframe = '24h' }: SystemMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Metrics</CardTitle>
        <CardDescription>
          Performance metrics over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Usage Chart */}
        <div>
          <h4 className="font-semibold mb-4">CPU Usage (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Memory Usage Chart */}
        <div>
          <h4 className="font-semibold mb-4">Memory Usage (%)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={mockMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Request Rate Chart */}
        <div>
          <h4 className="font-semibold mb-4">Request Rate (requests/min)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockMetricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}