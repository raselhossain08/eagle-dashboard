// lib/api/plans.service.ts
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams, PlanPerformanceData, DateRange } from '@/types/billing';

export class PlansService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;

  constructor(private client: ApiClient) {}

  async getPlans(params: PlansQueryParams = {}): Promise<{ data: Plan[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/billing/plans?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }

    return response.json();
  }

  async getPlanById(id: string): Promise<Plan> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan');
    }

    return response.json();
  }

  async createPlan(data: CreatePlanDto): Promise<Plan> {
    const response = await fetch(`${this.baseURL}/billing/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create plan');
    }

    return response.json();
  }

  async updatePlan(id: string, data: UpdatePlanDto): Promise<Plan> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update plan');
    }

    return response.json();
  }

  async deletePlan(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete plan');
    }
  }

  async getPlanPerformance(dateRange: DateRange): Promise<PlanPerformanceData[]> {
    const response = await fetch(`${this.baseURL}/billing/plans/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch plan performance');
    }

    return response.json();
  }
}