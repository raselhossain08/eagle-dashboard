// app/dashboard/subscribers/segments/[segmentId]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  BarChart3,
  Download,
  Mail,
  Filter,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

const segmentData = {
  id: 'seg_1',
  name: 'Premium Users',
  description: 'Users with active premium subscriptions',
  criteria: 'subscription_plan = "premium" AND status = "active"',
  subscriberCount: 1247,
  createdAt: '2024-01-15',
  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  metrics: {
    averageLtv: 1850,
    averageSpend: 89,
    retentionRate: 92,
    churnRate: 1.2
  }
};

const segmentSubscribers = [
  {
    id: 'sub_1',
    name: 'John Doe',
    email: 'john@example.com',
    subscription: 'Premium',
    ltv: 2450,
    joined: '2023-06-15'
  },
  {
    id: 'sub_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subscription: 'Premium',
    ltv: 1890,
    joined: '2023-08-22'
  },
  // ... more mock data
];

export default function SegmentDetailPage() {
  const params = useParams();
  const segmentId = params.segmentId as string;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/subscribers/segments">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Badge className={segmentData.color}>
                {segmentData.subscriberCount.toLocaleString()} Subscribers
              </Badge>
              <h1 className="text-3xl font-bold">{segmentData.name}</h1>
            </div>
            <p className="text-muted-foreground">
              {segmentData.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email Segment
          </Button>
          <Button>
            <Filter className="h-4 w-4 mr-2" />
            Edit Segment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segmentData.subscriberCount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average LTV</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${segmentData.metrics.averageLtv.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +5% from average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segmentData.metrics.retentionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +8% from average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{segmentData.metrics.churnRate}%</div>
                <p className="text-xs text-muted-foreground">
                  -2% from average
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Segment Criteria</CardTitle>
              <CardDescription>
                Rules that define this subscriber segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm font-mono">
                  {segmentData.criteria}
                </code>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created on {new Date(segmentData.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers">
          <Card>
            <CardHeader>
              <CardTitle>Segment Subscribers</CardTitle>
              <CardDescription>
                {segmentData.subscriberCount.toLocaleString()} subscribers match this segment criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {segmentSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {subscriber.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{subscriber.name}</div>
                        <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${subscriber.ltv.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">LTV</div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Segment Analytics</CardTitle>
              <CardDescription>
                Performance metrics and insights for this segment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted rounded flex items-center justify-center">
                <p className="text-muted-foreground">Segment Analytics Charts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Segment Settings</CardTitle>
              <CardDescription>
                Manage segment configuration and rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete a segment, there is no going back. Please be certain.
                  </p>
                  <Button variant="destructive">
                    Delete Segment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}