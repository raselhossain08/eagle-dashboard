import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SystemMetrics } from '@/types/health';

interface SystemMetricsChartsProps {
  metrics: SystemMetrics;
  historicalData?: any[];
}

export function SystemMetricsCharts({ metrics, historicalData = [] }: SystemMetricsChartsProps) {
  // Mock historical data for charts - replace with real data from API
  const chartData = [
    { time: '10:00', memory: 45, cpu: 25, disk: 60 },
    { time: '10:15', memory: 52, cpu: 30, disk: 62 },
    { time: '10:30', memory: 48, cpu: 28, disk: 61 },
    { time: '10:45', memory: 55, cpu: 35, disk: 63 },
    { time: '11:00', memory: metrics.memory.usagePercentage, cpu: metrics.cpu.usage, disk: metrics.disk.usagePercentage },
  ];

  const memoryData = [
    { name: 'Used', value: metrics.memory.used },
    { name: 'Free', value: metrics.memory.total - metrics.memory.used },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CPU Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CPU Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="cpu" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Memory Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Memory Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disk Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Disk Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="disk" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Memory Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Memory Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}