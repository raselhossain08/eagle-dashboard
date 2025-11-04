// components/SupportTimeline.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupportNote } from '@/types/support';
import { 
  MessageSquare, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  Tag,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface SupportTimelineProps {
  notes: SupportNote[];
  customerId: string;
  isLoading?: boolean;
}

export function SupportTimeline({ notes, customerId, isLoading }: SupportTimelineProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter notes based on search and filters
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchQuery === '' || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'resolved' && note.isResolved) ||
      (statusFilter === 'pending' && !note.isResolved) ||
      (statusFilter === 'followup' && note.requiresFollowUp);

    return matchesSearch && matchesCategory && matchesStatus;
  });
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
      case 'fraud':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300';
      case 'high_priority':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-300';
      case 'billing':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-300';
      case 'technical':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-300';
      case 'account':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusIcon = (note: SupportNote) => {
    if (note.isResolved) {
      return <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />;
    }
    if (note.requiresFollowUp) {
      return <Clock className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  };

  const getTimelineIcon = (note: SupportNote) => {
    if (note.isInternal) {
      return <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />;
    }
    return <MessageSquare className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Timeline</CardTitle>
          <CardDescription>Loading customer interaction history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-4 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Timeline</CardTitle>
          <CardDescription>Customer interaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No support notes found</h3>
            <p className="text-muted-foreground mb-4">
              This customer hasn't had any support interactions yet.
            </p>
            <Button>
              <MessageSquare className="w-4 h-4 mr-2" />
              Add First Note
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Support Timeline</span>
            <Badge variant="secondary">{filteredNotes.length}</Badge>
          </CardTitle>
          <CardDescription>Complete history of customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="fraud">Fraud</SelectItem>
                <SelectItem value="high_priority">High Priority</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="followup">Follow-up</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredNotes.map((note, index) => (
          <Card key={note.id} className="relative">
            {/* Timeline line */}
            {index < filteredNotes.length - 1 && (
              <div className="absolute left-8 top-16 w-px h-full bg-border" />
            )}
            
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                {/* Timeline icon */}
                <div className="flex-shrink-0 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center">
                  {getTimelineIcon(note)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm">
                        {note.isInternal ? 'Internal Note' : 'Customer Support'}
                      </h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(note.category)}`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {note.category.replace('_', ' ')}
                      </Badge>
                      {getStatusIcon(note)}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>by {note.adminUser?.name || 'System'}</span>
                      </div>
                      
                      {note.requiresFollowUp && note.followUpDate && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Follow-up: {format(new Date(note.followUpDate), 'MMM dd')}</span>
                        </div>
                      )}

                      {note.isResolved && note.resolvedAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Resolved: {format(new Date(note.resolvedAt), 'MMM dd')}</span>
                        </div>
                      )}
                    </div>

                    {note.resourceType && note.resourceId && (
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View {note.resourceType}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (notes.length > 0) && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notes match your filters</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search query or filters to see more results.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}