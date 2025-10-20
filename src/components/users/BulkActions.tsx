// app/dashboard/users/components/BulkActions.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, UserCheck, UserX, Mail, Download, Trash2, Edit3 } from 'lucide-react';

interface BulkActionsProps {
  selectedUsers: string[];
  onBulkAction: (action: string, userIds: string[]) => Promise<void>;
  totalUsers: number;
}

export function BulkActions({ selectedUsers, onBulkAction, totalUsers }: BulkActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (selectedUsers.length === 0) {
    return null;
  }

  const handleAction = async (action: string) => {
    await onBulkAction(action, selectedUsers);
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox checked disabled />
          <span className="text-sm font-medium">
            {selectedUsers.length} of {totalUsers} user(s) selected
          </span>
        </div>
        
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => handleAction('activate')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('suspend')}>
              <UserX className="h-4 w-4 mr-2" />
              Suspend Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('email')}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('export')}>
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction('edit')}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Fields
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleAction('delete')}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Users
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => handleAction('clear')}
      >
        Clear Selection
      </Button>
    </div>
  );
}