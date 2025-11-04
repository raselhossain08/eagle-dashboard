'use client';

import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Save,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { useCreateTemplate } from '@/hooks/useNotifications';
import TemplateEditor from '@/components/notifications/TemplateEditor';
import { CreateTemplateDto, UpdateTemplateDto } from '@/types/notifications';
import { toast } from 'sonner';
import { templateToast, validateTemplateForm } from '@/lib/template-validation';
import CreateTemplateErrorBoundary from '@/components/errors/CreateTemplateErrorBoundary';
import CreateTemplateSkeleton from '@/components/skeletons/CreateTemplateSkeleton';
import ApiHealthCheck from '@/components/common/ApiHealthCheck';

function CreateTemplateContent() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Prevent double navigation
  useEffect(() => {
    if (createTemplate.isSuccess && !hasNavigated) {
      setHasNavigated(true);
      templateToast.templateCreated(
        createTemplate.data?.name || 'New Template',
        () => router.push('/dashboard/notifications/templates')
      );
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push('/dashboard/notifications/templates');
      }, 2000);
    }
  }, [createTemplate.isSuccess, hasNavigated, router, createTemplate.data]);

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
      const loadingToast = templateToast.loading('Creating template...');
      
      try {
        // Type assertion since we know this is a create operation
        const result = await createTemplate.mutateAsync(templateData as CreateTemplateDto);
        templateToast.dismiss(loadingToast);
        
        if (result) {
          console.log('Template created successfully:', result);
        }
      } catch (apiError) {
        templateToast.dismiss(loadingToast);
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      console.error('Template creation error:', error);
      templateToast.templateCreateError(
        error.response?.data?.message || error.message || 'Unknown error occurred',
        () => handleSave(templateData) // Retry function
      );
    }
  };

  const handlePreview = (content: string) => {
    if (!content.trim()) {
      toast.warning('Add some content first to preview the template');
      return;
    }
    // Preview will be handled by TemplateEditor's built-in preview modal
  };

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
                  <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
                  <Badge variant="outline">
                    <Save className="h-3 w-3 mr-1" />
                    New Template
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1">
                  Design a professional email template with variables and rich content
                </p>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-2">
              {createTemplate.isPending && (
                <Badge variant="secondary" className="animate-pulse">
                  Creating...
                </Badge>
              )}
              {createTemplate.isSuccess && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Created Successfully
                </Badge>
              )}
              {createTemplate.isError && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Error
                </Badge>
              )}
            </div>
          </div>

          {/* Success Alert */}
          {createTemplate.isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Template created successfully! Redirecting to templates list...
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {createTemplate.isError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to create template: {createTemplate.error?.message || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}

          {/* Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Template Creation Tips:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Use descriptive names for easy identification</li>
                <li>Add variables like <code>{'{{user.name}}'}</code> for personalization</li>
                <li>Choose appropriate template type for better organization</li>
                <li>Preview your template before saving</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Template Editor */}
          <TemplateEditor 
            onSave={handleSave}
            onPreview={handlePreview}
            isSaving={createTemplate.isPending}
          />

          {/* API Health & Footer Information */}
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <div className="border-t pt-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>📧 Professional Email Templates</span>
                    <span>🔄 Real-time API Integration</span>
                    <span>✨ Variable Support</span>
                    <span>🛡️ Advanced Validation</span>
                  </div>
                  <span>Template Builder v2.0</span>
                </div>
              </div>
            </div>
            
            {/* API Health Check */}
            <div className="lg:col-span-1">
              <ApiHealthCheck />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateTemplatePage() {
  return (
    <CreateTemplateErrorBoundary>
      <Suspense fallback={<CreateTemplateSkeleton />}>
        <CreateTemplateContent />
      </Suspense>
    </CreateTemplateErrorBoundary>
  );
}