// components/SavedRepliesManager.tsx - ❌ MISSING
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, Copy, Filter } from 'lucide-react';
import { SavedReply } from '@/types/support';
import { useSavedReplies, useCreateSavedReply, useDeleteSavedReply } from '@/hooks/useSupport';

export function SavedRepliesManager() {
  const { data: savedReplies, isLoading } = useSavedReplies();
  const createReply = useCreateSavedReply();
  const deleteReply = useDeleteSavedReply();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReply, setEditingReply] = useState<SavedReply | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredReplies = savedReplies?.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseReply = (reply: SavedReply) => {
    // Copy to clipboard or insert into active editor
    navigator.clipboard.writeText(reply.content);
  };

  const handleDeleteReply = async (id: string) => {
    if (confirm('Are you sure you want to delete this saved reply?')) {
      await deleteReply.mutateAsync(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Saved Replies Manager</CardTitle>
            <CardDescription>
              Create and manage template responses for common support issues
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Reply
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved replies..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {showCreateForm || editingReply ? (
          <SavedReplyForm
            reply={editingReply}
            onSave={(data) => {
              if (editingReply) {
                // Update existing
              } else {
                createReply.mutate(data);
              }
              setShowCreateForm(false);
              setEditingReply(null);
            }}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingReply(null);
            }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Content Preview</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReplies?.map((reply) => (
                <TableRow key={reply.id}>
                  <TableCell className="font-medium">{reply.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{reply.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">
                      {reply.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reply.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {reply.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{reply.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      Used {reply.useCount} times
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUseReply(reply)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReply(reply)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReply(reply.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// Supporting component for saved reply form
function SavedReplyForm({ 
  reply, 
  onSave, 
  onCancel 
}: { 
  reply?: SavedReply | null; 
  onSave: (data: any) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    title: reply?.title || '',
    content: reply?.content || '',
    category: reply?.category || 'general',
    tags: reply?.tags || [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{reply ? 'Edit Saved Reply' : 'Create Saved Reply'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a descriptive title..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter the template content..."
              rows={8}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="account">Account</option>
              <option value="fraud">Fraud</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {reply ? 'Update' : 'Create'} Saved Reply
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}