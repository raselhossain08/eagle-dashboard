// components/CustomerProfile.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Customer, SupportNote } from '@/types/support';
import { User, Mail, Phone, Calendar, Star, AlertTriangle, MessageSquare } from 'lucide-react';
import { SupportTimeline } from './SupportTimeline';

interface CustomerProfileProps {
  customer: Customer;
  supportNotes: SupportNote[];
  onStartImpersonation: (customerId: string) => void;
  onAddNote: (customerId: string) => void;
}

export function CustomerProfile({ 
  customer, 
  supportNotes, 
  onStartImpersonation, 
  onAddNote 
}: CustomerProfileProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'premium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    if (score >= 4.5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    if (score >= 3.5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const openTickets = supportNotes.filter(note => !note.isResolved);
  const highPriorityTickets = supportNotes.filter(note => 
    note.category === 'high_priority' || note.category === 'fraud'
  );

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center text-xl font-semibold">
                {customer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{customer.email}</span>
                  </div>
                  <Badge className={getTierColor(customer.supportTier)}>
                    {customer.supportTier}
                  </Badge>
                  {customer.satisfactionScore && (
                    <Badge className={getPriorityColor(customer.satisfactionScore)}>
                      <Star className="w-3 h-3 mr-1" />
                      {customer.satisfactionScore}/5
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                onClick={() => onAddNote(customer.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Note
              </Button>
              <Button 
                onClick={() => onStartImpersonation(customer.id)}
              >
                <User className="w-4 h-4 mr-2" />
                Impersonate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{supportNotes.length}</div>
            <p className="text-xs text-muted-foreground">All time support requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets.length}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityTickets.length}</div>
            <p className="text-xs text-muted-foreground">Urgent issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Contact</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Most recent interaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Timeline */}
      <SupportTimeline notes={supportNotes} customerId={customer.id} />
    </div>
  );
}