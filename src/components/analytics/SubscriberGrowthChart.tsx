// components/analytics/SubscriberGrowthChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const growthData = [
  { month: 'Jan', subscribers: 2400, newSubscribers: 140 },
  { month: 'Feb', subscribers: 2550, newSubscribers: 150 },
  { month: 'Mar', subscribers: 2680, newSubscribers: 130 },
  { month: 'Apr', subscribers: 2820, newSubscribers: 140 },
  { month: 'May', subscribers: 2950, newSubscribers: 130 },
  { month: 'Jun', subscribers: 3100, newSubscribers: 150 },
  { month: 'Jul', subscribers: 3250, newSubscribers: 150 },
  { month: 'Aug', subscribers: 3400, newSubscribers: 150 },
  { month: 'Sep', subscribers: 3550, newSubscribers: 150 },
  { month: 'Oct', subscribers: 3720, newSubscribers: 170 },
  { month: 'Nov', subscribers: 3880, newSubscribers: 160 },
  { month: 'Dec', subscribers: 4050, newSubscribers: 170 },
];

export function SubscriberGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={growthData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="subscribers" stroke="#8884d8" name="Total Subscribers" />
        <Line type="monotone" dataKey="newSubscribers" stroke="#82ca9d" name="New Subscribers" />
      </LineChart>
    </ResponsiveContainer>
  );
}