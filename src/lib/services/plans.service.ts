// lib/services/plans.service.ts
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams, PlanPerformanceData, DateRange, PaginationState } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

export class PlansService {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

  private getAuthHeaders() {
    const token = AuthCookieService.getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Normalize plan data to ensure all required fields are present
  private normalizePlan(plan: any): Plan {
    return {
      ...plan,
      features: plan.features || [],
      price: plan.price || 0,
      currency: plan.currency || 'USD',
      interval: plan.interval || 'month',
      intervalCount: plan.intervalCount || 1,
      trialPeriodDays: plan.trialPeriodDays || 0,
      isActive: plan.isActive !== undefined ? plan.isActive : true,
      isVisible: plan.isVisible !== undefined ? plan.isVisible : false,
      baseSeats: plan.baseSeats || 1,
      pricePerSeat: plan.pricePerSeat || 0,
      sortOrder: plan.sortOrder || 0,
    };
  }

  async getPlans(params: PlansQueryParams = {}): Promise<{ data: Plan[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('limit', params.pageSize.toString()); // Backend uses 'limit'
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

    const response = await fetch(`${this.baseURL}/billing/plans?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plans: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    
    // Transform backend response to match frontend expectations
    if (result.plans) {
      return {
        data: result.plans.map((plan: any) => this.normalizePlan(plan)),
        pagination: {
          page: result.page,
          pageSize: params.pageSize || 10,
          total: result.total,
          totalPages: result.totalPages
        }
      };
    }
    
    // Normalize data array if it exists
    if (result.data) {
      result.data = result.data.map((plan: any) => this.normalizePlan(plan));
    }
    
    return result;
  }

  async getPlanById(id: string): Promise<Plan> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plan: ${response.status} ${errorText}`);
    }

    const plan = await response.json();
    return this.normalizePlan(plan);
  }

  async createPlan(data: CreatePlanDto): Promise<Plan> {
    // Ensure features is always an array
    const normalizedData = {
      ...data,
      features: data.features || [],
    };

    const response = await fetch(`${this.baseURL}/billing/plans`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(normalizedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create plan: ${response.status} ${errorText}`);
    }

    const plan = await response.json();
    return this.normalizePlan(plan);
  }

  async updatePlan(id: string, data: UpdatePlanDto): Promise<Plan> {
    // Ensure features is always an array if provided
    const normalizedData = {
      ...data,
      ...(data.features && { features: data.features || [] }),
    };

    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'PATCH', // Backend uses PATCH not PUT
      headers: this.getAuthHeaders(),
      body: JSON.stringify(normalizedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update plan: ${response.status} ${errorText}`);
    }

    const plan = await response.json();
    return this.normalizePlan(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/billing/plans/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete plan: ${response.status} ${errorText}`);
    }
  }

  async getPlanPerformance(dateRange: DateRange): Promise<PlanPerformanceData[]> {
    const response = await fetch(`${this.baseURL}/billing/plans/performance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dateRange),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plan performance: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async togglePlanStatus(id: string, isActive: boolean): Promise<Plan> {
    return this.updatePlan(id, { isActive });
  }

  async togglePlanVisibility(id: string, isVisible: boolean): Promise<Plan> {
    return this.updatePlan(id, { isVisible });
  }
}