// components/discounts/discount-code-validator.tsx
'use client';

import { useState } from 'react';
import { useDiscountValidation } from '@/hooks/use-discount-performance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { DiscountValidationResult } from '@/lib/api/discount-performance.service';

interface DiscountCodeValidatorProps {
  discountCode?: string;
  className?: string;
}

export function DiscountCodeValidator({ discountCode = '', className }: DiscountCodeValidatorProps) {
  const [validationData, setValidationData] = useState({
    code: discountCode,
    customerEmail: '',
    orderAmount: 0,
    customerCountry: '',
    isNewCustomer: false,
  });

  const [validationResult, setValidationResult] = useState<DiscountValidationResult | null>(null);
  
  const validation = useDiscountValidation();

  const handleValidate = async () => {
    if (!validationData.code.trim()) {
      return;
    }

    try {
      const result = await validation.mutateAsync({
        code: validationData.code,
        customerEmail: validationData.customerEmail || undefined,
        orderAmount: validationData.orderAmount > 0 ? validationData.orderAmount * 100 : undefined, // Convert to cents
        customerCountry: validationData.customerCountry || undefined,
        isNewCustomer: validationData.isNewCustomer,
      });
      
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidationResult({
        isValid: false,
        discountedAmount: 0,
        error: 'Failed to validate discount code',
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setValidationData(prev => ({ ...prev, [field]: value }));
    // Clear previous validation result when inputs change
    if (validationResult) {
      setValidationResult(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {validation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : validationResult?.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : validationResult && !validationResult.isValid ? (
            <XCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
          )}
          Discount Code Validator
        </CardTitle>
        <CardDescription>
          Test discount code validity and calculate discount amounts in real-time
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Discount Code*</Label>
            <Input
              id="code"
              value={validationData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              placeholder="Enter discount code"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderAmount">Order Amount ($)</Label>
            <Input
              id="orderAmount"
              type="number"
              step="0.01"
              min="0"
              value={validationData.orderAmount || ''}
              onChange={(e) => handleInputChange('orderAmount', parseFloat(e.target.value) || 0)}
              placeholder="100.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              id="customerEmail"
              type="email"
              value={validationData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCountry">Customer Country</Label>
            <Input
              id="customerCountry"
              value={validationData.customerCountry}
              onChange={(e) => handleInputChange('customerCountry', e.target.value)}
              placeholder="US, CA, UK, etc."
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isNewCustomer"
            checked={validationData.isNewCustomer}
            onChange={(e) => handleInputChange('isNewCustomer', e.target.checked)}
            className="h-4 w-4"
          />
          <Label htmlFor="isNewCustomer">New Customer</Label>
        </div>

        <Button 
          onClick={handleValidate} 
          disabled={!validationData.code.trim() || validation.isPending}
          className="w-full"
        >
          {validation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : (
            'Validate Discount Code'
          )}
        </Button>

        {validationResult && (
          <div className="space-y-3">
            <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {validationResult.isValid ? (
                  <div className="space-y-2">
                    <p className="font-medium text-green-800">
                      ✅ Discount code is valid!
                    </p>
                    {validationResult.discountedAmount > 0 && (
                      <div className="space-y-1 text-sm">
                        <p>Discount Amount: <span className="font-medium">${(validationResult.discountedAmount / 100).toFixed(2)}</span></p>
                        {validationData.orderAmount > 0 && (
                          <p>
                            Final Amount: <span className="font-medium">
                              ${((validationData.orderAmount * 100 - validationResult.discountedAmount) / 100).toFixed(2)}
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                    {validationResult.discount && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        <Badge variant="outline">
                          {validationResult.discount.type === 'percentage' 
                            ? `${validationResult.discount.value}% off`
                            : `$${(validationResult.discount.value / 100).toFixed(2)} off`
                          }
                        </Badge>
                        <Badge variant="outline">
                          {validationResult.discount.duration}
                        </Badge>
                        {validationResult.discount.newCustomersOnly && (
                          <Badge variant="outline">New Customers Only</Badge>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-medium text-red-800">
                    ❌ {validationResult.error}
                  </p>
                )}
              </AlertDescription>
            </Alert>

            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium text-yellow-800">Warnings:</p>
                    {validationResult.warnings.map((warning, index) => (
                      <p key={index} className="text-sm text-yellow-700">
                        • {warning}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validationResult.recommendations && validationResult.recommendations.length > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium text-blue-800">Recommendations:</p>
                    {validationResult.recommendations.map((rec, index) => (
                      <p key={index} className="text-sm text-blue-700">
                        • {rec}
                      </p>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}