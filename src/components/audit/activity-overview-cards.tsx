import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ActivityOverviewData, DateRange } from '@/types/audit';
import { 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityOverviewCardsProps {
  data: ActivityOverviewData;
  dateRange: DateRange;
  isLoading?: boolean;
}

export function ActivityOverviewCards({ data, dateRange, isLoading }: ActivityOverviewCardsProps) {
  const successRate = data.totalLogs > 0 
    ? (data.successfulActions / data.totalLogs) * 100 
    : 0;

  const failureRate = data.totalLogs > 0 
    ? (data.failedActions / data.totalLogs) * 100 
    : 0;

  const cards = [
    {
      title: "Total Actions",
      value: data.totalLogs.toLocaleString(),
      description: "Total audit events",
      icon: Activity,
      trend: data.trendsData.length > 1 
        ? ((data.trendsData[data.trendsData.length - 1].count - data.trendsData[0].count) / data.trendsData[0].count) * 100 
        : 0,
      color: "text-blue-600"
    },
    {
      title: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      description: `${data.successfulActions.toLocaleString()} successful`,
      icon: CheckCircle2,
      trend: successRate > 95 ? 5 : -5,
      color: "text-green-600"
    },
    {
      title: "Failed Actions",
      value: data.failedActions.toLocaleString(),
      description: `${failureRate.toFixed(1)}% of total`,
      icon: XCircle,
      trend: failureRate > 5 ? 10 : -2,
      color: "text-red-600"
    },
    {
      title: "Active Admins",
      value: data.uniqueAdmins.toString(),
      description: `Most active: ${data.mostActiveAdmin}`,
      icon: Users,
      trend: data.uniqueAdmins > 10 ? 3 : 0,
      color: "text-purple-600"
    },
    {
      title: "Risk Score",
      value: data.riskScore.toString(),
      description: data.riskScore < 30 ? "Low risk" : data.riskScore < 70 ? "Medium risk" : "High risk",
      icon: Shield,
      trend: data.riskScore > 50 ? 8 : -3,
      color: data.riskScore < 30 ? "text-green-600" : data.riskScore < 70 ? "text-yellow-600" : "text-red-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-[100px] bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-[120px] bg-muted rounded animate-pulse mt-1" />
              <div className="h-3 w-[160px] bg-muted rounded animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.trend >= 0;
        
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={cn("h-4 w-4", card.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {Math.abs(card.trend) > 0 && (
                  <>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                    )}
                    <span className={cn(isPositive ? "text-green-600" : "text-red-600")}>
                      {Math.abs(card.trend).toFixed(1)}%
                    </span>
                    <span className="mx-1">•</span>
                  </>
                )}
                {card.description}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}