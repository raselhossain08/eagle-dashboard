'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Mail, 
  Edit, 
  Copy, 
  MoreVertical, 
  Trash2, 
  RefreshCw, 
  Filter,
  Activity,
  Eye,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Zap,
  Users,
  Send,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useTemplates, useDeleteTemplate, useDuplicateTemplate } from '@/hooks/useNotifications';
import { Template } from '@/types/notifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { EmailTemplatesSkeleton } from '@/components/notifications/EmailTemplatesSkeleton';
import EmailTemplatesErrorBoundary from '@/components/errors/EmailTemplatesErrorBoundary';

const EmailTemplatesContent = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  
  const {
    data: templates,
    isLoading,
    error,
    refetch,
    isRefetching
  } = useTemplates({ search });

  const deleteTemplate = useDeleteTemplate();
  const duplicateTemplate = useDuplicateTemplate();

  // Filter templates based on type and search
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    
    return templates.filter((template) => {
      const matchesSearch = !search || 
        template.name.toLowerCase().includes(search.toLowerCase()) ||
        template.subject.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = !typeFilter || template.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [templates, search, typeFilter]);

  // Template statistics
  const templateStats = useMemo(() => {
    if (!templates) return null;
    
    return {
      total: templates.length,
      active: templates.filter(t => t.isActive).length,
      used: templates.filter(t => (t.usageCount || 0) > 0).length,
      totalUsage: templates.reduce((sum, t) => sum + (t.usageCount || 0), 0)
    };
  }, [templates]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatLastUsed = (lastUsed?: string) => {
    if (!lastUsed) return 'Never used';
    return `Last used ${formatDate(lastUsed)}`;
  };

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'transactional': return <Zap className="w-4 h-4" />;
      case 'marketing': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <AlertCircle className="w-4 h-4" />;
      case 'system': return <Activity className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'transactional': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'marketing': return 'text-green-600 bg-green-50 border-green-200';
      case 'alert': return 'text-red-600 bg-red-50 border-red-200';
      case 'system': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate.mutateAsync(templateToDelete.id);
      toast.success('Template deleted successfully');
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      const newName = `${template.name} (Copy)`;
      await duplicateTemplate.mutateAsync({ 
        id: template.id, 
        newName 
      });
      toast.success('Template duplicated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to duplicate template');
    }
  };

  const openDeleteDialog = (template: Template) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Templates refreshed');
  };

  // Handle loading state
  if (isLoading) {
    return <EmailTemplatesSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-600">Failed to Load Templates</h3>
          <p className="text-muted-foreground mt-2">
            {error.message}
          </p>
          <Button onClick={handleRefresh} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
            {isRefetching && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                Updating...
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Create and manage email templates for automated communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link href="/dashboard/notifications/templates/create">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {templateStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <div className="p-1 rounded-full bg-blue-50">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templateStats.total}</div>
              <p className="text-xs text-muted-foreground">All templates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
              <div className="p-1 rounded-full bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templateStats.active}</div>
              <p className="text-xs text-muted-foreground">Ready to use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used Templates</CardTitle>
              <div className="p-1 rounded-full bg-purple-50">
                <Send className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templateStats.used}</div>
              <p className="text-xs text-muted-foreground">Have been sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              <div className="p-1 rounded-full bg-orange-50">
                <Users className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templateStats.totalUsage.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Times sent</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Templates
                {templateStats && (
                  <Badge variant="secondary">{filteredTemplates.length} of {templateStats.total}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Manage your email templates and create new ones
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Search Input */}
              <div className="w-64">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template: Template) => (
                <Card key={template.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          {!template.isActive && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {template.subject}
                        </CardDescription>
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border ${getTemplateTypeColor(template.type || 'default')}`}>
                          {getTemplateTypeIcon(template.type || 'default')}
                          {template.type || 'default'}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/notifications/templates/${template.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/notifications/templates/${template.id}/preview`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDuplicate(template)}
                            disabled={duplicateTemplate.isPending}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            {duplicateTemplate.isPending ? 'Duplicating...' : 'Duplicate'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(template)}
                            className="text-destructive"
                            disabled={(template.usageCount || 0) > 0}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Variables */}
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      {/* Statistics */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Send className="w-3 h-3" />
                            Used {template.usageCount || 0} times
                          </span>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(template.updatedAt)}
                          </span>
                        </div>
                        {template.lastUsed && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatLastUsed(template.lastUsed)}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Button asChild className="w-full" size="sm">
                        <Link href={`/dashboard/notifications/templates/${template.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Template
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                  {/* Usage indicator bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                    !template.isActive ? 'bg-gray-200' :
                    (template.usageCount || 0) > 10 ? 'bg-green-200' :
                    (template.usageCount || 0) > 0 ? 'bg-blue-200' : 'bg-orange-200'
                  }`} />
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6">
                {search || typeFilter ? 
                  'No templates match your current filters.' : 
                  'Get started by creating your first email template.'
                }
              </p>
              {search || typeFilter ? (
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter(''); }}>
                    Clear Filters
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/notifications/templates/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Template
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button asChild>
                  <Link href="/dashboard/notifications/templates/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{templateToDelete?.name}"</strong>? This action cannot be undone.
              {templateToDelete && (templateToDelete.usageCount || 0) > 0 && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Cannot Delete Used Template</span>
                  </div>
                  <p className="text-red-700 text-sm mt-1">
                    This template has been used {templateToDelete.usageCount} times and cannot be deleted to maintain email history integrity.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteTemplate.isPending || (templateToDelete?.usageCount || 0) > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTemplate.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Template
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default function TemplatesPage() {
  return (
    <EmailTemplatesErrorBoundary>
      <EmailTemplatesContent />
    </EmailTemplatesErrorBoundary>
  );
}