// app/dashboard/users/segments/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Users, Filter, ArrowRight, Search } from 'lucide-react';
import Link from 'next/link';

const segments = [
  {
    id: 'active-premium',
    name: 'Active Premium Users',
    description: 'Users with active premium subscriptions and recent activity',
    userCount: 842,
    criteria: 'status:active AND subscription:tier_premium AND lastLogin:>7d',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    createdAt: '2024-01-15',
  },
  {
    id: 'inactive-30d',
    name: 'Inactive Over 30 Days',
    description: 'Users who haven\'t logged in for 30+ days but have active accounts',
    userCount: 156,
    criteria: 'lastLogin:<30d AND status:active',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    createdAt: '2024-01-10',
  },
  {
    id: 'kyc-verified',
    name: 'KYC Verified',
    description: 'Users with completed KYC verification process',
    userCount: 1923,
    criteria: 'kycStatus:verified',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    createdAt: '2024-01-05',
  },
  {
    id: 'trial-expiring',
    name: 'Trial Expiring Soon',
    description: 'Users with trials expiring in the next 7 days',
    userCount: 47,
    criteria: 'subscription:trial AND trialEnds:<=7d',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    createdAt: '2024-01-20',
  },
];

export default function SegmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Segments</h1>
          <p className="text-muted-foreground">
            Create and manage user segments for targeted actions and analysis
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/users/segments/new">
            <Plus className="h-4 w-4 mr-2" />
            New Segment
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search segments..." className="pl-8" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <div className="grid gap-6">
        {segments.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 ${segment.color} rounded-lg flex items-center justify-center`}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{segment.name}</h3>
                      <Badge variant="secondary">{segment.userCount} users</Badge>
                      <Badge className={segment.color}>{segment.id}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{segment.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Filter className="h-3 w-3" />
                        <code className="text-xs bg-muted px-2 py-1 rounded">{segment.criteria}</code>
                      </div>
                      <span>Created {new Date(segment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/users/segments/${segment.id}`}>
                    View Segment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Segments Created</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first user segment to group users based on specific criteria and perform bulk actions.
              </p>
              <Button asChild>
                <Link href="/dashboard/users/segments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Segment
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}