// types/segments.ts
export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: string;
  userCount: number;
  color: string;
  isActive: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserSegmentDto {
  id: string;
  name: string;
  description: string;
  criteria: string;
  color?: string;
  tags?: string[];
}

export interface UpdateUserSegmentDto {
  name?: string;
  description?: string;
  criteria?: string;
  color?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface SegmentUsersResponse {
  data: any[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}