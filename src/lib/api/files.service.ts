// lib/api/files.service.ts
import { apiClient } from './api-client';
import { FileItem, FileResponse, FileDetails, FileListItem } from '@/types/files';

export interface FilesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  folder?: string;
  sortBy?: 'name' | 'size' | 'date' | 'type';
  sortOrder?: 'asc' | 'desc';
}

export interface FilesListResponse {
  files: FileItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
  lastModified: Date;
  parentId?: string;
  children?: FolderItem[];
}

export interface StorageQuota {
  used: number;
  total: number;
  unit: string;
  percentage: number;
  breakdown: StorageBreakdown[];
}

export interface StorageBreakdown {
  type: string;
  size: number;
  count: number;
  color: string;
}

export interface StorageAnalytics {
  totalFiles: number;
  totalSize: number;
  fileTypes: StorageBreakdown[];
  uploadTrends: UploadTrend[];
  topUsers: TopUser[];
  storageGrowth: StorageGrowthData[];
}

export interface UploadTrend {
  date: string;
  uploads: number;
  totalSize: number;
}

export interface TopUser {
  userId: string;
  username?: string;
  fileCount: number;
  totalSize: number;
}

export interface StorageGrowthData {
  date: string;
  totalSize: number;
  totalFiles: number;
}

export class FilesService {
  private baseUrl = '/files';

  // File upload operations
  async uploadFile(file: File, purpose?: string): Promise<FileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (purpose) {
      formData.append('purpose', purpose);
    }

    const token = typeof window !== 'undefined' ? 
      document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] : null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${this.baseUrl}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], purpose?: string): Promise<FileResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (purpose) {
      formData.append('purpose', purpose);
    }

    const token = typeof window !== 'undefined' ? 
      document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] : null;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${this.baseUrl}/upload-multiple`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    return response.json();
  }

  // File management
  async getFiles(params: FilesQueryParams): Promise<FilesListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return apiClient.get<FilesListResponse>(`${this.baseUrl}?${queryParams}`);
  }

  async getFileDetails(id: string): Promise<FileDetails> {
    return apiClient.get<FileDetails>(`${this.baseUrl}/${id}`);
  }

  async deleteFile(key: string): Promise<void> {
    // Handle both file IDs and S3 keys
    // If it's a key (contains /), extract the file ID from it
    let fileId = key;
    if (key.includes('/')) {
      const fileName = key.split('/').pop() || '';
      const parts = fileName.split('-');
      if (parts.length > 1) {
        fileId = parts[0];
      }
    }
    
    return apiClient.delete<void>(`${this.baseUrl}/${fileId}`);
  }

  async deleteMultipleFiles(keys: string[]): Promise<void> {
    // Support both fileIds and keys for flexibility
    return apiClient.post<void>(`${this.baseUrl}/bulk-delete`, { 
      keys: keys,
      fileIds: keys // Also send as fileIds for backward compatibility
    });
  }

  async renameFile(fileId: string, newName: string): Promise<any> {
    return apiClient.patch(`${this.baseUrl}/${fileId}/rename`, { newName });
  }

  // File access
  async getDownloadUrl(id: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${this.baseUrl}/${id}/download`);
  }

  async getPreviewUrl(id: string): Promise<{ url: string }> {
    return apiClient.get<{ url: string }>(`${this.baseUrl}/${id}/preview`);
  }

  // Folder management
  async getFolders(search?: string): Promise<FolderItem[]> {
    const queryParams = new URLSearchParams();
    if (search) {
      queryParams.append('search', search);
    }
    
    const endpoint = `${this.baseUrl}/folders${queryParams.toString() ? `?${queryParams}` : ''}`;
    return apiClient.get<FolderItem[]>(endpoint);
  }

  async createFolder(name: string, parentPath?: string): Promise<any> {
    return apiClient.post(`${this.baseUrl}/folders`, { name, parentPath });
  }

  // Storage management
  async getStorageQuota(): Promise<StorageQuota> {
    return apiClient.get<StorageQuota>(`${this.baseUrl}/storage/quota`);
  }

  async getStorageAnalytics(): Promise<StorageAnalytics> {
    return apiClient.get<StorageAnalytics>(`${this.baseUrl}/storage/analytics`);
  }

  // Admin endpoints
  async getAllFiles(params: FilesQueryParams): Promise<FilesListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    return apiClient.get<FilesListResponse>(`${this.baseUrl}/admin/all?${queryParams}`);
  }

  async getSystemAnalytics(): Promise<StorageAnalytics> {
    return apiClient.get<StorageAnalytics>(`${this.baseUrl}/admin/analytics`);
  }

  async getUsageTrends(fromDate?: Date, toDate?: Date): Promise<UploadTrend[]> {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append('from', fromDate.toISOString());
    if (toDate) queryParams.append('to', toDate.toISOString());

    return apiClient.get<UploadTrend[]>(`${this.baseUrl}/admin/usage-trends?${queryParams}`);
  }

  async getUserAnalytics(page: number = 1, limit: number = 20): Promise<{
    users: TopUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());

    return apiClient.get(`${this.baseUrl}/admin/user-analytics?${queryParams}`);
  }
}

export const filesService = new FilesService();