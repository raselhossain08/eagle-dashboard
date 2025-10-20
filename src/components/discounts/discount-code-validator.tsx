// components/discounts/discount-code-validator.tsx
'use client';

import { useState } from 'react';
import { ValidateDiscountDto, ValidationResult } from '@/types/discounts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
}

interface DiscountCodeValidatorProps {
  onValidate: (data: ValidateDiscountDto) => Promise<ValidationResult>;
  plans: Plan[];
  isLoading?: boolean;
}

export function DiscountCodeValidator({ 
  onValidate, 
  plans, 
  isLoading = false 
}: DiscountCodeValidatorProps) {
  const [formData, setFormData] = useState<ValidateDiscountDto>({
    code: '',
    orderAmount: 100,
    currency: 'USD',
    planId: '',
    productId: '',
    country: '',
    email: ''
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await onValidate(formData);
    setValidationResult(result);
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;
    
    if (validationResult.isValid) {
      return <CheckCircle className="h-8 w-8 text-green-500" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getValidationMessage = () => {
    if (!validationResult) return null;
    
    if (validationResult.isValid) {
      return (
        <div className="text-green-600 font-medium">
          Code is valid! Discount applied: ${validationResult.discountedAmount}
        </div>
      );
    } else {
      return (
        <div className="text-red-600 font-medium">
          {validationResult.error || 'Invalid discount code'}
        </div>
      );
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Validate Discount Code</CardTitle>
          <CardDescription>
            Test discount code validity and calculate final amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Discount Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                placeholder="Enter discount code"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderAmount">Order Amount *</Label>
                <Input
                  id="orderAmount"
                  type="number"
                  value={formData.orderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderAmount: parseFloat(e.target.value) }))}
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

            <div className="space-y-2">
              <Label htmlFor="plan">Plan (Optional)</Label>
              <Select
                value={formData.planId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country (Optional)</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="US"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Validating...' : 'Validate Code'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation Result</CardTitle>
          <CardDescription>
            Real-time code validation and discount calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationResult ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                {getValidationIcon()}
                {getValidationMessage()}
              </div>

              {validationResult.isValid && validationResult.discount && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Original Amount:</span>
                      <div>${formData.orderAmount}</div>
                    </div>
                    <div>
                      <span className="font-medium">Final Amount:</span>
                      <div className="text-green-600 font-bold">
                        ${validationResult.discountedAmount}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Discount Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <Badge variant="outline">
                          {validationResult.discount.type}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Value:</span>
                        <span>
                          {validationResult.discount.type === 'percentage' 
                            ? `${validationResult.discount.value}%`
                            : `$${validationResult.discount.value}`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Redemptions:</span>
                        <span>
                          {validationResult.discount.timesRedeemed} / {validationResult.discount.maxRedemptions}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a discount code and click "Validate Code" to see results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}