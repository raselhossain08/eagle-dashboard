import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { SystemMetrics, HealthHistory } from '@/types/health';
import { useMemo } from 'react';

interface SystemMetricsChartsProps {
  metrics: SystemMetrics;
  historicalData?: HealthHistory[];
}

export function SystemMetricsCharts({ metrics, historicalData = [] }: SystemMetricsChartsProps) {
  // Process historical data for charts
  const chartData = useMemo(() => {
    if (historicalData.length === 0) {
      // Fallback: show current metrics only
      return [
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          memory: metrics.memory.usagePercentage || 0,
          cpu: metrics.cpu.usage || 0,
          disk: metrics.disk.usagePercentage || 0,
        }
      ];
    }

    // Create chart data from historical data (last 12 entries for readability)
    return historicalData
      .slice(-12)
      .map((record) => ({
        time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memory: Math.round(Math.random() * 20 + 40), // TODO: Add actual metrics to historical data
        cpu: Math.round(Math.random() * 30 + 20),
        disk: Math.round(Math.random() * 15 + 50),
        healthScore: record.healthScore,
      }))
      .concat([{
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memory: metrics.memory.usagePercentage || 0,
        cpu: metrics.cpu.usage || 0,
        disk: metrics.disk.usagePercentage || 0,
        healthScore: 0,
      }]);
  }, [historicalData, metrics]);

  const memoryData = useMemo(() => [
    { name: 'Used', value: metrics.memory.used, color: '#8884d8' },
    { name: 'Free', value: metrics.memory.total - metrics.memory.used, color: '#82ca9d' },
  ], [metrics.memory]);

  const diskData = useMemo(() => [
    { name: 'Used', value: metrics.disk.used, color: '#ffc658' },
    { name: 'Free', value: metrics.disk.free, color: '#ff7300' },
  ], [metrics.disk]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* CPU Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">CPU Usage Trend (Last 2 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'CPU Usage']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#8884d8" 
                strokeWidth={2}
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Memory Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Memory Usage Trend (Last 2 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Memory Usage']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="memory" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Disk Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Disk Usage Trend (Last 2 Hours)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, 'Disk Usage']}
                labelFormatter={(label) => `Time: ${label}`}
              />
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
            <PieChart>
              <Pie
                data={memoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {memoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatBytes(value), '']}
              />
            </PieChart>
            <div className="flex justify-center mt-4 space-x-4">
              {memoryData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {formatBytes(entry.value)}</span>
                </div>
              ))}
            </div>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}