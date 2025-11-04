'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Users } from 'lucide-react';
import { useStartImpersonation } from '@/hooks/useSupport';
import { toast } from 'sonner';

interface StartImpersonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StartImpersonationModal({ open, onOpenChange }: StartImpersonationModalProps) {
  const [targetUserId, setTargetUserId] = useState('');
  const [reason, setReason] = useState('');
  const [maxDuration, setMaxDuration] = useState('60');

  const startImpersonation = useStartImpersonation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetUserId.trim()) {
      toast.error('Please enter a valid user ID');
      return;
    }
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for impersonation');
      return;
    }

    try {
      const result = await startImpersonation.mutateAsync({
        targetUserId: targetUserId.trim(),
        reason: reason.trim(),
        maxDuration: parseInt(maxDuration),
      });

      toast.success('Impersonation session started successfully');
      
      // Reset form
      setTargetUserId('');
      setReason('');
      setMaxDuration('60');
      onOpenChange(false);

      // Optionally redirect to the impersonation session or show token
      console.log('Impersonation result:', result);
    } catch (error: any) {
      console.error('Failed to start impersonation:', error);
      toast.error(error?.message || 'Failed to start impersonation session');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Start User Impersonation</span>
          </DialogTitle>
          <DialogDescription>
            Begin a secure impersonation session to assist with customer support.
            This action will be logged and monitored.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetUserId">Target User ID *</Label>
            <Input
              id="targetUserId"
              placeholder="Enter user ID or email"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Impersonation *</Label>
            <Textarea
              id="reason"
              placeholder="Describe why this impersonation is necessary..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxDuration">Maximum Duration</Label>
            <Select value={maxDuration} onValueChange={setMaxDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Security Warning */}
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Security Notice</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                This session will be logged and monitored. Only use impersonation for legitimate support purposes.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={startImpersonation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={startImpersonation.isPending || !targetUserId.trim() || !reason.trim()}
            >
              {startImpersonation.isPending ? 'Starting...' : 'Start Impersonation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}