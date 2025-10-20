// lib/upload/upload-manager.ts
export interface UploadOptions {
  purpose?: string;
  onProgress?: (progress: number, uploaded: number, total: number) => void;
  onComplete?: (result: UploadResult) => void;
  onError?: (error: UploadError) => void;
}

export interface UploadResult {
  id: string;
  url: string;
  key: string;
  size: number;
  mimetype: string;
  originalName: string;
}

export interface UploadError {
  id: string;
  error: string;
  file: File;
}

export interface UploadProgress {
  id: string;
  progress: number;
  uploaded: number;
  total: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
}

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error' | 'paused';
  error?: string;
  controller?: AbortController;
  options: UploadOptions;
}

export interface QueueStatus {
  total: number;
  active: number;
  completed: number;
  failed: number;
  paused: number;
}

export class UploadManager {
  private uploads: Map<string, UploadTask> = new Map();
  private concurrentUploads = 3;
  private activeUploads = 0;

  async uploadFile(file: File, options: UploadOptions = {}): Promise<string> {
    const id = this.generateId();
    const controller = new AbortController();

    const task: UploadTask = {
      id,
      file,
      progress: 0,
      status: 'uploading',
      controller,
      options
    };

    this.uploads.set(id, task);
    this.processQueue();

    return id;
  }

  async uploadMultiple(files: File[], options: UploadOptions = {}): Promise<string[]> {
    const ids = files.map(file => this.uploadFile(file, options));
    return Promise.all(ids);
  }

  async pauseUpload(uploadId: string): Promise<void> {
    const task = this.uploads.get(uploadId);
    if (task && task.status === 'uploading') {
      task.controller?.abort();
      task.status = 'paused';
      this.activeUploads--;
      this.processQueue();
    }
  }

  async resumeUpload(uploadId: string): Promise<void> {
    const task = this.uploads.get(uploadId);
    if (task && task.status === 'paused') {
      task.status = 'uploading';
      task.controller = new AbortController();
      this.processQueue();
    }
  }

  async cancelUpload(uploadId: string): Promise<void> {
    const task = this.uploads.get(uploadId);
    if (task) {
      task.controller?.abort();
      this.uploads.delete(uploadId);
      this.activeUploads--;
      this.processQueue();
    }
  }

  async retryUpload(uploadId: string): Promise<void> {
    const task = this.uploads.get(uploadId);
    if (task && task.status === 'error') {
      task.status = 'uploading';
      task.progress = 0;
      task.error = undefined;
      task.controller = new AbortController();
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    const pendingUploads = Array.from(this.uploads.values())
      .filter(task => task.status === 'uploading')
      .slice(0, this.concurrentUploads - this.activeUploads);

    for (const task of pendingUploads) {
      if (this.activeUploads >= this.concurrentUploads) break;
      
      this.activeUploads++;
      this.executeUpload(task).finally(() => {
        this.activeUploads--;
        this.processQueue();
      });
    }
  }

  private async executeUpload(task: UploadTask): Promise<void> {
    const { file, options } = task;
    
    try {
      // Simulate upload progress (replace with actual AWS S3 upload)
      for (let progress = 0; progress <= 100; progress += 10) {
        if (task.status !== 'uploading') break;
        
        await new Promise(resolve => setTimeout(resolve, 200));
        task.progress = progress;
        
        options.onProgress?.(progress, progress * file.size / 100, file.size);
      }

      if (task.status === 'uploading') {
        task.status = 'completed';
        
        const result: UploadResult = {
          id: task.id,
          url: `https://example.com/files/${task.id}`,
          key: `uploads/${file.name}`,
          size: file.size,
          mimetype: file.type,
          originalName: file.name
        };
        
        options.onComplete?.(result);
      }
    } catch (error) {
      if (task.status === 'uploading') {
        task.status = 'error';
        task.error = error instanceof Error ? error.message : 'Upload failed';
        
        options.onError?.({
          id: task.id,
          error: task.error,
          file: task.file
        });
      }
    }
  }

  // Event handlers
  onProgress(uploadId: string, callback: (progress: UploadProgress) => void): void {
    // Implementation for progress tracking
  }

  onComplete(uploadId: string, callback: (result: UploadResult) => void): void {
    // Implementation for completion tracking
  }

  onError(uploadId: string, callback: (error: UploadError) => void): void {
    // Implementation for error tracking
  }

  // Queue management
  getQueueStatus(): QueueStatus {
    const tasks = Array.from(this.uploads.values());
    return {
      total: tasks.length,
      active: tasks.filter(t => t.status === 'uploading').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'error').length,
      paused: tasks.filter(t => t.status === 'paused').length
    };
  }

  clearCompleted(): void {
    Array.from(this.uploads.entries()).forEach(([id, task]) => {
      if (task.status === 'completed') {
        this.uploads.delete(id);
      }
    });
  }

  clearFailed(): void {
    Array.from(this.uploads.entries()).forEach(([id, task]) => {
      if (task.status === 'error') {
        this.uploads.delete(id);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export const uploadManager = new UploadManager();