// src/app/dashboard/system/health/alerts/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Bell, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    title: 'High CPU Usage',
    message: 'CPU usage has exceeded 85% for more than 5 minutes',
    timestamp: '2024-01-15T14:30:00Z',
    resolved: false,
    severity: 'medium' as const,
    source: 'system_monitor'
  },
  {
    id: '2',
    type: 'error' as const,
    title: 'Database Connection',
    message: 'Primary database connection failed, using fallback',
    timestamp: '2024-01-15T09:15:00Z',
    resolved: true,
    severity: 'high' as const,
    source: 'database'
  },
  {
    id: '3',
    type: 'info' as const,
    title: 'Backup Completed',
    message: 'Nightly backup completed successfully',
    timestamp: '2024-01-15T04:00:00Z',
    resolved: true,
    severity: 'low' as const,
    source: 'backup_service'
  },
  {
    id: '4',
    type: 'warning' as const,
    title: 'Memory Usage High',
    message: 'System memory usage is above 80%',
    timestamp: '2024-01-15T13:45:00Z',
    resolved: false,
    severity: 'medium' as const,
    source: 'system_monitor'
  }
];

const alertRules = [
  {
    id: '1',
    name: 'CPU Usage Alert',
    description: 'Alert when CPU usage exceeds 85% for 5 minutes',
    metric: 'cpu_usage',
    threshold: 85,
    duration: 300,
    enabled: true,
    severity: 'medium'
  },
  {
    id: '2',
    name: 'Memory Usage Alert',
    description: 'Alert when memory usage exceeds 80%',
    metric: 'memory_usage',
    threshold: 80,
    duration: 60,
    enabled: true,
    severity: 'medium'
  },
  {
    id: '3',
    name: 'Disk Space Alert',
    description: 'Alert when disk space falls below 10% free',
    metric: 'disk_space',
    threshold: 90,
    duration: 300,
    enabled: false,
    severity: 'high'
  }
];

export default function HealthAlertsPage() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && !alert.resolved) ||
      (statusFilter === 'resolved' && alert.resolved);
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-600" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'low': return 'outline';
      case 'medium': return 'secondary';
      case 'high': return 'default';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusVariant = (resolved: boolean) => {
    return resolved ? 'default' : 'destructive';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and manage system alerts and notifications
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Alert Rule
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('alerts')}
          >
            Active Alerts
          </button>
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rules'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rules')}
          >
            Alert Rules
          </button>
          <button
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('settings')}
          >
            Notification Settings
          </button>
        </div>
      </div>

      {activeTab === 'alerts' && (
        <>
          {/* Alert Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockAlerts.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {mockAlerts.filter(a => !a.resolved).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">High Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {mockAlerts.filter(a => a.severity === 'high').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {mockAlerts.filter(a => a.resolved).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Recent system alerts and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(alert.type)}
                          <span className="font-medium">{alert.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm text-gray-600 truncate">
                          {alert.message}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{alert.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(alert.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(alert.resolved)}>
                          {alert.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!alert.resolved && (
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'rules' && (
        <Card>
          <CardHeader>
            <CardTitle>Alert Rules</CardTitle>
            <CardDescription>
              Configure rules for automatic alert generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.metric}</Badge>
                    </TableCell>
                    <TableCell>{rule.threshold}%</TableCell>
                    <TableCell>
                      <Badge variant={getSeverityVariant(rule.severity)}>
                        {rule.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch checked={rule.enabled} />
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Configure how and where alerts are delivered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="email-notifications" className="font-medium">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Send alerts to registered email addresses</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="slack-notifications" className="font-medium">
                      Slack Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Send alerts to Slack channels</p>
                  </div>
                  <Switch id="slack-notifications" />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="webhook-notifications" className="font-medium">
                      Webhook Notifications
                    </Label>
                    <p className="text-sm text-gray-600">Send alerts to webhook endpoints</p>
                  </div>
                  <Switch id="webhook-notifications" defaultChecked />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Alert Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="working-hours">Working Hours</Label>
                  <Input id="working-hours" placeholder="9:00 AM - 6:00 PM" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">EST</SelectItem>
                      <SelectItem value="pst">PST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}