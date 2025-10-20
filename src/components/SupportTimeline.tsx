// components/SupportTimeline.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SupportNote } from '@/types/support';
import { MessageSquare, User, Phone, Mail, Calendar, FileText } from 'lucide-react';

interface SupportTimelineProps {
  notes: SupportNote[];
  customerId: string;
}

export function SupportTimeline({ notes, customerId }: SupportTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <MessageSquare className="w-4 h-4" />;
      case 'call': return <Phone className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: SupportNote['category']) => {
    switch (category) {
      case 'high_priority': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'fraud': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'technical': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'billing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'account': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Timeline</CardTitle>
        <CardDescription>
          Complete history of customer interactions and support activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No support activities found</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
              
              {notes.map((note, index) => (
                <div key={note.id} className="relative flex items-start space-x-4 mb-6">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    note.category === 'high_priority' 
                      ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  }`}>
                    {getActivityIcon('note')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{note.adminUser.name}</span>
                        <Badge variant={note.isInternal ? 'secondary' : 'default'}>
                          {note.isInternal ? 'Internal' : 'Customer-facing'}
                        </Badge>
                        <Badge className={getCategoryColor(note.category)}>
                          {note.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(note.createdAt).toLocaleDateString()} at{' '}
                        {new Date(note.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>

                    {note.requiresFollowUp && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          <span className="font-medium text-yellow-800 dark:text-yellow-300">
                            Follow-up required by {note.followUpDate ? new Date(note.followUpDate).toLocaleDateString() : 'TBD'}
                          </span>
                        </div>
                      </div>
                    )}

                    {note.isResolved && (
                      <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-900">
                          Resolved
                        </Badge>
                        <span>
                          {note.resolvedAt && `on ${new Date(note.resolvedAt).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm">
                        Reply
                      </Button>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      {!note.isResolved && (
                        <Button variant="outline" size="sm">
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}