// app/dashboard/users/[id]/support/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Plus, 
  Headphones, 
  MessageCircle, 
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Star,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useSupportNotes, useCreateSupportNote, useSupportStats } from '@/hooks/useSupport';
import { SupportNote } from '@/types/support';
import { toast } from 'sonner';

export default function SupportPage() {
  const params = useParams();
  const userId = params.id as string;
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newNoteOpen, setNewNoteOpen] = useState(false);

  // Support notes and tickets data
  const { 
    data: notesData, 
    isLoading: notesLoading, 
    error: notesError, 
    refetch: refetchNotes 
  } = useSupportNotes(userId, {
    page: 1,
    limit: 20,
    ...(selectedStatus !== 'all' && { isResolved: selectedStatus === 'resolved' }),
    ...(selectedCategory !== 'all' && { category: selectedCategory })
  });

  const { data: supportStats, isLoading: statsLoading } = useSupportStats();
  const createNote = useCreateSupportNote();

  const [noteForm, setNoteForm] = useState({
    content: '',
    category: 'general',
    isInternal: false,
    followUpDate: ''
  });

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNote.mutateAsync({
        userId,
        content: noteForm.content,
        category: noteForm.category as SupportNote['category'],
        isInternal: noteForm.isInternal,
        requiresFollowUp: Boolean(noteForm.followUpDate),
        followUpDate: noteForm.followUpDate || undefined
      });
      toast.success('Support note created successfully');
      setNewNoteOpen(false);
      setNoteForm({ content: '', category: 'general', isInternal: false, followUpDate: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create note');
    }
  };

  const handleRefresh = () => {
    refetchNotes();
    toast.success('Support data refreshed');
  };

  const getStatusColor = (isResolved: boolean) => {
    return isResolved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'technical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'billing': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'general': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      'urgent': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[category] || colors.general;
  };

  if (notesLoading && statsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/users/${userId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Support History</h1>
              <p className="text-muted-foreground">
                User support tickets and interactions
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading support data...</p>
          </div>
        </div>
      </div>
    );
  }

  const notes = notesData?.notes || [];
  const totalNotes = notesData?.total || 0;
  const openNotes = notes.filter(note => !note.isResolved).length;
  const resolvedNotes = notes.filter(note => note.isResolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/users/${userId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to User
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Support History</h1>
            <p className="text-muted-foreground">
              User support tickets and interactions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={newNoteOpen} onOpenChange={setNewNoteOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Note</DialogTitle>
                <DialogDescription>
                  Add a new support note for this user
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={noteForm.content}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter support note content..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={noteForm.category} onValueChange={(value) => setNoteForm(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="technical">Technical</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="followUpDate">Follow-up Date</Label>
                    <Input
                      id="followUpDate"
                      type="date"
                      value={noteForm.followUpDate}
                      onChange={(e) => setNoteForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isInternal"
                    checked={noteForm.isInternal}
                    onChange={(e) => setNoteForm(prev => ({ ...prev, isInternal: e.target.checked }))}
                  />
                  <Label htmlFor="isInternal">Internal note (not visible to user)</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setNewNoteOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createNote.isPending}>
                    {createNote.isPending ? 'Creating...' : 'Create Note'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {notesError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load support data: {notesError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Support Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Items</CardTitle>
            <Badge variant="outline">{openNotes}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openNotes}</div>
            <p className="text-xs text-muted-foreground">
              Currently open support items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotes}</div>
            <p className="text-xs text-muted-foreground">
              All-time support items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalNotes > 0 ? Math.round((resolvedNotes / totalNotes) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Items resolved
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notes">Support Notes</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
        </TabsList>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Support Notes</CardTitle>
                  <CardDescription>
                    All support interactions and notes for this user
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(note.isResolved)} variant="secondary">
                            {note.isResolved ? 'Resolved' : 'Open'}
                          </Badge>
                          <Badge className={getCategoryColor(note.category)} variant="secondary">
                            {note.category}
                          </Badge>
                          {note.isInternal && (
                            <Badge variant="outline">Internal</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">{note.content}</p>
                        

                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Created by {note.adminUser?.name}
                          </div>
                          {note.followUpDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Follow-up: {new Date(note.followUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Headphones className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Support History</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    This user hasn't had any support interactions yet. Create a new note to start tracking support activities.
                  </p>
                  <Button onClick={() => setNewNoteOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Note
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>
                Formal support tickets and their resolution status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  This user hasn't created any formal support tickets yet. Tickets will appear here when created.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}