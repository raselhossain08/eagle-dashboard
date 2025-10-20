import { RevenueReport, ActivityReport } from '@/types/reports';

export const formatChartData = (data: any[], groupBy: string = 'day') => {
  if (!data || data.length === 0) return [];

  return data.map(item => ({
    ...item,
    // Add formatted date labels based on groupBy
    formattedDate: formatDateLabel(item.period || item.date, groupBy),
    // Ensure numeric values
    revenue: Number(item.revenue) || 0,
    activeUsers: Number(item.activeUsers) || 0,
    sessions: Number(item.sessions) || 0,
    engagementRate: Number(item.engagementRate) || 0,
  }));
};

export const formatDateLabel = (dateString: string, groupBy: string) => {
  const date = new Date(dateString);
  
  switch (groupBy) {
    case 'day':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'week':
      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    default:
      return date.toLocaleDateString();
  }
};

export const calculateTrend = (data: number[]): 'up' | 'down' | 'stable' => {
  if (data.length < 2) return 'stable';
  
  const first = data[0];
  const last = data[data.length - 1];
  const change = ((last - first) / first) * 100;
  
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};

export const generateSparklineData = (data: any[], valueKey: string) => {
  return data.map(item => ({
    value: item[valueKey] || 0,
    date: item.period || item.date,
  }));
};