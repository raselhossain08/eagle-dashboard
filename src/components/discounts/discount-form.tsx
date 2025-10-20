// components/discounts/discount-form.tsx
'use client';

import { useState } from 'react';
import { Discount, CreateDiscountDto } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
}

interface Campaign {
  id: string;
  name: string;
}

interface DiscountFormProps {
  discount?: Discount;
  plans: Plan[];
  campaigns: Campaign[];
  onSubmit: (data: CreateDiscountDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function DiscountForm({
  discount,
  plans,
  campaigns,
  onSubmit,
  onCancel,
  isLoading = false,
  mode
}: DiscountFormProps) {
  const [formData, setFormData] = useState<Partial<CreateDiscountDto>>({
    code: discount?.code || '',
    description: discount?.description || '',
    type: discount?.type || 'percentage',
    value: discount?.value || 0,
    currency: discount?.currency || 'USD',
    duration: discount?.duration || 'once',
    durationInMonths: discount?.durationInMonths,
    applicablePlans: discount?.applicablePlans || [],
    applicableProducts: discount?.applicableProducts || [],
    maxRedemptions: discount?.maxRedemptions || 100,
    isActive: discount?.isActive ?? true,
    validFrom: discount?.validFrom,
    validUntil: discount?.validUntil,
    newCustomersOnly: discount?.newCustomersOnly || false,
    eligibleCountries: discount?.eligibleCountries || [],
    eligibleEmailDomains: discount?.eligibleEmailDomains || [],
    minAmount: discount?.minAmount || 0,
    maxAmount: discount?.maxAmount,
    isStackable: discount?.isStackable || false,
    priority: discount?.priority || 1,
    maxUsesPerCustomer: discount?.maxUsesPerCustomer || 1,
    campaignId: discount?.campaignId
  });

  const [newCountry, setNewCountry] = useState('');
  const [newDomain, setNewDomain] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as CreateDiscountDto);
  };

  const addCountry = () => {
    if (newCountry && !formData.eligibleCountries?.includes(newCountry)) {
      setFormData(prev => ({
        ...prev,
        eligibleCountries: [...(prev.eligibleCountries || []), newCountry]
      }));
      setNewCountry('');
    }
  };

  const removeCountry = (country: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleCountries: prev.eligibleCountries?.filter(c => c !== country)
    }));
  };

  const addDomain = () => {
    if (newDomain && !formData.eligibleEmailDomains?.includes(newDomain)) {
      setFormData(prev => ({
        ...prev,
        eligibleEmailDomains: [...(prev.eligibleEmailDomains || []), newDomain]
      }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData(prev => ({
      ...prev,
      eligibleEmailDomains: prev.eligibleEmailDomains?.filter(d => d !== domain)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Configure the core discount settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="SUMMER25"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Discount Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  <SelectItem value="free_trial">Free Trial</SelectItem>
                  <SelectItem value="first_period">First Period</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the purpose of this discount code..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                {formData.type === 'percentage' ? 'Percentage Value *' : 'Fixed Amount *'}
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Targeting & Restrictions</CardTitle>
          <CardDescription>
            Define who can use this discount and when
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAmount">Minimum Order Amount</Label>
              <Input
                id="minAmount"
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minAmount: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAmount">Maximum Discount Amount</Label>
              <Input
                id="maxAmount"
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxAmount: parseFloat(e.target.value) }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Eligible Countries</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.eligibleCountries?.map((country) => (
                <Badge key={country} variant="secondary" className="flex items-center gap-1">
                  {country}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeCountry(country)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Add country code (e.g., US)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCountry())}
              />
              <Button type="button" onClick={addCountry} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.newCustomersOnly}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newCustomersOnly: checked }))}
            />
            <Label>New customers only</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.isStackable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isStackable: checked }))}
            />
            <Label>Stackable with other discounts</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : mode === 'create' ? 'Create Discount' : 'Update Discount'}
        </Button>
      </div>
    </form>
  );
}