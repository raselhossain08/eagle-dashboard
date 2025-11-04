'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CreateSupportNoteDto, SupportNote } from '@/types/support';
import { useCreateSupportNote } from '@/hooks/useSupport';
import { useSupportStore } from '@/stores/support-store';

interface CreateNoteModalProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (note: SupportNote) => void;
}

export function CreateNoteModal({ customerId, isOpen, onClose, onSuccess }: CreateNoteModalProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<CreateSupportNoteDto['category']>('general');
  const [isInternal, setIsInternal] = useState(false);
  const [requiresFollowUp, setRequiresFollowUp] = useState(false);
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>();
  const [resourceType, setResourceType] = useState('');
  const [resourceId, setResourceId] = useState('');

  const createNote = useCreateSupportNote();
  const { addSupportNote } = useSupportStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter note content');
      return;
    }

    if (requiresFollowUp && !followUpDate) {
      toast.error('Please select a follow-up date');
      return;
    }

    try {
      const noteData: CreateSupportNoteDto = {
        userId: customerId,
        content: content.trim(),
        category,
        isInternal,
        requiresFollowUp,
        followUpDate: followUpDate?.toISOString(),
        resourceType: resourceType.trim() || undefined,
        resourceId: resourceId.trim() || undefined,
      };

      const newNote = await createNote.mutateAsync(noteData);
      
      // Add to store
      addSupportNote(newNote);
      
      // Reset form
      setContent('');
      setCategory('general');
      setIsInternal(false);
      setRequiresFollowUp(false);
      setFollowUpDate(undefined);
      setResourceType('');
      setResourceId('');

      toast.success('Support note created successfully');
      onSuccess?.(newNote);
      onClose();
    } catch (error: any) {
      console.error('Failed to create note:', error);
      toast.error(error.message || 'Failed to create note');
    }
  };

  const handleClose = () => {
    if (createNote.isPending) return; // Don't allow closing while creating
    
    // Reset form when closing
    setContent('');
    setCategory('general');
    setIsInternal(false);
    setRequiresFollowUp(false);
    setFollowUpDate(undefined);
    setResourceType('');
    setResourceId('');
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Support Note</DialogTitle>
          <DialogDescription>
            Create a new support note for this customer. Internal notes are only visible to support staff.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Note Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your support note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as CreateSupportNoteDto['category'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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

            {/* Switches */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isInternal"
                  checked={isInternal}
                  onCheckedChange={setIsInternal}
                />
                <Label htmlFor="isInternal">Internal note (not visible to customer)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresFollowUp"
                  checked={requiresFollowUp}
                  onCheckedChange={setRequiresFollowUp}
                />
                <Label htmlFor="requiresFollowUp">Requires follow-up</Label>
              </div>
            </div>

            {/* Follow-up Date */}
            {requiresFollowUp && (
              <div className="space-y-2">
                <Label>Follow-up Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {followUpDate ? format(followUpDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={followUpDate}
                      onSelect={setFollowUpDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {/* Resource Reference (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resourceType">Resource Type (Optional)</Label>
                <Input
                  id="resourceType"
                  placeholder="e.g., ticket, order, subscription"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceId">Resource ID (Optional)</Label>
                <Input
                  id="resourceId"
                  placeholder="e.g., TKT-12345"
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createNote.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createNote.isPending || !content.trim()}
            >
              {createNote.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}