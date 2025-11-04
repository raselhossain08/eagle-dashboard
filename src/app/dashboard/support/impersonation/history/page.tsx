'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Download, Calendar, User, Clock, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { useImpersonationHistory } from '@/hooks/useSupport';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export default function ImpersonationHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const queryParams = useMemo(() => ({
    page,
    limit,
    search: searchQuery || undefined,
    startDate: dateFilter || undefined,
  }), [page, limit, searchQuery, dateFilter]);

  const { data: history, isLoading, error } = useImpersonationHistory(queryParams);

  const totalPages = Math.ceil((history?.total || 0) / limit);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export report functionality to be implemented');
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'ended': return 'secondary';
      case 'force_ended': return 'destructive';
      default: return 'outline';
    }
  };

  const getDuration = (startedAt: string, endedAt?: string) => {
    const start = new Date(startedAt);
    const end = endedAt ? new Date(endedAt) : new Date();
    const diff = end.getTime() - start.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/support/impersonation">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Impersonation History</h1>
            <p className="text-muted-foreground">
              Complete audit log of all user impersonation sessions
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                All impersonation sessions with detailed audit information
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Total: {history?.total || 0} sessions
              </span>
            </div>
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
            <Button variant="outline" onClick={handleSearch}>
              <Filter className="w-4 h-4 mr-2" />
              Search
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
                <TableHead>Actions Taken</TableHead>
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
                    <TableCell><div className="h-4 bg-muted rounded w-20 animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Failed to load impersonation history</p>
                  </TableCell>
                </TableRow>
              ) : !history?.sessions || history.sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No impersonation sessions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                history.sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                          {session.adminUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{session.adminUser.name}</div>
                          <div className="text-sm text-muted-foreground">{session.adminUser.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-sm font-medium">
                          {session.targetUser.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{session.targetUser.name}</div>
                          <div className="text-sm text-muted-foreground">{session.targetUser.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs" title={session.reason}>
                        {session.reason}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 text-sm">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(session.startedAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.endedAt ? (
                        <>
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(session.endedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(session.endedAt).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{getDuration(session.startedAt, session.endedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {session.status === 'active' ? 'In progress' : 'Session completed'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, history?.total || 0)} of {history?.total || 0} sessions
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}