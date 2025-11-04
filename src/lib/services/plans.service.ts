// lib/services/plans.service.ts
import { Plan, CreatePlanDto, UpdatePlanDto, PlansQueryParams, PlanPerformanceData, DateRange, PaginationState } from '@/types/billing';
import { AuthCookieService } from '@/lib/auth/cookie-service';

// Utility function to safely convert ObjectId or any value to string
const safeIdToString = (id: any): string => {
  if (!id) return '';
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'object' && id !== null) {
    // Handle MongoDB Buffer ObjectId
    if (id.buffer && id.buffer.data && Array.isArray(id.buffer.data)) {
      const hexString = id.buffer.data.map((byte: number) => 
        byte.toString(16).padStart(2, '0')
      ).join('');
      return hexString;
    }
    
    // Handle standard MongoDB ObjectId cases
    if (id.$oid) return id.$oid;
    if (id._id) return safeIdToString(id._id);
    if (id.id) return safeIdToString(id.id);
    
    // Try toHexString first (MongoDB ObjectId method)
    if (id.toHexString && typeof id.toHexString === 'function') {
      return id.toHexString();
    }
    
    // Try toString method
    if (typeof id.toString === 'function') {
      const stringified = id.toString();
      if (stringified !== '[object Object]') {
        return stringified;
      }
    }
    
    return '';
  }
  
  return String(id);
};

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
    // Handle nested _doc structure from Mongoose
    const planData = plan._doc || plan;
    
    // Convert ObjectId to string using utility function
    const rawId = planData._id || planData.id;
    const id = rawId ? safeIdToString(rawId) : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (!rawId) {
      console.warn('⚠️ Plan missing ID, generated temporary:', id);
    } else if (!id || id === '' || id === '[object Object]') {
      console.error('❌ Failed to normalize plan ID:', {
        rawId,
        rawIdType: typeof rawId,
        normalizedId: id,
        planData: Object.keys(planData)
      });
      throw new Error('Failed to normalize plan ID - invalid ID structure');
    }
    
    // Fix date fields - handle empty objects and invalid dates
    const normalizeDate = (dateValue: any) => {
      // Handle empty objects {} or null/undefined values
      if (!dateValue || 
          (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) ||
          dateValue === null ||
          dateValue === undefined) {
        return null; // Return null for missing dates instead of current date
      }
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    };
    
    // Ensure price is properly converted
    const normalizedPrice = typeof planData.price === 'number' ? planData.price : (parseFloat(planData.price) || 0);
    
    return {
      id,
      name: planData.name || 'Unnamed Plan',
      description: planData.description || '',
      price: normalizedPrice,
      currency: planData.currency || 'USD',
      interval: planData.interval || 'month',
      intervalCount: planData.intervalCount || 1,
      trialPeriodDays: planData.trialPeriodDays || 0,
      features: Array.isArray(planData.features) ? planData.features : [],
      sortOrder: planData.sortOrder || 0,
      isActive: planData.isActive !== undefined ? Boolean(planData.isActive) : true,
      isVisible: planData.isVisible !== undefined ? Boolean(planData.isVisible) : false,
      baseSeats: planData.baseSeats || 1,
      pricePerSeat: planData.pricePerSeat || 0,
      metadata: (typeof planData.metadata === 'object' && planData.metadata !== null) ? planData.metadata : {},
      createdAt: normalizeDate(planData.createdAt) || new Date(),
      updatedAt: normalizeDate(planData.updatedAt) || new Date(),
    };
  }

  async getPlans(params: PlansQueryParams = {}): Promise<{ data: Plan[]; pagination: PaginationState }> {
    try {
      // Add cache busting timestamp to force fresh data from database
      const cacheBuster = Date.now();
      
      // Only use real billing plans from database - no static data
      const result = await this.getBillingPlans(params, cacheBuster);
      

      
      return result;
      
    } catch (error) {
      // Re-throw error to handle properly in UI
      throw new Error(`Failed to fetch plans from database: ${error.message}`);
    }
  }



  // Get billing plans (original method)
  async getBillingPlans(params: PlansQueryParams = {}, cacheBuster?: number): Promise<{ data: Plan[]; pagination: PaginationState }> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('limit', params.pageSize.toString()); // Backend uses 'limit'
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    if (cacheBuster) queryParams.append('_t', cacheBuster.toString());

    const response = await fetch(`${this.baseURL}/billing/plans?${queryParams}`, {
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
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
    // Ensure ID is a string
    const planId = safeIdToString(id);
    
    if (!planId || planId === '' || planId === '[object Object]') {
      throw new Error('Invalid plan ID provided. Cannot fetch plan with empty or invalid ID.');
    }
    
    const response = await fetch(`${this.baseURL}/billing/plans/${planId}`, {
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
    const planId = safeIdToString(id);
    
    if (!planId || planId === '' || planId === '[object Object]') {
      throw new Error('Invalid plan ID provided. Cannot update plan with empty or invalid ID.');
    }
    
    // Ensure features is always an array if provided
    const normalizedData = {
      ...data,
      ...(data.features && { features: data.features || [] }),
    };

    const response = await fetch(`${this.baseURL}/billing/plans/${planId}`, {
      method: 'PATCH', // Backend uses PATCH not PUT
      headers: {
        ...this.getAuthHeaders(),
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
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
    // Ensure ID is a string
    const planId = safeIdToString(id);
    
    if (!planId || planId === '' || planId === '[object Object]') {
      throw new Error('Invalid plan ID provided. Cannot delete plan with empty or invalid ID.');
    }
    
    const response = await fetch(`${this.baseURL}/billing/plans/${planId}`, {
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
    if (id === undefined || id === null) {
      throw new Error('Plan ID is missing or invalid. Cannot toggle plan status without a valid plan ID.');
    }
    
    const planId = safeIdToString(id);
    
    if (!planId || planId === '' || planId === '[object Object]') {
      throw new Error('Plan ID is missing or invalid. Cannot toggle plan status with empty or invalid plan ID.');
    }
    
    return this.updatePlan(planId, { isActive });
  }

  async togglePlanVisibility(id: string, isVisible: boolean): Promise<Plan> {
    // Ensure ID is a string  
    const planId = safeIdToString(id);
    
    if (!planId || planId === '' || planId === '[object Object]') {
      throw new Error('Invalid plan ID provided. Cannot toggle plan visibility with empty or invalid ID.');
    }
    
    return this.updatePlan(planId, { isVisible });
  }

  async getPlanStatistics(id: string): Promise<{
    activeSubscriptions: number;
    totalRevenue: number;
    averageLifetime: number;
    churnRate: number;
    revenueGrowth: number;
    monthlyRecurringRevenue: number;
  }> {
    // Ensure ID is a string
    const planId = safeIdToString(id);
    
    const response = await fetch(`${this.baseURL}/billing/plans/${planId}/statistics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plan statistics: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getPlanSubscriptionHistory(id: string): Promise<Array<{
    date: string;
    subscriptions: number;
    revenue: number;
  }>> {
    // Ensure ID is a string
    const planId = safeIdToString(id);
    
    const response = await fetch(`${this.baseURL}/billing/plans/${planId}/subscription-history`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch plan subscription history: ${response.status} ${errorText}`);
    }

    return response.json();
  }


}