'use client';

import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  Search, 
  Filter, 
  Send, 
  RefreshCw, 
  Calendar,
  Eye,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  ArrowLeft,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useEmailLogs, useResendEmail } from '@/hooks/useNotifications';
import { EmailLog } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { EmailLogsErrorBoundary } from '@/components/notifications/EmailLogsErrorBoundary';
import { EmailLogsSkeleton } from '@/components/notifications/EmailLogsSkeleton';
import EmailLogDetailModal from '@/components/notifications/EmailLogDetailModal';
import EmailStatsDashboard from '@/components/notifications/EmailStatsDashboard';

function EmailLogsContent() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmailLog, setSelectedEmailLog] = useState<EmailLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const pageSize = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const { 
    data: emailLogsData, 
    isLoading, 
    error,
    refetch,
    isRefetching 
  } = useEmailLogs({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
  });

  const resendEmailMutation = useResendEmail();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      sent: { variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      delivered: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      failed: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' },
      opened: { variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      clicked: { variant: 'default' as const, color: 'bg-indigo-100 text-indigo-800' },
      bounced: { variant: 'destructive' as const, color: 'bg-orange-100 text-orange-800' },
      scheduled: { variant: 'outline' as const, color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleResend = async (emailLogId: string) => {
    try {
      await resendEmailMutation.mutateAsync(emailLogId);
      toast.success('Email resent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email');
    }
  };

  const canResend = (log: EmailLog) => {
    return ['failed', 'bounced'].includes(log.status) && (log.retryCount || 0) < 3;
  };

  const handleViewDetails = (log: EmailLog) => {
    setSelectedEmailLog(log);
    setShowDetailModal(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.info('Refreshing email logs...');
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCurrentPage(1);
    toast.info('Filters cleared');
  };

  const hasFilters = search || statusFilter;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
                <p className="text-muted-foreground">
                  View and manage sent email history
                </p>
              </div>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Failed to load email logs:</strong> {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Unable to Load Data</p>
                  <p className="text-sm text-muted-foreground">
                    Please check your connection and try again
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button onClick={() => refetch()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/notifications">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-7xl p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
                <p className="text-muted-foreground">
                  View and manage sent email history
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={isRefetching}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild>
                <Link href="/dashboard/notifications/email/send">
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Statistics
            </h2>
            <EmailStatsDashboard />
          </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                Track delivery status and manage email communications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by recipient, subject, or email ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-80"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="opened">Opened</SelectItem>
                  <SelectItem value="clicked">Clicked</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              {hasFilters && (
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="border-b bg-muted/50 p-4">
                <div className="flex justify-between">
                  <div className="flex space-x-8">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
              <div className="divide-y">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-8 flex-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : emailLogsData && emailLogsData.logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emailLogsData.logs.map((log: EmailLog) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.to}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={log.subject}>
                          {log.subject}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {log.sentAt ? formatDate(log.sentAt) : 'Not sent'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.templateId ? (
                          <Badge variant="outline">Template</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Custom</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canResend(log) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(log.id)}
                              disabled={resendEmailMutation.isPending}
                              title={`Resend Email (${log.retryCount || 0}/3 attempts)`}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {emailLogsData.total > pageSize && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, emailLogsData.total)} of{' '}
                    {emailLogsData.total} emails
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {Math.ceil(emailLogsData.total / pageSize)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={currentPage >= Math.ceil(emailLogsData.total / pageSize)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No emails found</h3>
              <p className="text-muted-foreground mt-2 mb-6">
                {search || statusFilter
                  ? 'No emails match your current filters.'
                  : 'No emails have been sent yet.'}
              </p>
              <Button asChild>
                <Link href="/dashboard/notifications/email/send">
                  <Send className="h-4 w-4 mr-2" />
                  Send Your First Email
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Log Detail Modal */}
      {selectedEmailLog && (
        <EmailLogDetailModal
          emailLog={selectedEmailLog}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedEmailLog(null);
          }}
        />
      )}
    </div>
  </div>
</div>
  );
}

export default function EmailLogsPage() {
  return (
    <EmailLogsErrorBoundary>
      <Suspense fallback={<EmailLogsSkeleton />}>
        <EmailLogsContent />
      </Suspense>
    </EmailLogsErrorBoundary>
  );
}