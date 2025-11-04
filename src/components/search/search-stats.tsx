import { TrendingUp, Users, FileText, Search as SearchIcon, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SearchStatsProps {
  analytics: {
    totalSearches: number;
    uniqueSearchers: number;
    averageResultsPerSearch: number;
    timeRanges: {
      last24h: number;
      last7d: number;
      last30d: number;
    };
    resourceCounts?: {
      totalUsers: number;
      totalSubscribers: number;
      totalContracts: number;
      activeUsers: number;
    };
  };
  isLoading?: boolean;
}

export function SearchStats({ analytics, isLoading }: SearchStatsProps) {
  const stats = [
    {
      title: 'Total Searches',
      value: analytics.totalSearches,
      icon: SearchIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Unique Searchers', 
      value: analytics.uniqueSearchers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Avg Results',
      value: analytics.averageResultsPerSearch,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      suffix: ' per search',
    },
    {
      title: 'Last 24h Activity',
      value: analytics.timeRanges.last24h,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (analytics.resourceCounts) {
    stats.push({
      title: 'Total Resources',
      value: analytics.resourceCounts.totalUsers + 
             analytics.resourceCounts.totalSubscribers + 
             analytics.resourceCounts.totalContracts,
      icon: FileText,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    <span className={stat.color}>
                      {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm font-normal text-gray-500">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  
                  {/* Additional info */}
                  {index === 3 && ( // Last 24h Activity card
                    <div className="mt-2 text-xs text-gray-500">
                      <div>7d: {analytics.timeRanges.last7d.toLocaleString()}</div>
                      <div>30d: {analytics.timeRanges.last30d.toLocaleString()}</div>
                    </div>
                  )}
                </div>
                
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}