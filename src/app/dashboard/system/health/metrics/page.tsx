// src/app/dashboard/system/health/metrics/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SystemMetrics } from '@/components/system/SystemMetrics';
import { useSystemHealth, useSystemStats } from '@/hooks/useSystem';
import { Download, RefreshCw, Activity, Cpu, HardDrive, MemoryStick } from 'lucide-react';

const timeframes = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' }
];

const metricTypes = [
  { value: 'cpu', label: 'CPU Usage', icon: Cpu },
  { value: 'memory', label: 'Memory Usage', icon: MemoryStick },
  { value: 'disk', label: 'Disk I/O', icon: HardDrive },
  { value: 'network', label: 'Network', icon: Activity }
];

export default function HealthMetricsPage() {
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const { data: health, refetch: refetchHealth } = useSystemHealth();
  const { data: stats, refetch: refetchStats } = useSystemStats();

  const handleRefresh = () => {
    refetchHealth();
    refetchStats();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Exporting metrics data...');
  };

  const SelectedMetricIcon = metricTypes.find(m => m.value === selectedMetric)?.icon || Activity;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Performance Metrics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Detailed system performance metrics and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            {timeframes.map((tf) => (
              <SelectItem key={tf.value} value={tf.value}>
                {tf.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMetric} onValueChange={setSelectedMetric}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            {metricTypes.map((metric) => (
              <SelectItem key={metric.value} value={metric.value}>
                <div className="flex items-center gap-2">
                  <metric.icon className="h-4 w-4" />
                  {metric.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-600" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.cpu.usage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${health?.cpu.usage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MemoryStick className="h-4 w-4 text-green-600" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.memory.percentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${health?.memory.percentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.disk.percentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 dark:bg-gray-700">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${health?.disk.percentage}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-600" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.responseTime}ms</div>
            <p className="text-sm text-gray-500">API response time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Charts */}
      <SystemMetrics timeframe={timeframe as any} />

      {/* Additional Metrics Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SelectedMetricIcon className="h-5 w-5" />
              {metricTypes.find(m => m.value === selectedMetric)?.label} Details
            </CardTitle>
            <CardDescription>
              Detailed information about the selected metric
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Value</span>
                <span className="font-medium">
                  {selectedMetric === 'cpu' && `${health?.cpu.usage}%`}
                  {selectedMetric === 'memory' && `${health?.memory.percentage}%`}
                  {selectedMetric === 'disk' && `${health?.disk.percentage}%`}
                  {selectedMetric === 'network' && '45 Mbps'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peak Value</span>
                <span className="font-medium">
                  {selectedMetric === 'cpu' && '89%'}
                  {selectedMetric === 'memory' && '92%'}
                  {selectedMetric === 'disk' && '78%'}
                  {selectedMetric === 'network' && '120 Mbps'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average</span>
                <span className="font-medium">
                  {selectedMetric === 'cpu' && '45%'}
                  {selectedMetric === 'memory' && '65%'}
                  {selectedMetric === 'disk' && '55%'}
                  {selectedMetric === 'network' && '75 Mbps'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-green-600">Normal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metric Thresholds</CardTitle>
            <CardDescription>
              Alert thresholds for system metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>CPU Usage</span>
                  <span>Warning: 80% | Critical: 95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '80%' }}></div>
                  <div className="bg-yellow-600 h-2 rounded-full -mt-2" style={{ width: '15%', marginLeft: '80%' }}></div>
                  <div className="bg-red-600 h-2 rounded-full -mt-2" style={{ width: '5%', marginLeft: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>Warning: 85% | Critical: 95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  <div className="bg-yellow-600 h-2 rounded-full -mt-2" style={{ width: '10%', marginLeft: '85%' }}></div>
                  <div className="bg-red-600 h-2 rounded-full -mt-2" style={{ width: '5%', marginLeft: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disk Usage</span>
                  <span>Warning: 90% | Critical: 95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  <div className="bg-yellow-600 h-2 rounded-full -mt-2" style={{ width: '5%', marginLeft: '90%' }}></div>
                  <div className="bg-red-600 h-2 rounded-full -mt-2" style={{ width: '5%', marginLeft: '95%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}