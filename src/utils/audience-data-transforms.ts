import { GeographicData } from '@/services/analytics.service';

export interface TransformedUserTypeData {
  name: string;
  value: number;
  color: string;
}

export interface TransformedAgeData {
  name: string;
  value: number;
}

// Region mapping for countries
const countryToRegionMap: Record<string, string> = {
  "United States": "North America",
  "Canada": "North America", 
  "Mexico": "North America",
  "United Kingdom": "Europe",
  "Germany": "Europe",
  "France": "Europe",
  "Italy": "Europe",
  "Spain": "Europe",
  "Netherlands": "Europe", 
  "Switzerland": "Europe",
  "Belgium": "Europe",
  "Austria": "Europe",
  "Sweden": "Europe",
  "Norway": "Europe",
  "Japan": "Asia",
  "China": "Asia",
  "India": "Asia",
  "South Korea": "Asia",
  "Singapore": "Asia",
  "Thailand": "Asia",
  "Russia": "Asia",
  "Australia": "Oceania",
  "New Zealand": "Oceania",
  "Brazil": "South America",
  "Argentina": "South America",
  "Chile": "South America",
  "South Africa": "Africa",
  "Nigeria": "Africa",
  "Egypt": "Africa"
};

// Transform geographic data if needed  
export const transformGeographicData = (data: GeographicData[]): (GeographicData & { region: string })[] => {
  // Ensure data has required fields and sensible defaults, add region mapping
  return data.map(item => ({
    country: item.country || 'Unknown',
    region: countryToRegionMap[item.country] || 'Other',
    sessions: item.sessions || 0,
    users: item.users || 0,
    bounceRate: item.bounceRate || 0
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