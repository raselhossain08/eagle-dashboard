import { GeographicData } from '@/lib/api/analytics.service';

export interface TransformedUserTypeData {
  name: string;
  value: number;
  color: string;
}

export interface TransformedAgeData {
  name: string;
  value: number;
}

// Transform geographic data if needed
export const transformGeographicData = (data: GeographicData[]): GeographicData[] => {
  // Ensure data has required fields and sensible defaults
  return data.map(item => ({
    country: item.country || 'Unknown',
    region: item.region || 'Unknown',
    sessions: item.sessions || 0,
    users: item.users || 0
  }));
};

// Transform overview stats to user type percentages
export const transformToUserTypeData = (newUsers: number, returningUsers: number): TransformedUserTypeData[] => {
  const total = newUsers + returningUsers;
  
  if (total === 0) {
    return [
      { name: "New Users", value: 0, color: "#3b82f6" },
      { name: "Returning Users", value: 0, color: "#10b981" }
    ];
  }
  
  return [
    {
      name: "New Users",
      value: Math.round((newUsers / total) * 100),
      color: "#3b82f6"
    },
    {
      name: "Returning Users", 
      value: Math.round((returningUsers / total) * 100),
      color: "#10b981"
    }
  ];
};

// Validate and clean age distribution data
export const transformAgeData = (data: any[]): TransformedAgeData[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  
  return data
    .filter(item => item && typeof item.name === 'string' && typeof item.value === 'number')
    .map(item => ({
      name: item.name,
      value: Math.max(0, item.value) // Ensure non-negative values
    }));
};