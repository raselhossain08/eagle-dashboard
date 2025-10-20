'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useCreateTemplate } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export default function CreateTemplatePage() {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    variables: [''] as string[],
  });

  const { mutate: createTemplate, isPending } = useCreateTemplate();

  const handleAddVariable = () => {
    setFormData(prev => ({
      ...prev,
      variables: [...prev.variables, '']
    }));
  };

  const handleVariableChange = (index: number, value: string) => {
    const newVariables = [...formData.variables];
    newVariables[index] = value;
    setFormData(prev => ({ ...prev, variables: newVariables }));
  };

  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter template content');
      return;
    }

    const validVariables = formData.variables.filter(v => v.trim() !== '');
    
    createTemplate({
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      variables: validVariables,
    }, {
      onSuccess: () => {
        toast.success('Template created successfully');
        setFormData({
          name: '',
          subject: '',
          content: '',
          variables: [''],
        });
      },
      onError: () => {
        toast.error('Failed to create template');
      }
    });
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
            Create a new email template with dynamic variables
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Content</CardTitle>
                <CardDescription>
                  Define your email template structure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    placeholder="Welcome Email"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Welcome to our platform!"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Template Content
                    <span className="text-muted-foreground text-sm ml-2">
                      Use {'{{variable}}'} for dynamic content
                    </span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Hello {{name}}, welcome to our platform! ..."
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Variables</CardTitle>
                <CardDescription>
                  Define variables for dynamic content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.variables.map((variable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="variable_name"
                      value={variable}
                      onChange={(e) => handleVariableChange(index, e.target.value)}
                    />
                    {formData.variables.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleRemoveVariable(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddVariable}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Template</CardTitle>
                <CardDescription>
                  Save your new template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Variables:</span>
                    <span>{formData.variables.filter(v => v.trim() !== '').length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Content Length:</span>
                    <span>{formData.content.length} characters</span>
                  </div>
                  <Button type="submit" className="w-full" disabled={isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {isPending ? 'Creating...' : 'Create Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}