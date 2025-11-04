// lib/validators/discount-validator.ts
import { CreateDiscountDto } from '@/types/discounts';

export interface DiscountValidationResult {
  isValid: boolean;
  errors: {
    field: keyof CreateDiscountDto | 'general';
    message: string;
    severity: 'error' | 'warning';
  }[];
  warnings: {
    field: keyof CreateDiscountDto | 'general';
    message: string;
  }[];
}

export class DiscountValidator {
  static validate(data: Partial<CreateDiscountDto>): DiscountValidationResult {
    const errors: DiscountValidationResult['errors'] = [];
    const warnings: DiscountValidationResult['warnings'] = [];

    // Required field validation
    if (!data.code || data.code.trim() === '') {
      errors.push({
        field: 'code',
        message: 'Discount code is required',
        severity: 'error'
      });
    }

    if (!data.type) {
      errors.push({
        field: 'type',
        message: 'Discount type is required',
        severity: 'error'
      });
    }

    if (data.value === undefined || data.value === null) {
      errors.push({
        field: 'value',
        message: 'Discount value is required',
        severity: 'error'
      });
    }

    if (!data.currency || data.currency.trim() === '') {
      errors.push({
        field: 'currency',
        message: 'Currency is required',
        severity: 'error'
      });
    }

    if (!data.duration) {
      errors.push({
        field: 'duration',
        message: 'Duration is required',
        severity: 'error'
      });
    }

    // Code format validation
    if (data.code) {
      const codeRegex = /^[A-Z0-9_-]+$/;
      if (!codeRegex.test(data.code)) {
        errors.push({
          field: 'code',
          message: 'Code must contain only uppercase letters, numbers, underscores, and hyphens',
          severity: 'error'
        });
      }

      if (data.code.length < 3) {
        errors.push({
          field: 'code',
          message: 'Code must be at least 3 characters long',
          severity: 'error'
        });
      }

      if (data.code.length > 50) {
        errors.push({
          field: 'code',
          message: 'Code cannot exceed 50 characters',
          severity: 'error'
        });
      }
    }

    // Value validation based on type
    if (data.type && data.value !== undefined) {
      if (data.type === 'percentage') {
        if (data.value <= 0 || data.value > 100) {
          errors.push({
            field: 'value',
            message: 'Percentage discount must be between 0.01 and 100',
            severity: 'error'
          });
        }
      } else if (data.type === 'fixed_amount') {
        if (data.value <= 0) {
          errors.push({
            field: 'value',
            message: 'Fixed amount discount must be greater than 0',
            severity: 'error'
          });
        }
      }
    }

    // Max redemptions validation
    if (data.maxRedemptions !== undefined) {
      if (data.maxRedemptions < 1) {
        errors.push({
          field: 'maxRedemptions',
          message: 'Maximum redemptions must be at least 1',
          severity: 'error'
        });
      }

      if (data.maxRedemptions > 10000) {
        warnings.push({
          field: 'maxRedemptions',
          message: 'High redemption limits may impact performance'
        });
      }
    }

    // Max uses per customer validation
    if (data.maxUsesPerCustomer !== undefined) {
      if (data.maxUsesPerCustomer < 1) {
        errors.push({
          field: 'maxUsesPerCustomer',
          message: 'Max uses per customer must be at least 1',
          severity: 'error'
        });
      }
    }

    // Min amount validation
    if (data.minAmount !== undefined && data.minAmount < 0) {
      errors.push({
        field: 'minAmount',
        message: 'Minimum amount cannot be negative',
        severity: 'error'
      });
    }

    // Max amount validation
    if (data.maxAmount !== undefined) {
      if (data.maxAmount <= 0) {
        errors.push({
          field: 'maxAmount',
          message: 'Maximum amount must be greater than 0',
          severity: 'error'
        });
      }

      if (data.minAmount !== undefined && data.maxAmount <= data.minAmount) {
        errors.push({
          field: 'maxAmount',
          message: 'Maximum amount must be greater than minimum amount',
          severity: 'error'
        });
      }
    }

    // Date validation
    if (data.validFrom && data.validUntil) {
      const fromDate = new Date(data.validFrom);
      const untilDate = new Date(data.validUntil);
      
      if (fromDate >= untilDate) {
        errors.push({
          field: 'validUntil',
          message: 'End date must be after start date',
          severity: 'error'
        });
      }

      // Check if the discount is already expired
      if (untilDate < new Date()) {
        warnings.push({
          field: 'validUntil',
          message: 'This discount will be expired immediately'
        });
      }
    }

    // Priority validation
    if (data.priority !== undefined) {
      if (data.priority < 1 || data.priority > 10) {
        errors.push({
          field: 'priority',
          message: 'Priority must be between 1 and 10',
          severity: 'error'
        });
      }
    }

    // Business logic warnings
    if (data.type === 'percentage' && data.value && data.value > 50) {
      warnings.push({
        field: 'value',
        message: 'High percentage discounts may significantly impact revenue'
      });
    }

    if (data.type === 'fixed_amount' && data.value && data.value > 100) {
      warnings.push({
        field: 'value',
        message: 'High fixed amount discounts may significantly impact revenue'
      });
    }

    if (data.isStackable && data.priority && data.priority > 5) {
      warnings.push({
        field: 'isStackable',
        message: 'Stackable discounts with high priority may cause unexpected combinations'
      });
    }

    if (data.newCustomersOnly === false && (!data.applicablePlans || data.applicablePlans.length === 0)) {
      warnings.push({
        field: 'applicablePlans',
        message: 'Consider limiting discount to specific plans for existing customers'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Quick validation for required fields only
   */
  static validateRequired(data: Partial<CreateDiscountDto>): boolean {
    return !!(
      data.code &&
      data.type &&
      data.value !== undefined &&
      data.currency &&
      data.duration
    );
  }

  /**
   * Validate specific field
   */
  static validateField(field: keyof CreateDiscountDto, value: any, fullData?: Partial<CreateDiscountDto>): DiscountValidationResult {
    const tempData: Partial<CreateDiscountDto> = fullData ? { ...fullData } : {};
    (tempData as any)[field] = value;
    
    const result = this.validate(tempData);
    
    // Filter results to only include errors/warnings for the specific field
    return {
      isValid: result.errors.filter(e => e.field === field).length === 0,
      errors: result.errors.filter(e => e.field === field),
      warnings: result.warnings.filter(w => w.field === field)
    };
  }

  /**
   * Get suggestions based on current data
   */
  static getSuggestions(data: Partial<CreateDiscountDto>): string[] {
    const suggestions: string[] = [];

    if (data.type === 'percentage' && !data.maxAmount) {
      suggestions.push('Consider setting a maximum discount amount to control costs');
    }

    if (data.type === 'fixed_amount' && !data.minAmount) {
      suggestions.push('Consider setting a minimum order amount for fixed discounts');
    }

    if (!data.validUntil) {
      suggestions.push('Set an expiration date to create urgency');
    }

    if (!data.maxUsesPerCustomer || data.maxUsesPerCustomer > 1) {
      suggestions.push('Limit uses per customer to prevent abuse');
    }

    if (!data.campaignId) {
      suggestions.push('Associate with a campaign for better tracking');
    }

    return suggestions;
  }
}