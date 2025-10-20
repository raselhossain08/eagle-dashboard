// components/billing/plan-pricing-calculator.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Users, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PlanPricingCalculatorProps {
  basePrice: number;
  pricePerSeat: number;
  quantity: number;
  interval: string;
  intervalCount: number;
  currency: string;
  discount?: { type: 'percentage' | 'fixed'; value: number };
  tax?: { rate: number; amount: number };
}

export function PlanPricingCalculator({
  basePrice,
  pricePerSeat,
  quantity,
  interval,
  intervalCount,
  currency,
  discount,
  tax
}: PlanPricingCalculatorProps) {
  const getIntervalText = () => {
    if (interval === 'one_time') return 'one time';
    if (intervalCount === 1) return `per ${interval}`;
    return `every ${intervalCount} ${interval}s`;
  };

  const calculateSubtotal = () => {
    const additionalSeats = Math.max(0, quantity - 1);
    return basePrice + (additionalSeats * pricePerSeat);
  };

  const calculateDiscount = (subtotal: number) => {
    if (!discount) return 0;
    
    if (discount.type === 'percentage') {
      return subtotal * (discount.value / 100);
    } else {
      return discount.value;
    }
  };

  const calculateTax = (subtotal: number, discountAmount: number) => {
    if (!tax) return 0;
    
    const taxableAmount = subtotal - discountAmount;
    return taxableAmount * (tax.rate / 100);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = calculateDiscount(subtotal);
  const taxAmount = calculateTax(subtotal, discountAmount);
  const total = subtotal - discountAmount + taxAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Calculator className="h-4 w-4 mr-2" />
          Pricing Calculator
        </CardTitle>
        <CardDescription>
          Estimate costs for different seat quantities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quantity Input */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Number of Seats</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              readOnly
              className="pl-10"
            />
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Base price ({getIntervalText()})</span>
            <span>{formatCurrency(basePrice, currency)}</span>
          </div>

          {quantity > 1 && pricePerSeat > 0 && (
            <div className="flex justify-between text-sm">
              <span>Additional seats ({quantity - 1} × {formatCurrency(pricePerSeat, currency)})</span>
              <span>{formatCurrency((quantity - 1) * pricePerSeat, currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-medium border-t pt-2">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>

          {discount && discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>
                Discount {discount.type === 'percentage' ? `(${discount.value}%)` : ''}
              </span>
              <span>-{formatCurrency(discountAmount, currency)}</span>
            </div>
          )}

          {tax && taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax ({tax.rate}%)</span>
              <span>{formatCurrency(taxAmount, currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total {getIntervalText()}</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>

        {/* Summary Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1" />
            Base: {formatCurrency(basePrice, currency)}
          </Badge>
          {pricePerSeat > 0 && (
            <Badge variant="outline" className="flex items-center">
              <Users className="h-3 w-3 mr-1" />
              Per Seat: {formatCurrency(pricePerSeat, currency)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}