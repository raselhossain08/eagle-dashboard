// app/dashboard/users/[id]/activity/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ActivityPage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/users/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to User
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Activity</h1>
          <p className="text-muted-foreground">
            Complete activity history and audit trail
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Complete history of user actions and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Activity Data</h3>
            <p className="text-muted-foreground">
              No activity data available for this user.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}