
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
  key: string;
  size: number;
  lastModified: Date;
}