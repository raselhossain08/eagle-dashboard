'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Users, MessageSquare, Star, Target, Zap } from 'lucide-react';

interface SupportMetricsProps {
  stats: {
    responseTime: number;
    resolutionRate: number;
    satisfactionScore: number;
    ticketVolume: number;
    activeTickets: number;
    teamPerformance: number;
    firstContactResolution: number;
    escalationRate: number;
  };
  trends: {
    responseTime: number;
    resolutionRate: number;
    satisfaction: number;
    volume: number;
    teamPerformance: number;
  };
}

export function SupportMetrics({ stats, trends }: SupportMetricsProps) {
  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />;
    if (value < 0) return <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />;
    return null;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600 dark:text-green-400';
    if (value >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.responseTime}m</div>
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor(-trends.responseTime)}`}>
            {getTrendIcon(-trends.responseTime)}
            <span>{Math.abs(trends.responseTime)}% from last week</span>
          </div>
          <Progress 
            value={Math.max(0, 100 - stats.responseTime)} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <Target className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor(trends.resolutionRate)}`}>
            {getTrendIcon(trends.resolutionRate)}
            <span>{Math.abs(trends.resolutionRate)}% from last week</span>
          </div>
          <Progress 
            value={stats.resolutionRate} 
            className="mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
          <Star className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.satisfactionScore}/5</div>
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor(trends.satisfaction)}`}>
            {getTrendIcon(trends.satisfaction)}
            <span>{Math.abs(trends.satisfaction)}% from last week</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.satisfactionScore)
                    ? 'text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Volume</CardTitle>
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.ticketVolume}</div>
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor(trends.volume)}`}>
            {getTrendIcon(trends.volume)}
            <span>{Math.abs(trends.volume)}% from last week</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {stats.activeTickets} currently active
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Team Performance</CardTitle>
          <Users className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getPerformanceColor(stats.teamPerformance)}`}>
            {stats.teamPerformance}%
          </div>
          <Progress 
            value={stats.teamPerformance} 
            className="mt-2"
          />
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-muted-foreground">Target: 90%</span>
            <Badge variant={stats.teamPerformance >= 90 ? 'default' : 'secondary'}>
              {stats.teamPerformance >= 90 ? 'On Target' : 'Needs Improvement'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">First Contact Resolution</CardTitle>
          <Zap className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.firstContactResolution}%</div>
          <Progress 
            value={stats.firstContactResolution} 
            className="mt-2"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Resolved on first contact
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTickets}</div>
          <div className="text-sm text-muted-foreground">
            Requiring attention
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className="flex-1 bg-secondary rounded-full h-2">
              <div 
                className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (stats.activeTickets / 50) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">of capacity</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.escalationRate}%</div>
          <Progress 
            value={stats.escalationRate} 
            className="mt-2"
          />
          <div className="text-sm text-muted-foreground mt-1">
            Tickets escalated to higher tier
          </div>
        </CardContent>
      </Card>
    </div>
  );
}