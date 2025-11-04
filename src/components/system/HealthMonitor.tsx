// src/components/system/HealthMonitor.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SystemHealth } from '@/types/system';

interface HealthMonitorProps {
  health: SystemHealth;
}

export function HealthMonitor({ health }: HealthMonitorProps) {
  const getProgressColor = (value: number) => {
    if (value > 85) return 'bg-red-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(1)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  };

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Health Monitor</CardTitle>
          <CardDescription>
            Real-time system resource monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Monitor</CardTitle>
        <CardDescription>
          Real-time system resource monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CPU Usage */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">CPU Usage</span>
              <span className="text-xs text-gray-500">({health.cpu.cores} cores)</span>
            </div>
            <span className={`font-medium ${health.cpu.usage > 80 ? 'text-red-600' : health.cpu.usage > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
              {health.cpu.usage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(health.cpu.usage)}`}
              style={{ width: `${health.cpu.usage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-medium">Memory Usage</span>
            <div className="text-right">
              <div className={`font-medium ${health.memory.percentage > 85 ? 'text-red-600' : health.memory.percentage > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                {health.memory.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {formatBytes(health.memory.used)} / {formatBytes(health.memory.total)}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(health.memory.percentage)}`}
              style={{ width: `${health.memory.percentage}%` }}
            />
          </div>
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="font-medium">Disk Usage</span>
            <div className="text-right">
              <div className={`font-medium ${health.disk.percentage > 85 ? 'text-red-600' : health.disk.percentage > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                {health.disk.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {formatBytes(health.disk.used)} / {formatBytes(health.disk.total)}
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(health.disk.percentage)}`}
              style={{ width: `${health.disk.percentage}%` }}
            />
          </div>
        </div>

        {/* Service Status */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-3">Service Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Database</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  health.database === 'connected' 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium ${
                  health.database === 'connected' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {health.database}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System</span>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  health.status === 'healthy' 
                    ? 'bg-green-500' 
                    : health.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium ${
                  health.status === 'healthy' 
                    ? 'text-green-600' 
                    : health.status === 'warning'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {health.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Last Check */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Last checked: {new Date(health.lastCheck).toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );
}