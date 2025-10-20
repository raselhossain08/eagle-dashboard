// components/analytics/RevenueChart.tsx
'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4000, growth: 2400 },
  { month: 'Feb', revenue: 4500, growth: 1398 },
  { month: 'Mar', revenue: 5200, growth: 9800 },
  { month: 'Apr', revenue: 5800, growth: 3908 },
  { month: 'May', revenue: 6200, growth: 4800 },
  { month: 'Jun', revenue: 6800, growth: 3800 },
  { month: 'Jul', revenue: 7200, growth: 4300 },
  { month: 'Aug', revenue: 7900, growth: 4100 },
  { month: 'Sep', revenue: 8500, growth: 4300 },
  { month: 'Oct', revenue: 9200, growth: 4500 },
  { month: 'Nov', revenue: 9800, growth: 4700 },
  { month: 'Dec', revenue: 10500, growth: 5100 },
];

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="Monthly Revenue" />
        <Area type="monotone" dataKey="growth" stroke="#82ca9d" fill="#82ca9d" name="Growth" />
      </AreaChart>
    </ResponsiveContainer>
  );
}