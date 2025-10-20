// lib/api/files.service.ts
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
  files: FileListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class FilesService {
  private baseUrl = '/api/files';

  // File upload operations
  async uploadFile(file: File, purpose?: string): Promise<FileResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (purpose) {
      formData.append('purpose', purpose);
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async uploadMultipleFiles(files: File[], purposes?: Record<string, string>): Promise<FileResponse[]> {
    const uploads = files.map(file => this.uploadFile(file, purposes?.[file.name]));
    return Promise.all(uploads);
  }

  // File management
  async getFiles(params: FilesQueryParams): Promise<FilesListResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch files');
    }

    return response.json();
  }

  async getFileDetails(id: string): Promise<FileDetails> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch file details');
    }

    return response.json();
  }

  async deleteFile(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
  }

  async deleteMultipleFiles(ids: string[]): Promise<void> {
    const response = await fetch(`${this.baseUrl}/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete files');
    }
  }

  // File access
  async getDownloadUrl(id: string): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/download`);
    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    return response.json();
  }

  async getPreviewUrl(id: string): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/${id}/preview`);
    if (!response.ok) {
      throw new Error('Failed to get preview URL');
    }

    return response.json();
  }
}

export const filesService = new FilesService();