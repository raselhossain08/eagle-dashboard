'use client';

import { useState } from 'react';
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
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { useEmailLogs, useResendEmail } from '@/hooks/useNotifications';
import { EmailLog } from '@/types/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function EmailLogsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: emailLogsData, isLoading } = useEmailLogs({
    page: currentPage,
    limit: pageSize,
    search: search || undefined,
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Logs</h1>
          <p className="text-muted-foreground">
            View and manage sent email history
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/notifications/email/send">
            <Send className="w-4 h-4 mr-2" />
            Send Email
          </Link>
        </Button>
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
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by recipient or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-64"
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
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
                            onClick={() => {
                              // TODO: Implement view details
                              console.log('View details for:', log.id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canResend(log) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResend(log.id)}
                              disabled={resendEmailMutation.isPending}
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
    </div>
  );
}