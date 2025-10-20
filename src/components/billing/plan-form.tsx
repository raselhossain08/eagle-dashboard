// components/billing/plan-form.tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, DollarSign, Calendar, Users } from 'lucide-react';
import { Plan, CreatePlanDto, UpdatePlanDto } from '@/types/billing';

const planFormSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  interval: z.enum(['month', 'year', 'week', 'day', 'one_time']),
  intervalCount: z.number().min(1, 'Interval count must be at least 1'),
  trialPeriodDays: z.number().min(0, 'Trial days must be positive'),
  features: z.array(z.string()),
  sortOrder: z.number().min(0, 'Sort order must be positive'),
  isActive: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  baseSeats: z.number().min(1, 'Base seats must be at least 1'),
  pricePerSeat: z.number().min(0, 'Price per seat must be positive'),
});

type PlanFormData = z.infer<typeof planFormSchema>;

interface PlanFormProps {
  plan?: Plan;
  onSubmit: (data: CreatePlanDto | UpdatePlanDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: 'create' | 'edit';
}

export function PlanForm({ plan, onSubmit, onCancel, isLoading, mode }: PlanFormProps) {
  const [featureInput, setFeatureInput] = React.useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: plan ? {
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.intervalCount,
      trialPeriodDays: plan.trialPeriodDays,
      features: plan.features,
      sortOrder: plan.sortOrder,
      isActive: plan.isActive,
      isVisible: plan.isVisible,
      baseSeats: plan.baseSeats,
      pricePerSeat: plan.pricePerSeat,
    } : {
      interval: 'month',
      intervalCount: 1,
      trialPeriodDays: 0,
      features: [],
      sortOrder: 0,
      isActive: true,
      isVisible: true,
      baseSeats: 1,
      pricePerSeat: 0,
      currency: 'USD',
    },
  });

  const features = watch('features');
  const baseSeats = watch('baseSeats');
  const pricePerSeat = watch('pricePerSeat');
  const interval = watch('interval');
  const intervalCount = watch('intervalCount');

  const addFeature = () => {
    if (featureInput.trim()) {
      setValue('features', [...(features || []), featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    setValue('features', features.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: PlanFormData) => {
    await onSubmit(data);
  };

  const getIntervalText = () => {
    if (interval === 'one_time') return 'One Time';
    if (intervalCount === 1) return `Per ${interval}`;
    return `Every ${intervalCount} ${interval}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Create New Plan' : 'Edit Plan'}
        </CardTitle>
        <CardDescription>
          {mode === 'create' 
            ? 'Create a new billing plan for your customers' 
            : 'Update the plan details and pricing'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Plan Name *
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="e.g., Pro Plan"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="sortOrder" className="text-sm font-medium">
                Sort Order
              </label>
              <Input
                id="sortOrder"
                type="number"
                {...register('sortOrder', { valueAsNumber: true })}
              />
              {errors.sortOrder && (
                <p className="text-sm text-red-600">{errors.sortOrder.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe what this plan includes..."
              rows={3}
            />
          </div>

          {/* Pricing & Billing */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                Base Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="pl-10"
                  {...register('price', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="text-sm font-medium">
                Currency
              </label>
              <Input
                id="currency"
                {...register('currency')}
                placeholder="USD"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="interval" className="text-sm font-medium">
                Billing Interval
              </label>
              <select
                id="interval"
                {...register('interval')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
                <option value="week">Weekly</option>
                <option value="day">Daily</option>
                <option value="one_time">One Time</option>
              </select>
            </div>

            {interval !== 'one_time' && (
              <div className="space-y-2">
                <label htmlFor="intervalCount" className="text-sm font-medium">
                  Interval Count
                </label>
                <Input
                  id="intervalCount"
                  type="number"
                  {...register('intervalCount', { valueAsNumber: true })}
                  placeholder="1"
                />
                {errors.intervalCount && (
                  <p className="text-sm text-red-600">{errors.intervalCount.message}</p>
                )}
              </div>
            )}
          </div>

          {interval !== 'one_time' && (
            <div className="space-y-2">
              <label htmlFor="trialPeriodDays" className="text-sm font-medium">
                Trial Period (Days)
              </label>
              <Input
                id="trialPeriodDays"
                type="number"
                {...register('trialPeriodDays', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.trialPeriodDays && (
                <p className="text-sm text-red-600">{errors.trialPeriodDays.message}</p>
              )}
            </div>
          )}

          {/* Seating */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="baseSeats" className="text-sm font-medium">
                Base Seats
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="baseSeats"
                  type="number"
                  className="pl-10"
                  {...register('baseSeats', { valueAsNumber: true })}
                  placeholder="1"
                />
              </div>
              {errors.baseSeats && (
                <p className="text-sm text-red-600">{errors.baseSeats.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="pricePerSeat" className="text-sm font-medium">
                Price Per Additional Seat
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pricePerSeat"
                  type="number"
                  step="0.01"
                  className="pl-10"
                  {...register('pricePerSeat', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
              {errors.pricePerSeat && (
                <p className="text-sm text-red-600">{errors.pricePerSeat.message}</p>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Features</label>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {features?.map((feature, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active
                </label>
                <p className="text-sm text-muted-foreground">
                  Whether this plan is active and can be subscribed to
                </p>
              </div>
              <Switch
                id="isActive"
                {...register('isActive')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="isVisible" className="text-sm font-medium">
                  Visible
                </label>
                <p className="text-sm text-muted-foreground">
                  Whether this plan is visible to customers
                </p>
              </div>
              <Switch
                id="isVisible"
                {...register('isVisible')}
              />
            </div>
          </div>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Plan Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{watch('name') || 'Plan Name'}</span>
                  <span className="font-bold">
                    ${watch('price') || 0} {getIntervalText()}
                  </span>
                </div>
                {watch('description') && (
                  <p className="text-sm text-muted-foreground">
                    {watch('description')}
                  </p>
                )}
                {pricePerSeat > 0 && (
                  <p className="text-sm text-muted-foreground">
                    +${pricePerSeat} per additional seat (includes {baseSeats} seats)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : mode === 'create' ? 'Create Plan' : 'Update Plan'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}