// app/dashboard/users/components/UsersTable.tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Mail, Shield, UserCheck, UserX, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { User } from '@/types/users';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UsersTableProps {
  data: User[];
  isLoading?: boolean;
  totalCount: number;
  onStatusUpdate?: (userId: string, status: string) => void;
  onDelete?: (userId: string) => void;
}

export function UsersTable({ data, isLoading, totalCount, onStatusUpdate, onDelete }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === data.length ? [] : data.map(user => user.id)
    );
  };

  const getStatusVariant = (status: User['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  const getKYCStatusVariant = (status: User['kycStatus']) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  const handleStatusUpdate = (userId: string, newStatus: string) => {
    if (onStatusUpdate) {
      onStatusUpdate(userId, newStatus);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteUserId && onDelete) {
      onDelete(deleteUserId);
      setDeleteUserId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedUsers.length > 0 ? (
              `${selectedUsers.length} of ${data.length} row(s) selected`
            ) : (
              `${totalCount} user(s)`
            )}
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      data.length > 0 && selectedUsers.length === data.length
                    }
                    onCheckedChange={toggleAllUsers}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                        aria-label={`Select user ${user.email}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={getKYCStatusVariant(user.kycStatus)} className="w-fit">
                          {user.kycStatus}
                        </Badge>
                        <Badge variant={user.emailVerified ? "default" : "secondary"} className="w-fit">
                          {user.emailVerified ? 'Email Verified' : 'Email Pending'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.company || '-'}
                    </TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
                        : 'Never'
                      }
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/users/${user.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/users/${user.id}?edit=true`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          
                          {user.status !== 'active' && onStatusUpdate && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, 'active')}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          
                          {user.status === 'active' && onStatusUpdate && (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, 'suspended')}>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteUserId(user.id)}
                                className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and remove all associated data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}