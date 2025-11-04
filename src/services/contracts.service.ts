import axios, { AxiosResponse } from 'axios';
import { 
  Contract,
  ContractMetrics,
  PaginatedContracts,
  CreateContractDto,
  SignContractDto,
  ContractTemplate,
  ContractFilters,
  ContractsQueryParams,
  DateRange
} from '@/lib/types/contracts';

// Additional types for enhanced API
export interface UpdateContractDto extends Partial<CreateContractDto> {
  title?: string;
  content?: string;
  status?: string;
  recipientEmail?: string;
  recipientName?: string;
  expiresAt?: Date;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  clientName?: string;
  description?: string;
}

export interface ContractSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string[];
  type?: string;
  clientName?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  templateId?: string;
  userId?: string;
  recipientEmail?: string;
  signedStatus?: 'signed' | 'unsigned';
  expirationFilter?: 'expired' | 'expiring-soon' | 'active';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface BulkActionDto {
  contractIds: string[];
  action: 'delete' | 'void' | 'archive' | 'change-status';
  newStatus?: string;
  reason?: string;
}

export interface ContractMetricsQuery {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'week' | 'month';
  type?: string;
  status?: string;
  templateId?: string;
}

export interface EnhancedContractMetrics extends ContractMetrics {
  activityData: Array<{
    date: string;
    sent: number;
    viewed: number;
    signed: number;
  }>;
  period: {
    from: Date;
    to: Date;
  };
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const CONTRACTS_ENDPOINT = `${API_BASE_URL}/contracts`;

// Create axios instance with interceptors
const contractsApi = axios.create({
  baseURL: CONTRACTS_ENDPOINT,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
contractsApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
contractsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export class ContractsService {
  // Get all contracts with advanced filtering and pagination
  static async getContracts(params: ContractSearchParams = {}): Promise<PaginatedContracts> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all search parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response: AxiosResponse<{
        success: boolean;
        data: Contract[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
        message: string;
      }> = await contractsApi.get(`/?${queryParams.toString()}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch contracts');
      }

      return {
        data: response.data.data.map(this.transformContractResponse),
        meta: {
          total: response.data.pagination.total,
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          totalPages: response.data.pagination.pages,
        },
      };
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      throw error;
    }
  }

  // Get contract metrics and analytics
  static async getContractMetrics(params: ContractMetricsQuery = {}): Promise<EnhancedContractMetrics> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response: AxiosResponse<{
        success: boolean;
        data: EnhancedContractMetrics;
        message: string;
      }> = await contractsApi.get(`/metrics?${queryParams.toString()}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch metrics');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch contract metrics:', error);
      throw error;
    }
  }

  // Get single contract by ID
  static async getContract(id: string): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.get(`/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      throw error;
    }
  }

  // Create new contract
  static async createContract(data: CreateContractDto): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.post('/', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to create contract:', error);
      throw error;
    }
  }

  // Update existing contract
  static async updateContract(id: string, data: UpdateContractDto): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.put(`/${id}`, data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to update contract:', error);
      throw error;
    }
  }

  // Delete contract
  static async deleteContract(id: string): Promise<void> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
      }> = await contractsApi.delete(`/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete contract');
      }
    } catch (error) {
      console.error('Failed to delete contract:', error);
      throw error;
    }
  }

  // Send contract to recipient
  static async sendContract(id: string, data: { recipientEmail: string; message?: string }): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.post(`/${id}/send`, data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to send contract:', error);
      throw error;
    }
  }

  // Sign contract
  static async signContract(id: string, data: SignContractDto): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.post(`/${id}/sign`, data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to sign contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to sign contract:', error);
      throw error;
    }
  }

  // Void contract
  static async voidContract(id: string, reason: string): Promise<Contract> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.post(`/${id}/void`, { reason });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to void contract');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to void contract:', error);
      throw error;
    }
  }

  // Bulk actions on multiple contracts
  static async bulkAction(data: BulkActionDto): Promise<{ affected: number }> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: { affected: number };
        message: string;
      }> = await contractsApi.post('/bulk-action', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to perform bulk action');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
      throw error;
    }
  }

  // Export contracts
  static async exportContracts(
    format: 'csv' | 'excel' | 'pdf',
    filters: ContractSearchParams = {}
  ): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await contractsApi.get(`/export/${format}?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      return new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' :
              format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'application/pdf'
      });
    } catch (error) {
      console.error('Failed to export contracts:', error);
      throw error;
    }
  }

  // Upload document to contract
  static async uploadDocument(id: string, file: File): Promise<Contract> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<{
        success: boolean;
        data: Contract;
        message: string;
      }> = await contractsApi.post(`/${id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to upload document');
      }

      return this.transformContractResponse(response.data.data);
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  // Get contract templates
  static async getTemplates(): Promise<ContractTemplate[]> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: ContractTemplate[];
        message: string;
      }> = await contractsApi.get('/templates/list');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch templates');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw error;
    }
  }

  // Create contract template
  static async createTemplate(data: Omit<ContractTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContractTemplate> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: ContractTemplate;
        message: string;
      }> = await contractsApi.post('/templates', data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create template');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to create template:', error);
      throw error;
    }
  }

  // Get activity log for contract
  static async getActivity(id: string): Promise<any[]> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        data: any[];
        message: string;
      }> = await contractsApi.get(`/${id}/activity`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch activity log');
      }

      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch activity log:', error);
      throw error;
    }
  }

  // Helper method to transform contract response
  private static transformContractResponse(contract: any): Contract {
    return {
      ...contract,
      id: contract._id || contract.id,
      userId: contract.userId || contract.createdBy,
      createdAt: new Date(contract.createdAt),
      updatedAt: new Date(contract.updatedAt),
      sentAt: contract.sentAt ? new Date(contract.sentAt) : undefined,
      viewedAt: contract.viewedAt ? new Date(contract.viewedAt) : undefined,
      signedAt: contract.signedAt ? new Date(contract.signedAt) : undefined,
      expiresAt: contract.expiresAt ? new Date(contract.expiresAt) : undefined,
      voidedAt: contract.voidedAt ? new Date(contract.voidedAt) : undefined,
      // Ensure required fields have defaults
      title: contract.title || '',
      content: contract.content || '',
      status: contract.status || 'draft',
      recipientEmail: contract.recipientEmail || '',
      recipientName: contract.recipientName || contract.signerName || '',
      contentHash: contract.contentHash || '',
      signatures: contract.signatures || [],
      variables: contract.variables || {},
    } as Contract;
  }

  // Calculate signing progress based on status
  private static calculateSigningProgress(status: string): number {
    switch (status) {
      case 'signed': return 100;
      case 'viewed': return 75;
      case 'sent': return 50;
      case 'draft': return 25;
      default: return 0;
    }
  }

  // Search contracts with debouncing support
  static async searchContracts(query: string, filters: Partial<ContractSearchParams> = {}): Promise<PaginatedContracts> {
    return this.getContracts({
      ...filters,
      search: query,
      limit: 20,
    });
  }

  // Get contracts by status
  static async getContractsByStatus(status: string, limit = 10): Promise<PaginatedContracts> {
    return this.getContracts({
      status: [status],
      limit,
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    });
  }

  // Get expiring contracts
  static async getExpiringContracts(limit = 10): Promise<PaginatedContracts> {
    return this.getContracts({
      expirationFilter: 'expiring-soon',
      limit,
      sortBy: 'expiresAt',
      sortOrder: 'asc',
    });
  }

  // Get recent contracts
  static async getRecentContracts(limit = 5): Promise<PaginatedContracts> {
    return this.getContracts({
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }
}

export default ContractsService;