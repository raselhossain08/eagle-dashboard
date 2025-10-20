// components/files/storage-quota-display.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';

interface StorageQuotaDisplayProps {
  used: number;
  total: number;
  unit: 'B' | 'KB' | 'MB' | 'GB';
  breakdown?: Array<{
    type: string;
    size: number;
    color: string;
  }>;
  showDetails?: boolean;
}

export function StorageQuotaDisplay({
  used,
  total,
  unit,
  breakdown = [],
  showDetails = true
}: StorageQuotaDisplayProps) {
  const { theme } = useTheme();
  
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const percentage = total > 0 ? (used / total) * 100 : 0;
  
  const getUnitMultiplier = (unit: string): number => {
    switch (unit) {
      case 'KB': return 1024;
      case 'MB': return 1024 * 1024;
      case 'GB': return 1024 * 1024 * 1024;
      default: return 1;
    }
  };

  const totalBytes = total * getUnitMultiplier(unit);
  const usedBytes = used * getUnitMultiplier(unit);

  const getStatusColor = (percent: number): string => {
    if (percent < 70) return 'bg-green-500';
    if (percent < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
        <CardDescription>
          {formatSize(usedBytes)} of {formatSize(totalBytes)} used
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Usage</span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
          <Progress value={percentage} className={getStatusColor(percentage)} />
        </div>

        {showDetails && breakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Usage Breakdown</h4>
            <div className="space-y-2">
              {breakdown.map((item, index) => {
                const itemPercentage = totalBytes > 0 ? (item.size / totalBytes) * 100 : 0;
                return (
                  <TooltipProvider key={item.type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-3 h-3 rounded"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.type}</span>
                          </div>
                          <span>{formatSize(item.size)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.type}: {formatSize(item.size)} ({itemPercentage.toFixed(1)}%)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>

            {/* Visual breakdown bar */}
            <div className="flex h-2 rounded-full overflow-hidden">
              {breakdown.map((item, index) => {
                const width = totalBytes > 0 ? (item.size / totalBytes) * 100 : 0;
                return (
                  <div
                    key={item.type}
                    style={{
                      width: `${width}%`,
                      backgroundColor: item.color
                    }}
                    className="h-full transition-all"
                  />
                );
              })}
              {percentage < 100 && (
                <div
                  style={{
                    width: `${100 - percentage}%`,
                    backgroundColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                  }}
                  className="h-full"
                />
              )}
            </div>
          </div>
        )}

        {percentage > 90 && (
          <div className={`text-xs p-2 rounded ${
            theme === 'dark' 
              ? 'bg-red-900/20 text-red-300 border border-red-800' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            ⚠️ Storage almost full. Consider cleaning up unused files.
          </div>
        )}
      </CardContent>
    </Card>
  );
}