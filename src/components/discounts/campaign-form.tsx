// components/discounts/campaign-form.tsx
'use client';

import { useState } from 'react';
import { Campaign, CreateCampaignDto } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getCampaignValidationErrors } from '@/lib/validations/campaign.validation';

// Form state interface with Date objects for UI handling
interface CampaignFormState {
  name: string;
  description?: string;
  type?: 'promotional' | 'affiliate' | 'referral' | 'loyalty' | 'winback';
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  discountIds?: string[];
  channels?: string[];
  targetAudience?: string[];
  targetCountries?: string[];
  budget?: number;
  revenueGoal?: number;
  conversionGoal?: number;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

interface Discount {
  id: string;
  code: string;
  description?: string;
}

interface CampaignFormProps {
  campaign?: Campaign;
  discounts: Discount[];
  onSubmit: (data: CreateCampaignDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
  formErrors?: Record<string, string>;
  isRefreshing?: boolean;
}

export function CampaignForm({
  campaign,
  discounts,
  onSubmit,
  onCancel,
  isLoading = false,
  mode,
  formErrors = {},
  isRefreshing = false
}: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormState>({
    name: campaign?.name || '',
    description: campaign?.description || '',
    type: campaign?.type || 'promotional',
    startDate: campaign?.startDate ? (typeof campaign.startDate === 'string' ? new Date(campaign.startDate) : campaign.startDate) : new Date(),
    endDate: campaign?.endDate ? (typeof campaign.endDate === 'string' ? new Date(campaign.endDate) : campaign.endDate) : undefined,
    isActive: campaign?.isActive ?? true,
    discountIds: campaign?.discountIds || [],
    channels: campaign?.channels || [],
    targetAudience: campaign?.targetAudience || [],
    budget: campaign?.budget,
    revenueGoal: campaign?.revenueGoal,
    conversionGoal: campaign?.conversionGoal,
    utmSource: campaign?.utmSource || ''
  });

  const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>(formData.discountIds || []);
  const [newChannel, setNewChannel] = useState('');
  const [realTimeErrors, setRealTimeErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});

  // Real-time validation
  const validateField = (name: string, value: any) => {
    const testData = { ...formData, [name]: value };
    const validationErrors = getCampaignValidationErrors(testData);
    
    setRealTimeErrors(prev => {
      const newErrors = { ...prev };
      if (validationErrors[name]) {
        newErrors[name] = validationErrors[name];
      } else {
        delete newErrors[name];
      }
      return newErrors;
    });
  };

  // Merge form errors with real-time errors and server errors
  const allErrors = { ...formErrors, ...realTimeErrors, ...serverErrors };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const submitData = {
      ...formData,
      discountIds: selectedDiscounts,
      // Convert dates to ISO strings for backend
      startDate: formData.startDate ? formData.startDate.toISOString() : new Date().toISOString(),
      endDate: formData.endDate ? formData.endDate.toISOString() : undefined
    };
    
    // Final validation
    const validationErrors = getCampaignValidationErrors(submitData);
    if (Object.keys(validationErrors).length > 0) {
      setRealTimeErrors(validationErrors);
      return;
    }
    
    // Clear any previous server errors
    setServerErrors({});
    
    try {
      await onSubmit(submitData as CreateCampaignDto);
    } catch (error: any) {
      // Handle server validation errors
      if (error?.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        if (Array.isArray(backendErrors)) {
          // Convert array of error messages to field-specific errors
          const errorMap: Record<string, string> = {};
          backendErrors.forEach((err: any) => {
            if (typeof err === 'string') {
              errorMap['general'] = err;
            } else if (err.field && err.message) {
              errorMap[err.field] = err.message;
            }
          });
          setServerErrors(errorMap);
        } else if (typeof backendErrors === 'object') {
          setServerErrors(backendErrors);
        }
      }
      // Don't re-throw, let parent handle the error display
    }
  };

  const addChannel = () => {
    if (newChannel && !formData.channels?.includes(newChannel)) {
      setFormData(prev => ({
        ...prev,
        channels: [...(prev.channels || []), newChannel]
      }));
      setNewChannel('');
    }
  };

  const removeChannel = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels?.filter(c => c !== channel)
    }));
  };

  const toggleDiscount = (discountId: string) => {
    setSelectedDiscounts(prev =>
      prev.includes(discountId)
        ? prev.filter(id => id !== discountId)
        : [...prev, discountId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Display */}
      {allErrors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive font-medium">
            {allErrors.general}
          </p>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Basic information about your marketing campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value;
                setFormData(prev => ({ ...prev, name: value }));
                validateField('name', value);
              }}
              placeholder="Summer Sale 2024"
              required
              className={allErrors.name ? 'border-destructive' : ''}
            />
            {allErrors.name && (
              <p className="text-sm text-destructive">{allErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose and goals of this campaign..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => {
                  setFormData(prev => ({ ...prev, type: value }));
                  validateField('type', value);
                }}
              >
                <SelectTrigger className={allErrors.type ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select campaign type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promotional">Promotional</SelectItem>
                  <SelectItem value="affiliate">Affiliate</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="loyalty">Loyalty</SelectItem>
                  <SelectItem value="winback">Winback</SelectItem>
                </SelectContent>
              </Select>
              {allErrors.type && (
                <p className="text-sm text-destructive">{allErrors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="utmSource">UTM Source</Label>
              <Input
                id="utmSource"
                value={formData.utmSource}
                onChange={(e) => setFormData(prev => ({ ...prev, utmSource: e.target.value }))}
                placeholder="summer_sale_2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule & Budget</CardTitle>
          <CardDescription>
            Set campaign duration and financial targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(formData.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                placeholder="50000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="revenueGoal">Revenue Goal</Label>
              <Input
                id="revenueGoal"
                type="number"
                value={formData.revenueGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, revenueGoal: parseFloat(e.target.value) }))}
                placeholder="200000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="conversionGoal">Conversion Goal</Label>
              <Input
                id="conversionGoal"
                type="number"
                value={formData.conversionGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, conversionGoal: parseFloat(e.target.value) }))}
                placeholder="1000"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Discounts & Channels</CardTitle>
          <CardDescription>
            Select discounts and marketing channels for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Associated Discounts</Label>
            <div className="grid gap-2">
              {discounts.map((discount) => (
                <div key={discount.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`discount-${discount.id}`}
                    checked={selectedDiscounts.includes(discount.id)}
                    onChange={() => toggleDiscount(discount.id)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={`discount-${discount.id}`} className="text-sm">
                    {discount.code} - {discount.description}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Marketing Channels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.channels?.map((channel) => (
                <Badge key={channel} variant="secondary" className="flex items-center gap-1">
                  {channel}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeChannel(channel)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newChannel}
                onChange={(e) => setNewChannel(e.target.value)}
                placeholder="Add channel (e.g., email, social)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChannel())}
              />
              <Button type="button" onClick={addChannel} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label>Activate campaign immediately</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading || isRefreshing}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || isRefreshing}
          className="min-w-32"
        >
          {isLoading 
            ? (mode === 'create' ? 'Creating...' : 'Updating...') 
            : (mode === 'create' ? 'Create Campaign' : 'Update Campaign')
          }
        </Button>
      </div>
    </form>
  );
}