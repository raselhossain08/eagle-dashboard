import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MemoryStick, HardDrive, Cpu } from 'lucide-react';
import { SystemMetrics as SystemMetricsType } from '@/types/health';

interface SystemMetricsProps {
  metrics: SystemMetricsType;
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const { memory, disk, cpu } = metrics;

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>System Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MemoryStick className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span className="font-medium">Memory Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatBytes(memory.used)} / {formatBytes(memory.total)}
            </span>
          </div>
          <Progress value={memory.usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Heap: {formatBytes(memory.heap)}</span>
            <span>{memory.usagePercentage}% used</span>
          </div>
        </div>

        {/* Disk Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HardDrive className="h-4 w-4 text-green-500 dark:text-green-400" />
              <span className="font-medium">Disk Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatBytes(disk.used)} / {formatBytes(disk.total)}
            </span>
          </div>
          <Progress value={disk.usagePercentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Free: {formatBytes(disk.free)}</span>
            <span>{disk.usagePercentage}% used</span>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-purple-500 dark:text-purple-400" />
              <span className="font-medium">CPU Usage</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {cpu.usage}% ({cpu.cores} cores)
            </span>
          </div>
          <Progress value={cpu.usage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}