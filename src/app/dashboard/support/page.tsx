// app/dashboard/support/page.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupportStats, useActiveImpersonations } from '@/hooks/useSupport';
import { useSupportStore } from '@/stores/support-store';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SupportDashboard() {
  const { data: stats, isLoading: statsLoading } = useSupportStats();
  const { data: activeImpersonations, isLoading: impersonationsLoading } = useActiveImpersonations();
  const setIsCreatingNote = useSupportStore((state) => state.setIsCreatingNote);

  if (statsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Dashboard</h1>
          <p className="text-muted-foreground">
            Manage customer support interactions and analytics
          </p>
        </div>
        <Button onClick={() => setIsCreatingNote(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={stats?.totalTickets || 0}
          icon={<MessageSquare className="w-4 h-4" />}
          description="All support requests"
        />
        <StatCard
          title="Resolved"
          value={stats?.resolvedTickets || 0}
          icon={<TrendingUp className="w-4 h-4" />}
          description="Successfully closed"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats?.averageResponseTime || 0}m`}
          icon={<Clock className="w-4 h-4" />}
          description="Average first response"
        />
        <StatCard
          title="Active Impersonations"
          value={activeImpersonations?.length || 0}
          icon={<Users className="w-4 h-4" />}
          description="Current sessions"
          variant={activeImpersonations?.length ? 'destructive' : 'default'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        <PendingFollowUps />
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <CustomerSatisfactionCard satisfaction={stats?.customerSatisfaction} />
        <PendingFollowUpsCard count={stats?.pendingFollowUps} />
        <ImpersonationActivityCard />
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  variant?: 'default' | 'destructive';
}

function StatCard({ title, value, icon, description, variant = 'default' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${
          variant === 'destructive' ? 'text-destructive' : ''
        }`}>
          {value}
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Recent Activity Component
function RecentActivity() {
  const { data: stats } = useSupportStats();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest support interactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Placeholder for recent activity list */}
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">New ticket from John Doe</p>
              <p className="text-sm text-muted-foreground">Technical issue with login</p>
            </div>
            <div className="text-sm text-muted-foreground">2 min ago</div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Ticket resolved</p>
              <p className="text-sm text-muted-foreground">Billing inquiry completed</p>
            </div>
            <div className="text-sm text-muted-foreground">1 hour ago</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pending Follow-ups Component
function PendingFollowUps() {
  const { data: stats } = useSupportStats();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Follow-ups</CardTitle>
        <CardDescription>Requires immediate attention</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Placeholder for follow-ups list */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Sarah Johnson - High Priority</p>
              <p className="text-sm text-muted-foreground">Account access issue</p>
            </div>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">Mike Chen - Billing</p>
              <p className="text-sm text-muted-foreground">Invoice discrepancy</p>
            </div>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Satisfaction Card
function CustomerSatisfactionCard({ satisfaction }: { satisfaction?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Satisfaction</CardTitle>
        <CardDescription>Based on recent feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {satisfaction ? `${satisfaction}%` : 'N/A'}
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${satisfaction || 0}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Pending Follow-ups Count Card
function PendingFollowUpsCard({ count }: { count?: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Follow-ups</CardTitle>
        <CardDescription>Awaiting response</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold flex items-center space-x-2">
          <span>{count || 0}</span>
          {count && count > 5 && (
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Impersonation Activity Card
function ImpersonationActivityCard() {
  const { data: activeImpersonations } = useActiveImpersonations();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impersonation Activity</CardTitle>
        <CardDescription>Current sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {activeImpersonations?.length || 0}
        </div>
        <p className="text-sm text-muted-foreground">
          Active user sessions
        </p>
      </CardContent>
    </Card>
  );
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}