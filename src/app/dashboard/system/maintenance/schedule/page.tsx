// src/app/dashboard/system/maintenance/schedule/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Play, Pause, Calendar, Clock } from 'lucide-react';

type TaskType = 'backup' | 'cleanup' | 'report' | 'health';
type TaskStatus = 'active' | 'paused';

interface MaintenanceTask {
  id: string;
  name: string;
  description: string;
  schedule: string;
  nextRun: string;
  lastRun: string;
  status: TaskStatus;
  type: TaskType;
}

const scheduledTasks: MaintenanceTask[] = [
  {
    id: '1',
    name: 'Daily Backup',
    description: 'Create database backup',
    schedule: '0 4 * * *', // 4:00 AM daily
    nextRun: '2024-01-16T04:00:00Z',
    lastRun: '2024-01-15T04:00:00Z',
    status: 'active',
    type: 'backup'
  },
  {
    id: '2',
    name: 'Weekly Cleanup',
    description: 'Clean up temporary files',
    schedule: '0 2 * * 0', // 2:00 AM every Sunday
    nextRun: '2024-01-21T02:00:00Z',
    lastRun: '2024-01-14T02:00:00Z',
    status: 'active',
    type: 'cleanup'
  },
  {
    id: '3',
    name: 'Monthly Report',
    description: 'Generate monthly analytics report',
    schedule: '0 6 1 * *', // 6:00 AM on 1st of month
    nextRun: '2024-02-01T06:00:00Z',
    lastRun: '2024-01-01T06:00:00Z',
    status: 'paused',
    type: 'report'
  },
  {
    id: '4',
    name: 'Health Check',
    description: 'Run system health diagnostics',
    schedule: '*/30 * * * *', // Every 30 minutes
    nextRun: '2024-01-15T15:30:00Z',
    lastRun: '2024-01-15T15:00:00Z',
    status: 'active',
    type: 'health'
  }
];

export default function MaintenanceSchedulePage() {
  const [tasks, setTasks] = useState(scheduledTasks);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId 
        ? { ...task, status: task.status === 'active' ? 'paused' : 'active' }
        : task
    ));
  };

  const getStatusVariant = (status: string) => {
    return status === 'active' ? 'default' : 'secondary';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'backup': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cleanup': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'report': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'health': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatCron = (cron: string) => {
    const parts = cron.split(' ');
    if (parts.length === 5) {
      const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      return `Runs at ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    return cron;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Scheduled Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage automated maintenance tasks and schedules
          </p>
        </div>
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Schedule Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
            <p className="text-sm text-gray-500">Scheduled tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(t => t.status === 'active').length}
            </div>
            <p className="text-sm text-gray-500">Running tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(tasks[0]?.nextRun).toLocaleTimeString()}
            </div>
            <p className="text-sm text-gray-500">Earliest scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 hours ago</div>
            <p className="text-sm text-gray-500">Most recent execution</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Tasks</CardTitle>
          <CardDescription>
            Automated maintenance tasks and their schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      {task.name}
                      <Badge className={getTypeColor(task.type)}>
                        {task.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      {formatCron(task.schedule)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(task.nextRun).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={task.status === 'active'}
                        onCheckedChange={() => toggleTaskStatus(task.id)}
                      />
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Task Form */}
      {showNewTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Scheduled Task</CardTitle>
            <CardDescription>
              Add a new automated maintenance task
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name</Label>
                <Input id="task-name" placeholder="Enter task name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-type">Task Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="health">Health Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Input id="task-description" placeholder="Enter task description" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-schedule">Schedule (Cron Expression)</Label>
              <Input id="task-schedule" placeholder="0 4 * * *" />
              <p className="text-sm text-gray-500">
                Use cron syntax: minute hour day month day-of-week
              </p>
            </div>
            <div className="flex gap-2">
              <Button>Create Task</Button>
              <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}