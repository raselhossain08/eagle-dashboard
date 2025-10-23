// lib/api/customers.ts
import { apiClient } from './client';

export interface Customer {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  supportTier: 'basic' | 'premium' | 'enterprise';
  lastContact?: string;
  ticketCount: number;
  satisfactionScore: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt?: string;
  totalSpent?: number;
  activeSubscriptions?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  metadata?: Record<string, any>;
}

export interface CustomerListResponse {
  customers: Customer[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CustomerParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supportTier?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class CustomersService {
  private baseUrl = '/api/users';

  async getCustomers(params: CustomerParams = {}): Promise<CustomerListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Default pagination
      queryParams.append('page', String(params.page || 1));
      queryParams.append('limit', String(params.limit || 20));
      
      // Search parameters
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.supportTier) queryParams.append('supportTier', params.supportTier);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get<{
        users: any[];
        total: number;
        page: number;
        totalPages: number;
      }>(`${this.baseUrl}?${queryParams.toString()}`);

      // Transform users to customers format
      const customers = response.users.map((user: any) => this.transformUserToCustomer(user));

      return {
        customers,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
      };
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  async getCustomer(id: string): Promise<Customer> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/${id}`);
      return this.transformUserToCustomer(response);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      throw new Error('Failed to fetch customer');
    }
  }

  async getCustomerSupportSummary(customerId: string): Promise<{
    totalNotes: number;
    lastContactDate?: string;
    averageResponseTime?: number;
    satisfactionRating?: number;
    unresolvedNotes: number;
    priorityNotes: number;
    recentActivity: any[];
  }> {
    try {
      const response = await apiClient.get<{
        totalNotes: number;
        lastContactDate?: string;
        averageResponseTime?: number;
        satisfactionRating?: number;
        unresolvedNotes: number;
        priorityNotes: number;
        recentActivity: any[];
      }>(`/api/support/customer/${customerId}/summary`);
      return response;
    } catch (error) {
      console.error('Failed to fetch customer support summary:', error);
      return {
        totalNotes: 0,
        lastContactDate: undefined,
        averageResponseTime: 0,
        satisfactionRating: 4.5,
        unresolvedNotes: 0,
        priorityNotes: 0,
        recentActivity: [],
      };
    }
  }

  async searchCustomers(query: string, params: Omit<CustomerParams, 'search'> = {}): Promise<CustomerListResponse> {
    return this.getCustomers({ ...params, search: query });
  }

  private transformUserToCustomer(user: any): Customer {
    const profile = user.profile || {};
    
    return {
      id: user._id || user.id,
      _id: user._id,
      firstName: user.firstName || profile.firstName || '',
      lastName: user.lastName || profile.lastName || '',
      name: `${user.firstName || profile.firstName || ''} ${user.lastName || profile.lastName || ''}`.trim() || user.email,
      email: user.email,
      phone: user.phone || profile.phone,
      company: profile.company,
      supportTier: this.determineSupportTier(user),
      lastContact: user.lastActivity || user.updatedAt,
      ticketCount: user.supportStats?.totalNotes || 0,
      satisfactionScore: user.supportStats?.satisfactionScore || 4.5,
      status: user.status || 'active',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      totalSpent: user.billingStats?.totalSpent || 0,
      activeSubscriptions: user.subscriptionStats?.activeCount || 0,
      address: profile.address,
      metadata: user.metadata,
    };
  }

  private determineSupportTier(user: any): 'basic' | 'premium' | 'enterprise' {
    const totalSpent = user.billingStats?.totalSpent || 0;
    const activeSubscriptions = user.subscriptionStats?.activeCount || 0;
    
    if (totalSpent > 10000 || activeSubscriptions > 5) {
      return 'enterprise';
    } else if (totalSpent > 1000 || activeSubscriptions > 1) {
      return 'premium';
    }
    return 'basic';
  }
}

export const customersService = new CustomersService();