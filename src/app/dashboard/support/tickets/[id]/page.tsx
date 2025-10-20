// app/dashboard/support/tickets/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Clock, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useSupportNotes } from '@/hooks/useSupport';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  
  // This would typically fetch a single ticket by ID
  const { data: notesData, isLoading } = useSupportNotes();
  const ticket = notesData?.notes.find(note => note.id === ticketId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/support/tickets">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Ticket #{ticket.id.slice(-8)}</h1>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Ticket
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {ticket.content}
                </p>
              </div>
              
              {ticket.requiresFollowUp && ticket.followUpDate && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium text-yellow-800 dark:text-yellow-300">
                      Follow-up required by {new Date(ticket.followUpDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversation thread would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Ticket updates and responses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium">{ticket.user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{ticket.content}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <Badge variant={ticket.isResolved ? 'default' : 'secondary'}>
                  {ticket.isResolved ? 'Resolved' : 'Open'}
                </Badge>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <div className="font-medium">{ticket.category}</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Priority</div>
                <div className="font-medium">
                  {ticket.category === 'high_priority' ? 'High' : 'Normal'}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Created</div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  {ticket.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{ticket.user.name}</div>
                  <div className="text-sm text-muted-foreground">{ticket.user.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}