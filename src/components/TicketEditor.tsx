// components/TicketEditor.tsx
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { SupportNote, SavedReply } from '@/types/support';
import { Save, X, Copy, Search } from 'lucide-react';

interface TicketEditorProps {
  note?: SupportNote;
  savedReplies: SavedReply[];
  onSave: (data: { content: string; category: SupportNote['category']; isInternal: boolean }) => void;
  onCancel: () => void;
  mode: 'create' | 'edit';
}

export function TicketEditor({ note, savedReplies, onSave, onCancel, mode }: TicketEditorProps) {
  const [formData, setFormData] = useState({
    content: note?.content || '',
    category: note?.category || 'general' as SupportNote['category'],
    isInternal: note?.isInternal || false
  });
  const [showSavedReplies, setShowSavedReplies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredReplies = savedReplies.filter(reply =>
    reply.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reply.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUseSavedReply = (reply: SavedReply) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content ? `${prev.content}\n\n${reply.content}` : reply.content
    }));
    setShowSavedReplies(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              {mode === 'create' ? 'Create Support Note' : 'Edit Support Note'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Add a new support note or ticket' 
                : 'Update the support note details'
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSavedReplies(!showSavedReplies)}
            >
              <Copy className="w-4 h-4 mr-2" />
              Saved Replies
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: SupportNote['category']) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="high_priority">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="visibility"
                    checked={!formData.isInternal}
                    onChange={() => setFormData(prev => ({ ...prev, isInternal: false }))}
                    className="text-blue-600"
                  />
                  <span>Customer-facing</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="visibility"
                    checked={formData.isInternal}
                    onChange={() => setFormData(prev => ({ ...prev, isInternal: true }))}
                    className="text-blue-600"
                  />
                  <span>Internal</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              ref={textareaRef}
              id="content"
              placeholder="Enter detailed support note content..."
              rows={8}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              required
              className="font-mono text-sm"
            />
          </div>

          {showSavedReplies && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Saved Replies</CardTitle>
                <CardDescription>
                  Choose from pre-written response templates
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search saved replies..."
                    className="pl-8 w-full p-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {filteredReplies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleUseSavedReply(reply)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{reply.title}</div>
                        <Badge variant="secondary">{reply.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {reply.content}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {reply.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Create Note' : 'Update Note'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}