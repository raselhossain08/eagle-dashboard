'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp, Users, Clock, Star, Target, Award } from 'lucide-react';

const teamPerformanceData = [
  { 
    id: 1, 
    name: 'John Smith', 
    role: 'Senior Support', 
    ticketsResolved: 45, 
    avgResponseTime: '12m', 
    satisfaction: 4.8, 
    productivity: 95,
    thisWeek: 12,
    lastWeek: 10
  },
  { 
    id: 2, 
    name: 'Sarah Johnson', 
    role: 'Support Agent', 
    ticketsResolved: 38, 
    avgResponseTime: '18m', 
    satisfaction: 4.6, 
    productivity: 88,
    thisWeek: 8,
    lastWeek: 9
  },
  { 
    id: 3, 
    name: 'Mike Chen', 
    role: 'Technical Support', 
    ticketsResolved: 52, 
    avgResponseTime: '15m', 
    satisfaction: 4.9, 
    productivity: 98,
    thisWeek: 15,
    lastWeek: 12
  },
  { 
    id: 4, 
    name: 'Emily Davis', 
    role: 'Support Agent', 
    ticketsResolved: 41, 
    avgResponseTime: '22m', 
    satisfaction: 4.4, 
    productivity: 82,
    thisWeek: 10,
    lastWeek: 11
  },
];

const performanceMetrics = {
  teamProductivity: 91,
  avgSatisfaction: 4.7,
  avgResponseTime: 16,
  activeAgents: 8,
  resolutionRate: 94,
  firstContactResolution: 78
};

export default function TeamPerformancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground">
            Detailed analytics and metrics for support team members
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.teamProductivity}%</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+5% from last month</span>
            </div>
            <Progress value={performanceMetrics.teamProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.avgSatisfaction}/5</div>
            <p className="text-xs text-muted-foreground">
              Based on 284 reviews
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(performanceMetrics.avgSatisfaction)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.resolutionRate}%</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+3% from last week</span>
            </div>
            <Progress value={performanceMetrics.resolutionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceMetrics.activeAgents}</div>
            <p className="text-xs text-muted-foreground">
              6 available, 2 in training
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="individual">Individual Metrics</TabsTrigger>
          <TabsTrigger value="training">Training Needs</TabsTrigger>
          <TabsTrigger value="kpi">KPI Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators across the support team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tickets Resolved</TableHead>
                    <TableHead>This Week</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformanceData.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.role}</TableCell>
                      <TableCell>{agent.ticketsResolved}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{agent.thisWeek}</span>
                          {agent.thisWeek > agent.lastWeek && (
                            <TrendingUp className="w-3 h-3 text-green-500" />
                          )}
                          {agent.thisWeek < agent.lastWeek && (
                            <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{agent.avgResponseTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span>{agent.satisfaction}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${agent.productivity}%` }}
                            />
                          </div>
                          <span className="text-sm">{agent.productivity}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          agent.productivity >= 90 ? 'default' : 
                          agent.productivity >= 80 ? 'secondary' : 'destructive'
                        }>
                          {agent.productivity >= 90 ? 'Excellent' : 
                           agent.productivity >= 80 ? 'Good' : 'Needs Review'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individual">
          <Card>
            <CardHeader>
              <CardTitle>Individual Performance Details</CardTitle>
              <CardDescription>
                Detailed breakdown of each team member's performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamPerformanceData.map((agent) => (
                  <Card key={agent.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{agent.name}</span>
                        <Badge variant="outline">{agent.role}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.ticketsResolved}</div>
                          <div className="text-sm text-muted-foreground">Total Resolved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.avgResponseTime}</div>
                          <div className="text-sm text-muted-foreground">Avg Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.satisfaction}/5</div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.productivity}%</div>
                          <div className="text-sm text-muted-foreground">Productivity</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training & Development Needs</CardTitle>
              <CardDescription>
                Identify areas where team members need additional training and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Advanced Technical Training</h4>
                      <p className="text-sm text-muted-foreground">
                        3 team members need advanced technical support training
                      </p>
                    </div>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Affected: Emily Davis, Sarah Johnson</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Customer Communication</h4>
                      <p className="text-sm text-muted-foreground">
                        2 team members need communication skills improvement
                      </p>
                    </div>
                    <Badge variant="outline">Medium Priority</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Affected: Sarah Johnson, Mike Chen</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">Time Management</h4>
                      <p className="text-sm text-muted-foreground">
                        1 team member needs time management training
                      </p>
                    </div>
                    <Badge variant="outline">Low Priority</Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span>Affected: Emily Davis</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kpi">
          <Card>
            <CardHeader>
              <CardTitle>KPI Performance Tracking</CardTitle>
              <CardDescription>
                Track key performance indicators against targets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">First Contact Resolution Rate</h4>
                    <p className="text-sm text-muted-foreground">Target: 85%</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{performanceMetrics.firstContactResolution}%</div>
                    <Badge variant={performanceMetrics.firstContactResolution >= 85 ? 'default' : 'destructive'}>
                      {performanceMetrics.firstContactResolution >= 85 ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Customer Satisfaction Score</h4>
                    <p className="text-sm text-muted-foreground">Target: 4.5/5</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{performanceMetrics.avgSatisfaction}/5</div>
                    <Badge variant={performanceMetrics.avgSatisfaction >= 4.5 ? 'default' : 'destructive'}>
                      {performanceMetrics.avgSatisfaction >= 4.5 ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Average Response Time</h4>
                    <p className="text-sm text-muted-foreground">Target: ≤ 20 minutes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{performanceMetrics.avgResponseTime}m</div>
                    <Badge variant={performanceMetrics.avgResponseTime <= 20 ? 'default' : 'destructive'}>
                      {performanceMetrics.avgResponseTime <= 20 ? 'On Target' : 'Above Target'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}