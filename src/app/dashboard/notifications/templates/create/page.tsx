'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCreateTemplate } from '@/hooks/useNotifications';
import TemplateEditor from '@/components/notifications/TemplateEditor';
import { CreateTemplateDto } from '@/types/notifications';
import { toast } from 'sonner';

export default function CreateTemplatePage() {
  const router = useRouter();
  const createTemplate = useCreateTemplate();

  const handleSave = async (templateData: CreateTemplateDto) => {
    try {
      await createTemplate.mutateAsync(templateData);
      toast.success('Template created successfully');
      router.push('/dashboard/notifications/templates');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create template');
    }
  };

  const handlePreview = (content: string) => {
    console.log('Preview content:', content);
    // TODO: Implement preview functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/notifications/templates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
          <p className="text-muted-foreground">
            Design a new email template with variables and rich content
          </p>
        </div>
      </div>

      <TemplateEditor 
        onSave={handleSave}
        onPreview={handlePreview}
        isSaving={createTemplate.isPending}
      />
    </div>
  );
}