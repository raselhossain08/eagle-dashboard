// lib/api/discounts.service.ts
import { Discount, CreateDiscountDto, ValidateDiscountDto, ValidationResult, DiscountsOverviewData } from '@/types/discounts';

export class DiscountsService {
  private baseUrl = '/api/discounts';

  // Mock implementations - replace with actual API calls
  async getDiscounts(params: any): Promise<{ data: Discount[]; pagination: any }> {
    // Mock data
    return {
      data: [],
      pagination: { pageIndex: 0, pageSize: 10, totalCount: 0 }
    };
  }

  async getDiscountById(id: string): Promise<Discount> {
    // Mock implementation
    throw new Error('Not implemented');
  }

  async createDiscount(data: CreateDiscountDto): Promise<Discount> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create discount');
    }
    
    return response.json();
  }

  async updateDiscount(id: string, data: Partial<CreateDiscountDto>): Promise<Discount> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update discount');
    }
    
    return response.json();
  }

  async deactivateDiscount(id: string): Promise<Discount> {
    return this.updateDiscount(id, { isActive: false });
  }

  async validateDiscount(data: ValidateDiscountDto): Promise<ValidationResult> {
    const response = await fetch(`${this.baseUrl}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to validate discount');
    }
    
    return response.json();
  }

  async getDiscountsOverview(): Promise<DiscountsOverviewData> {
    const response = await fetch(`${this.baseUrl}/overview`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch overview data');
    }
    
    return response.json();
  }
}

export const discountsService = new DiscountsService();