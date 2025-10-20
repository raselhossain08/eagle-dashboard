// app/dashboard/subscribers/segments/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const segments = [
  {
    id: 'seg_1',
    name: 'Premium Users',
    description: 'Users with active premium subscriptions',
    criteria: 'subscription_plan = "premium" AND status = "active"',
    subscriberCount: 1247,
    createdAt: '2024-01-15',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'seg_2',
    name: 'High LTV Customers',
    description: 'Customers with lifetime value over $1000',
    criteria: 'lifetime_value > 1000',
    subscriberCount: 892,
    createdAt: '2024-01-10',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'seg_3',
    name: 'At Risk Churn',
    description: 'Users with declining engagement',
    criteria: 'last_activity < 30d AND subscription_duration > 90d',
    subscriberCount: 156,
    createdAt: '2024-01-08',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  },
  {
    id: 'seg_4',
    name: 'New Signups',
    description: 'Users who joined in the last 30 days',
    criteria: 'created_at > 30d',
    subscriberCount: 324,
    createdAt: '2024-01-05',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  }
];

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriber Segments</h1>
          <p className="text-muted-foreground">
            Create and manage subscriber segments for targeted actions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Segment
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Segment Management</CardTitle>
              <CardDescription>
                Create dynamic segments based on subscriber attributes and behavior
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Input
                placeholder="Search segments..."
                className="w-full sm:w-64"
              />
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Segments Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {segments.map((segment) => (
              <Card key={segment.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{segment.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {segment.description}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analyze
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Subscribers</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{segment.subscriberCount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Criteria</span>
                      <p className="font-mono bg-muted p-2 rounded text-xs">
                        {segment.criteria}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Badge className={segment.color}>
                        Active
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Subscribers
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Segment Card */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Create New Segment</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build a custom segment based on subscriber attributes and behavior
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Segment
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}