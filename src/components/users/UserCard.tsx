// app/dashboard/users/components/UserCard.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@/types/users';
import { Mail, Phone, Building, Calendar, MoreHorizontal, MapPin, Shield } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserCardProps {
  user: User;
  onAction?: (action: string, user: User) => void;
  compact?: boolean;
}

export function UserCard({ user, onAction, compact = false }: UserCardProps) {
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCColor = (status: User['kycStatus']) => {
    switch (status) {
      case 'verified': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                {user.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAction?.('view', user)}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction?.('edit', user)}>
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAction?.('email', user)}>
                    Send Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div>
              <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAction?.('view', user)}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('edit', user)}>
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('email', user)}>
                Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction?.('suspend', user)}>
                Suspend User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(user.status)}>
            {user.status}
          </Badge>
          <Badge className={getKYCColor(user.kycStatus)}>
            <Shield className="h-3 w-3 mr-1" />
            {user.kycStatus}
          </Badge>
          {user.emailVerified && (
            <Badge variant="outline" className="text-xs">
              Email Verified
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 text-sm">
          {user.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center gap-2">
              <Building className="h-3 w-3 text-muted-foreground" />
              <span>{user.company}</span>
            </div>
          )}
          {user.address?.city && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span>{user.address.city}, {user.address.country}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onAction?.('email', user)}>
            <Mail className="h-3 w-3 mr-1" />
            Email
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onAction?.('view', user)}>
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}