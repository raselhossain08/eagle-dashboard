// app/dashboard/users/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/useUsers';
// import { UserProfile } from '../components/UserProfile';
// import { UserActivity } from '../components/UserActivity';
import { ArrowLeft, Mail, Phone, Building, MapPin, Calendar, Shield, CreditCard, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const { data: users, isLoading } = useUsers();
  const user = users?.users?.find(u => u.id === params.id);

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading user details...</div>;
  }

  if (!user) {
    return <div className="flex justify-center p-8">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground">User ID: {user.id}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user.email}</span>
                {user.emailVerified && (
                  <Badge variant="outline" className="text-xs">Verified</Badge>
                )}
              </div>
              
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              
              {user.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{user.company}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
              <Badge variant={
                user.kycStatus === 'verified' ? 'default' : 
                user.kycStatus === 'pending' ? 'secondary' : 'destructive'
              }>
                KYC: {user.kycStatus}
              </Badge>
            </div>

            <div className="pt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/users/${user.id}/profile`}>
                  <Shield className="h-4 w-4 mr-2" />
                  Profile Settings
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/users/${user.id}/subscriptions`}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscriptions
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/dashboard/users/${user.id}/support`}>
                  <Headphones className="h-4 w-4 mr-2" />
                  Support History
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>
                    Detailed user profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Profile Details</h3>
                    <p className="text-muted-foreground">
                      User profile details will be displayed here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity</CardTitle>
                  <CardDescription>
                    Recent user activity and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                    <p className="text-muted-foreground">
                      No recent activity to display for this user.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriptions</CardTitle>
                  <CardDescription>
                    User subscription information and billing details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Subscriptions</h3>
                    <p className="text-muted-foreground mb-4">
                      This user doesn't have any active subscriptions.
                    </p>
                    <Button>Add Subscription</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle>Support History</CardTitle>
                  <CardDescription>
                    User support tickets and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
                    <p className="text-muted-foreground">
                      This user hasn't created any support tickets yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}