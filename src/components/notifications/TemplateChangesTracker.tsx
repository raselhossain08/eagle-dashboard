'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitCompare, 
  Eye, 
  X, 
  Check, 
  Clock,
  FileText,
  Hash,
  User,
  Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Template } from '@/types/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TemplateChangesTrackerProps {
  originalTemplate: Template;
  currentData: {
    name: string;
    subject: string;
    content: string;
    type?: string;
    isActive?: boolean;
    variables: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onDiscard?: () => void;
}

interface ChangeItem {
  field: string;
  label: string;
  original: any;
  current: any;
  hasChanged: boolean;
}

export default function TemplateChangesTracker({
  originalTemplate,
  currentData,
  isOpen,
  onClose,
  onSave,
  onDiscard
}: TemplateChangesTrackerProps) {
  const [changes, setChanges] = useState<ChangeItem[]>([]);

  useEffect(() => {
    const changesList: ChangeItem[] = [
      {
        field: 'name',
        label: 'Template Name',
        original: originalTemplate.name,
        current: currentData.name,
        hasChanged: originalTemplate.name !== currentData.name
      },
      {
        field: 'subject',
        label: 'Email Subject',
        original: originalTemplate.subject,
        current: currentData.subject,
        hasChanged: originalTemplate.subject !== currentData.subject
      },
      {
        field: 'content',
        label: 'Email Content',
        original: originalTemplate.content,
        current: currentData.content,
        hasChanged: originalTemplate.content !== currentData.content
      },
      {
        field: 'type',
        label: 'Template Type',
        original: originalTemplate.type || 'default',
        current: currentData.type || 'default',
        hasChanged: (originalTemplate.type || 'default') !== (currentData.type || 'default')
      },
      {
        field: 'isActive',
        label: 'Status',
        original: originalTemplate.isActive ?? true,
        current: currentData.isActive ?? true,
        hasChanged: (originalTemplate.isActive ?? true) !== (currentData.isActive ?? true)
      },
      {
        field: 'variables',
        label: 'Variables',
        original: originalTemplate.variables.sort(),
        current: currentData.variables.sort(),
        hasChanged: JSON.stringify(originalTemplate.variables.sort()) !== JSON.stringify(currentData.variables.sort())
      }
    ];

    setChanges(changesList);
  }, [originalTemplate, currentData]);

  const hasAnyChanges = changes.some(change => change.hasChanged);
  const changesCount = changes.filter(change => change.hasChanged).length;

  const formatValue = (field: string, value: any): string => {
    switch (field) {
      case 'content':
        return value?.length > 100 ? `${value.substring(0, 100)}...` : value || '';
      case 'variables':
        return Array.isArray(value) ? value.join(', ') || 'None' : 'None';
      case 'isActive':
        return value ? 'Active' : 'Inactive';
      default:
        return value?.toString() || '';
    }
  };

  const getChangeColor = (hasChanged: boolean) => {
    return hasChanged ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Template Changes Review
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Review your changes before saving the template
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasAnyChanges ? 'default' : 'secondary'}>
                {changesCount} {changesCount === 1 ? 'Change' : 'Changes'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Alert */}
          {hasAnyChanges ? (
            <Alert className="border-orange-200 bg-orange-50">
              <GitCompare className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You have <strong>{changesCount}</strong> unsaved changes. Review them below and choose to save or discard.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                No changes detected. The template matches the saved version.
              </AlertDescription>
            </Alert>
          )}

          {/* Changes Content */}
          <Tabs defaultValue="changes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="changes">Field Changes</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="changes" className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-2">
                {changes.map((change) => (
                  <Card key={change.field} className={`border ${getChangeColor(change.hasChanged)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{change.label}</h4>
                            {change.hasChanged ? (
                              <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
                                Modified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                                Unchanged
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Original:</p>
                              <div className="p-2 bg-muted/50 rounded text-xs font-mono">
                                {formatValue(change.field, change.original)}
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Current:</p>
                              <div className={`p-2 rounded text-xs font-mono ${
                                change.hasChanged ? 'bg-orange-100 border border-orange-200' : 'bg-muted/50'
                              }`}>
                                {formatValue(change.field, change.current)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Template Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Template ID:</span>
                      <code className="text-xs bg-muted px-1 rounded">{originalTemplate.id}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Usage Count:</span>
                      <span>{originalTemplate.usageCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Created:</span>
                      <span>{new Date(originalTemplate.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Last Modified:</span>
                      <span>{new Date(originalTemplate.updatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">Status:</span>
                      <Badge variant={originalTemplate.isActive ? 'default' : 'secondary'}>
                        {originalTemplate.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-muted-foreground">
              {hasAnyChanges ? 'Changes detected - action required' : 'No changes to save'}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              
              {hasAnyChanges && onDiscard && (
                <Button variant="outline" onClick={onDiscard}>
                  Discard Changes
                </Button>
              )}
              
              {hasAnyChanges && onSave && (
                <Button onClick={onSave}>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}