// components/ImpersonationLog.tsx - ❌ MISSING
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, Eye } from 'lucide-react';
import { useImpersonationHistory } from '@/hooks/useSupport';
import { useState } from 'react';

export function ImpersonationLog() {
  const { data: history, isLoading } = useImpersonationHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredSessions = history?.sessions.filter(session =>
    session.adminUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.targetUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'ended': return 'secondary';
      case 'force_ended': return 'destructive';
      default: return 'outline';
    }
  };

  const exportToCSV = () => {
    // Implement CSV export functionality
    console.log('Exporting impersonation log...');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Impersonation Audit Log</CardTitle>
            <CardDescription>
              Complete history of all user impersonation sessions for security auditing
            </CardDescription>
          </div>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 pt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin User</TableHead>
              <TableHead>Target User</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-muted rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-8 bg-muted rounded w-8 animate-pulse" /></TableCell>
                </TableRow>
              ))
            ) : filteredSessions?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No impersonation sessions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSessions?.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    <div className="font-medium">{session.adminUser.name}</div>
                    <div className="text-sm text-muted-foreground">{session.adminUser.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{session.targetUser.name}</div>
                    <div className="text-sm text-muted-foreground">{session.targetUser.email}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={session.reason}>
                      {session.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(session.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {session.endedAt ? new Date(session.endedAt).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {session.endedAt 
                      ? `${Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)}m`
                      : 'Active'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(session.status)}>
                      {session.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}