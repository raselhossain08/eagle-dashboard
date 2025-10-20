'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Mail, Phone, Calendar, MessageSquare, Shield, Download } from 'lucide-react';
import Link from 'next/link';
import { CustomerProfile } from '@/components/CustomerProfile';
import { SupportNotesTable } from '@/components/SupportNotesTable';
import { SupportTimeline } from '@/components/SupportTimeline';
import { useSupportNotes, useSupportStats } from '@/hooks/useSupport';

const mockCustomer = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  company: 'Acme Inc',
  supportTier: 'premium' as const,
  lastContact: '2024-01-15T10:30:00Z',
  ticketCount: 5,
  satisfactionScore: 4.5,
  joinDate: '2023-01-15T00:00:00Z'
};

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const { data: notesData, isLoading } = useSupportNotes(customerId);
  const { data: stats } = useSupportStats();

  const handleStartImpersonation = (customerId: string) => {
    console.log('Start impersonation for:', customerId);
    // Implement impersonation logic
  };

  const handleAddNote = (customerId: string) => {
    console.log('Add note for:', customerId);
    // Implement add note logic
  };

  const customerNotes = notesData?.notes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Customers
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Profile</h1>
            <p className="text-muted-foreground">
              Complete customer support history and management
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="notes">Support Notes ({customerNotes.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CustomerProfile
            customer={mockCustomer}
            supportNotes={customerNotes}
            onStartImpersonation={handleStartImpersonation}
            onAddNote={handleAddNote}
          />
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Support Notes</CardTitle>
              <CardDescription>
                All support interactions and notes for {mockCustomer.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SupportNotesTable notes={customerNotes} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <SupportTimeline notes={customerNotes} customerId={customerId} />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>
                  Basic customer details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">{mockCustomer.name}</div>
                    <div className="text-sm text-muted-foreground">{mockCustomer.company}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{mockCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{mockCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Customer since {new Date(mockCustomer.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Settings</CardTitle>
                <CardDescription>
                  Manage customer-specific support preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Support Tier</h4>
                    <p className="text-sm text-muted-foreground">Current support level</p>
                  </div>
                  <Badge variant="secondary">{mockCustomer.supportTier}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Priority Support</h4>
                    <p className="text-sm text-muted-foreground">Enhanced response times</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Communication</h4>
                    <p className="text-sm text-muted-foreground">Preferred contact methods</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Security Level</h4>
                    <p className="text-sm text-muted-foreground">Account security settings</p>
                  </div>
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <Shield className="w-3 h-3" />
                    <span>Standard</span>
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}