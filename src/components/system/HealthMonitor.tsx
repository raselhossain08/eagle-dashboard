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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Monitor</CardTitle>
        <CardDescription>
          Real-time system resource monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>CPU Usage</span>
            <span>{health.cpu.usage}%</span>
          </div>
          <Progress value={health.cpu.usage} className="h-2" />
        </div>

        {/* Memory Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Memory Usage</span>
            <span>{health.memory.percentage}%</span>
          </div>
          <Progress value={health.memory.percentage} className="h-2" />
        </div>

        {/* Disk Usage */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Disk Usage</span>
            <span>{health.disk.percentage}%</span>
          </div>
          <Progress value={health.disk.percentage} className="h-2" />
        </div>

        {/* Database Status */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium">Database Connection</span>
          <div className={`w-3 h-3 rounded-full ${
            health.database === 'connected' 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`} />
        </div>
      </CardContent>
    </Card>
  );
}