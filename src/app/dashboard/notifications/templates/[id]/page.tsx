'use client';

import { useParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Save,
  Clock,
  FileText,
  Eye,
  GitCompare
} from 'lucide-react';
import Link from 'next/link';
import { useTemplate, useUpdateTemplate } from '@/hooks/useNotifications';

import TemplateEditor from '@/components/notifications/TemplateEditor';
import { UpdateTemplateDto, CreateTemplateDto } from '@/types/notifications';
import { toast } from 'sonner';
import EditTemplateErrorBoundary from '@/components/errors/EditTemplateErrorBoundary';
import EditTemplateSkeleton from '@/components/skeletons/EditTemplateSkeleton';
import ApiHealthCheck from '@/components/common/ApiHealthCheck';
import { templateToast, validateTemplateForm } from '@/lib/template-validation';
import TemplateChangesTracker from '@/components/notifications/TemplateChangesTracker';

function EditTemplateContent() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showChangesTracker, setShowChangesTracker] = useState(false);
  const [currentFormData, setCurrentFormData] = useState<any>(null);
  
  const { 
    data: template, 
    isLoading, 
    error: templateError,
    refetch 
  } = useTemplate(templateId);
  
  const updateTemplate = useUpdateTemplate();

  // Prevent double navigation
  useEffect(() => {
    if (updateTemplate.isSuccess && !hasNavigated) {
      setHasNavigated(true);
      templateToast.success(`Template "${template?.name || 'Template'}" updated successfully!`, {
        duration: 5000,
        action: {
          label: 'View Templates',
          onClick: () => router.push('/dashboard/notifications/templates'),
        },
      });
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push('/dashboard/notifications/templates');
      }, 2000);
    }
  }, [updateTemplate.isSuccess, hasNavigated, router, template?.name]);

  const handleSave = async (templateData: CreateTemplateDto | UpdateTemplateDto) => {
    try {
      if (hasNavigated) return; // Prevent double submission
      
      // Validate form data first
      const validation = validateTemplateForm({
        name: templateData.name || '',
        subject: templateData.subject || '',
        content: templateData.content || '',
        type: templateData.type || ''
      });

      if (!validation.isValid) {
        // Show first validation error
        const firstError = Object.entries(validation.errors)[0];
        if (firstError) {
          templateToast.validationError(firstError[0], firstError[1]);
        }
        return;
      }

      // Show loading toast
      const loadingToast = templateToast.loading('Updating template...');
      
      try {
        const result = await updateTemplate.mutateAsync({ 
          id: templateId, 
          data: templateData as UpdateTemplateDto
        });
        templateToast.dismiss(loadingToast);
        
        if (result) {
          console.log('Template updated successfully:', result);
        }
      } catch (apiError) {
        templateToast.dismiss(loadingToast);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      console.error('Template update error:', error);
      templateToast.error(
        error.response?.data?.message || error.message || 'Failed to update template',
        {
          duration: 7000,
          action: {
            label: 'Retry',
            onClick: () => handleSave(templateData),
          },
        }
      );
    }
  };

  const handlePreview = (content: string) => {
    if (!content.trim()) {
      templateToast.warning('Add some content first to preview the template');
      return;
    }
    // Preview will be handled by TemplateEditor's built-in preview modal
  };

  // Loading State
  if (isLoading) {
    return <EditTemplateSkeleton />;
  }

  // Error State
  if (templateError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications/templates">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-destructive">
                  Failed to Load Template
                </h1>
                <p className="text-muted-foreground">
                  The template could not be retrieved from the server
                </p>
              </div>
            </div>

            {/* Error Alert */}
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Error:</strong> {templateError instanceof Error ? templateError.message : 'Failed to fetch template'}
              </AlertDescription>
            </Alert>

            <Card>
              <CardContent className="text-center py-12 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">Template Not Found</p>
                  <p className="text-sm text-muted-foreground">
                    The template with ID "{templateId}" could not be found or you don't have permission to access it.
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Button onClick={() => refetch()} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Retry Loading
                  </Button>
                  <Button asChild>
                    <Link href="/dashboard/notifications/templates">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Templates
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

  // Template Not Found State
  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto max-w-4xl p-4">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications/templates">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Template Not Found</h1>
                <p className="text-muted-foreground">
                  The template you're looking for doesn't exist
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="text-center py-12 space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">No Template Data</p>
                  <p className="text-sm text-muted-foreground">
                    Template ID "{templateId}" returned empty data from the API
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/notifications/templates">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Templates
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Template Found
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto max-w-7xl p-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard/notifications/templates">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">Edit Template</h1>
                  <Badge variant="outline">
                    <Edit className="h-3 w-3 mr-1" />
                    Editing
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Update email template: <strong>{template.name}</strong>
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {updateTemplate.isPending && (
                <Badge variant="secondary" className="animate-pulse">
                  Updating...
                </Badge>
              )}
              {updateTemplate.isSuccess && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Updated Successfully
                </Badge>
              )}
              {updateTemplate.isError && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Update Error
                </Badge>
              )}
            </div>
          </div>

          {/* Success Alert */}
          {updateTemplate.isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Template updated successfully! Redirecting to templates list...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {updateTemplate.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to update template: {updateTemplate.error?.message || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}

          {/* Template Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Template ID:</strong> {template.id}
                </div>
                <div>
                  <strong>Type:</strong> {template.type || 'Default'}
                </div>
                <div>
                  <strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <strong>Last Modified:</strong> {new Date(template.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Template Editor */}
          <TemplateEditor 
            template={template} 
            onSave={handleSave}
            onPreview={handlePreview}
            onCompare={(formData) => {
              setCurrentFormData(formData);
              setShowChangesTracker(true);
            }}
            isSaving={updateTemplate.isPending}
          />

          {/* Footer Information */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>📧 Template Editor</span>
                    <span>🔄 Real-time API Updates</span>
                    <span>✨ Live Preview</span>
                    <span>🛡️ Data Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Last saved: {new Date(template.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* API Health Check */}
            <div className="lg:col-span-1">
              <ApiHealthCheck />
            </div>
          </div>

          {/* Changes Tracker Modal */}
          {template && currentFormData && (
            <TemplateChangesTracker
              originalTemplate={template}
              currentData={currentFormData}
              isOpen={showChangesTracker}
              onClose={() => setShowChangesTracker(false)}
              onSave={() => {
                handleSave(currentFormData);
                setShowChangesTracker(false);
              }}
              onDiscard={() => {
                setCurrentFormData(null);
                setShowChangesTracker(false);
                // Reset form to original values
                if (template) {
                  templateToast.info('Changes discarded. Form reset to saved values.');
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditTemplatePage() {
  return (
    <EditTemplateErrorBoundary>
      <Suspense fallback={<EditTemplateSkeleton />}>
        <EditTemplateContent />
      </Suspense>
    </EditTemplateErrorBoundary>
  );
}