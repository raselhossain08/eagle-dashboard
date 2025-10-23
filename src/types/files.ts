
// types/files.ts
export interface FileItem {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  url?: string;
  thumbnailUrl?: string;
}

export interface FileUpload {
  file: File;
  purpose: string;
}

export interface FileResponse {
  id: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface FileDetails {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
}

export interface FileListItem {
  id: string;
  key: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface FolderItem {
  id: string;
  name: string;
  path?: string;
  fileCount: number;
  totalSize?: number;
  lastModified?: Date;
  parentId?: string;
  children?: FolderItem[];
}

export interface StorageQuota {
  used: number;
  total: number;
  unit: string;
  percentage: number;
  breakdown?: StorageBreakdown[];
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

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'paused';
  error?: string;
}