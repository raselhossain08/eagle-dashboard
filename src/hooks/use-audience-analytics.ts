import { useQuery } from '@tanstack/react-query';
import { analyticsService, GeographicData, DateRangeParams } from '@/lib/api/analytics.service';

interface UserTypeData {
  name: string;
  value: number;
  color: string;
}

interface AgeData {
  name: string;
  value: number;
}

interface AudienceOverviewData {
  geographicData: GeographicData[];
  userTypeData: UserTypeData[];
  ageData: AgeData[];
}

// Hook for geographic distribution
export const useGeographicDistribution = (dateRange: DateRangeParams) => {
  return useQuery<GeographicData[]>({
    queryKey: ['analytics', 'audience', 'geographic', dateRange],
    queryFn: async () => {
      try {
        const data = await analyticsService.getGeographicDistribution(dateRange);
        console.log('🌍 Raw geographic data from backend:', data);
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log('⚠️ No geographic data available for the selected date range');
          return [];
        }
        
        console.log('✅ Geographic data processed successfully:', data.length, 'countries');
        return data;
      } catch (error) {
        console.warn('❌ Failed to fetch geographic data:', error);
        throw error; // Let React Query handle the error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

// Hook for user type data (new vs returning users)
export const useUserTypeData = (dateRange: DateRangeParams) => {
  return useQuery<UserTypeData[]>({
    queryKey: ['analytics', 'audience', 'user-types', dateRange],
    queryFn: async () => {
      // This would be a separate endpoint if it exists
      // For now, we'll derive from overview stats
      try {
        const overviewStats = await analyticsService.getOverviewStats(dateRange.startDate, dateRange.endDate);
        console.log('📊 Overview stats for user types:', overviewStats);
        
        const total = overviewStats.newUsers + overviewStats.returningUsers;
        
        if (total === 0) {
          console.log('⚠️ No user data available for the selected date range');
          return [];
        }
        
        const userTypeData = [
          {
            name: "New Users",
            value: Math.round((overviewStats.newUsers / total) * 100),
            color: "#3b82f6"
          },
          {
            name: "Returning Users", 
            value: Math.round((overviewStats.returningUsers / total) * 100),
            color: "#10b981"
          }
        ];
        
        console.log('✅ Transformed user type data:', userTypeData);
        return userTypeData;
      } catch (error) {
        console.warn('❌ Failed to fetch user type data:', error);
        throw error; // Let React Query handle the error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

// Hook for age demographics
export const useAgeDistribution = (dateRange: DateRangeParams) => {
  return useQuery<AgeData[]>({
    queryKey: ['analytics', 'audience', 'age', dateRange],
    queryFn: async () => {
      try {
        const data = await analyticsService.getAgeDistribution(dateRange);
        console.log('👥 Raw age distribution data from backend:', data);
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log('⚠️ No age distribution data available for the selected date range');
          return [];
        }
        
        console.log('✅ Age distribution data processed successfully:', data.length, 'age groups');
        return data;
      } catch (error) {
        console.warn('❌ Failed to fetch age distribution data:', error);
        throw error; // Let React Query handle the error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!dateRange.startDate && !!dateRange.endDate,
  });
};

// Combined hook for all audience data
export const useAudienceOverview = (dateRange: DateRangeParams) => {
  const geographicQuery = useGeographicDistribution(dateRange);
  const userTypeQuery = useUserTypeData(dateRange);
  const ageQuery = useAgeDistribution(dateRange);

  return {
    geographic: geographicQuery,
    userTypes: userTypeQuery,
    age: ageQuery,
    isLoading: geographicQuery.isLoading || userTypeQuery.isLoading || ageQuery.isLoading,
    error: geographicQuery.error || userTypeQuery.error || ageQuery.error,
  };
};