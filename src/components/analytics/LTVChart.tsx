// components/analytics/LTVChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ltvData = [
  { month: 'Jan', ltv: 1150, avgOrderValue: 89 },
  { month: 'Feb', ltv: 1180, avgOrderValue: 92 },
  { month: 'Mar', ltv: 1210, avgOrderValue: 95 },
  { month: 'Apr', ltv: 1190, avgOrderValue: 91 },
  { month: 'May', ltv: 1230, avgOrderValue: 96 },
  { month: 'Jun', ltv: 1260, avgOrderValue: 98 },
  { month: 'Jul', ltv: 1280, avgOrderValue: 101 },
  { month: 'Aug', ltv: 1310, avgOrderValue: 104 },
  { month: 'Sep', ltv: 1340, avgOrderValue: 106 },
  { month: 'Oct', ltv: 1370, avgOrderValue: 108 },
  { month: 'Nov', ltv: 1390, avgOrderValue: 110 },
  { month: 'Dec', ltv: 1420, avgOrderValue: 112 },
];

export function LTVChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={ltvData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="ltv" stroke="#8884d8" name="Lifetime Value ($)" />
        <Line type="monotone" dataKey="avgOrderValue" stroke="#82ca9d" name="Avg Order Value ($)" />
      </LineChart>
    </ResponsiveContainer>
  );
}