import { AuditFilters, AuditQueryParams } from '@/types/audit';

/**
 * Transform AuditFilters (with dateRange) to AuditQueryParams (with startDate/endDate)
 * for backend API compatibility
 */
export function transformFiltersToQueryParams(filters: AuditFilters): AuditQueryParams {
  return {
    adminUserId: filters.adminUserId,
    action: filters.action,
    resourceType: filters.resourceType,
    resourceId: filters.resourceId,
    status: filters.status,
    startDate: filters.dateRange?.from,
    endDate: filters.dateRange?.to,
    search: filters.search,
    // Note: Backend doesn't support sortBy/sortOrder - it sorts by timestamp desc by default
  };
}

/**
 * Transform AuditFilters with additional parameters like pagination
 */
export function transformFiltersWithPagination(
  filters: AuditFilters,
  pagination: { page: number; limit: number }
): AuditQueryParams {
  return {
    ...transformFiltersToQueryParams(filters),
    page: pagination.page,
    limit: pagination.limit,
  };
}

/**
 * Remove undefined/null values from query parameters
 */
export function cleanQueryParams(params: AuditQueryParams): AuditQueryParams {
  const cleaned: AuditQueryParams = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key as keyof AuditQueryParams] = value;
    }
  });
  
  return cleaned;
}