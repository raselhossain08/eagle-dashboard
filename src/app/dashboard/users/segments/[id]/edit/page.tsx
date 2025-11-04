// app/dashboard/users/segments/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Users, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSegment, useUpdateSegment } from '@/hooks/useSegments';
import { toast } from 'sonner';
import { UpdateUserSegmentDto } from '@/types/segments';

const colorOptions = [
  { value: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Green', preview: 'bg-green-500' },
  { value: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Yellow', preview: 'bg-yellow-500' },
  { value: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Red', preview: 'bg-red-500' },
];

const criteriaExamples = [
  { label: 'Active Users', value: 'status:active' },
  { label: 'Premium Subscribers', value: 'status:active AND subscription:tier_premium' },
  { label: 'Recent Signups', value: 'createdAt:>30d' },
  { label: 'Inactive Users', value: 'lastLogin:<90d' },
  { label: 'Verified KYC', value: 'kycStatus:verified' },
  { label: 'Pending Verification', value: 'kycStatus:pending' },
];

export default function EditSegmentPage() {
  const params = useParams();
  const router = useRouter();
  const segmentId = params.id as string;
  
  const { data: segment, isLoading, error } = useSegment(segmentId);
  const updateSegment = useUpdateSegment();
  
  const [formData, setFormData] = useState<UpdateUserSegmentDto>({
    name: '',
    description: '',
    criteria: '',
    color: colorOptions[0].value,
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  // Update form data when segment is loaded
  useEffect(() => {
    if (segment) {
      setFormData({
        name: segment.name,
        description: segment.description,
        criteria: segment.criteria,
        color: segment.color,
        tags: segment.tags || [],
      });
    }
  }, [segment]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Segment name is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.criteria?.trim()) {
      newErrors.criteria = 'Criteria is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateSegment.mutateAsync({ id: segmentId, data: formData });
      toast.success('Segment updated successfully');
      router.push(`/dashboard/users/segments/${segmentId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update segment');
    }
  };

  const handleInputChange = (field: keyof UpdateUserSegmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      handleInputChange('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const applyCriteriaExample = (criteria: string) => {
    handleInputChange('criteria', criteria);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/users/segments/${segmentId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Segment
            </Link>
          </Button>
          <div>
            <div className="h-8 bg-muted rounded animate-pulse w-64 mb-2" />
            <div className="h-4 bg-muted rounded animate-pulse w-96" />
          </div>
        </div>
        <div className="max-w-2xl">
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/users/segments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Segments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Segment Not Found</h1>
            <p className="text-muted-foreground">
              The requested segment could not be found or has been deleted
            </p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load segment details'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/users/segments/${segmentId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Segment
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Segment</h1>
          <p className="text-muted-foreground">
            Update the segment details and criteria
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Update the basic details for your user segment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Segment Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Premium Users"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="id">Segment ID</Label>
                <Input
                  id="id"
                  value={segment.id}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Segment ID cannot be changed after creation
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this segment represents..."
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                      formData.color === color.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-accent'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                    <span className="text-sm">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segment Criteria</CardTitle>
            <CardDescription>
              Update the conditions that users must meet to be included in this segment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="criteria">Criteria Expression *</Label>
              <Textarea
                id="criteria"
                value={formData.criteria || ''}
                onChange={(e) => handleInputChange('criteria', e.target.value)}
                placeholder="e.g., status:active AND subscription:tier_premium"
                rows={3}
                className={errors.criteria ? 'border-red-500' : ''}
              />
              {errors.criteria && (
                <p className="text-sm text-red-500">{errors.criteria}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use format: field:value AND/OR field:value. Supported operators: AND, OR, &gt;, &lt;, &gt;=, &lt;=
              </p>
            </div>

            <div className="space-y-2">
              <Label>Quick Examples</Label>
              <div className="grid gap-2 md:grid-cols-2">
                {criteriaExamples.map((example) => (
                  <button
                    key={example.value}
                    type="button"
                    onClick={() => applyCriteriaExample(example.value)}
                    className="flex items-center justify-between p-2 text-left bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <span className="text-sm font-medium">{example.label}</span>
                    <code className="text-xs bg-background px-2 py-1 rounded">
                      {example.value}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Changing the criteria will recalculate the user count. This may affect any automation 
                or reports that depend on this segment.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags (Optional)</CardTitle>
            <CardDescription>
              Update tags to help organize and categorize your segments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>

            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            type="submit" 
            disabled={updateSegment.isPending}
            className="min-w-[120px]"
          >
            {updateSegment.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Segment
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/users/segments/${segmentId}`}>
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  );
}