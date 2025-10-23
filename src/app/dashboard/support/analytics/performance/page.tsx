'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingUp, Users, Clock, Star, Target, Award, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supportService } from '@/lib/api/support';
import { toast } from 'sonner';

export default function TeamPerformancePage() {
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamPerformance();
  }, []);

  const fetchTeamPerformance = async () => {
    try {
      setLoading(true);
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const data = await supportService.getTeamPerformance({ startDate, endDate });
      setTeamData(data);
    } catch (error) {
      console.error('Failed to fetch team performance:', error);
      toast.error('Failed to load team performance data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const report = await supportService.generateReport('team-performance', { startDate, endDate });
      
      // Create and download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `team-performance-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Team performance report exported successfully');
    } catch (error) {
      console.error('Failed to export report:', error);
      toast.error('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Failed to load team performance data</p>
          </div>
        </div>
      </div>
    );
  }

  const { teamPerformance, summary } = teamData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-muted-foreground">
            Detailed analytics and metrics for support team members
          </p>
        </div>
        <Button variant="outline" onClick={handleExportReport}>
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
            <div className="text-2xl font-bold">{Math.round(summary.avgProductivity)}%</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Team average</span>
            </div>
            <Progress value={summary.avgProductivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgSatisfaction.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Team average rating
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= Math.round(summary.avgSatisfaction)
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
            <CardTitle className="text-sm font-medium">Total Handled</CardTitle>
            <Award className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTicketsHandled}</div>
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Last 30 days</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              Team members with activity
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
                    <TableHead>Tickets Handled</TableHead>
                    <TableHead>Resolved</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Satisfaction</TableHead>
                    <TableHead>Productivity</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamPerformance.map((agent: any) => (
                    <TableRow key={agent._id}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.role}</TableCell>
                      <TableCell>{agent.totalTickets}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <span>{agent.resolvedTickets}</span>
                          <span className="text-muted-foreground">
                            ({Math.round(agent.resolutionRate)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span>{Math.round(agent.avgResponseTime)}m</span>
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
                              style={{ width: `${Math.min(agent.productivity, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm">{Math.round(agent.productivity)}%</span>
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
                {teamPerformance.map((agent: any) => (
                  <Card key={agent._id}>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <span>{agent.name}</span>
                        <Badge variant="outline">{agent.role}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.totalTickets}</div>
                          <div className="text-sm text-muted-foreground">Total Handled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(agent.avgResponseTime)}m</div>
                          <div className="text-sm text-muted-foreground">Avg Response</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{agent.satisfaction}/5</div>
                          <div className="text-sm text-muted-foreground">Satisfaction</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{Math.round(agent.productivity)}%</div>
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
                {teamPerformance
                  .filter((agent: any) => agent.productivity < 80 || agent.avgResponseTime > 30)
                  .map((agent: any) => (
                  <div key={agent._id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {agent.productivity < 80 && 'Low productivity detected'}
                          {agent.avgResponseTime > 30 && 'High response time'}
                        </p>
                      </div>
                      <Badge variant={agent.productivity < 70 ? 'destructive' : 'secondary'}>
                        {agent.productivity < 70 ? 'High Priority' : 'Medium Priority'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <span>
                        Productivity: {Math.round(agent.productivity)}% | 
                        Response Time: {Math.round(agent.avgResponseTime)}m
                      </span>
                    </div>
                  </div>
                ))}
                
                {teamPerformance.every((agent: any) => agent.productivity >= 80 && agent.avgResponseTime <= 30) && (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-600">Excellent Team Performance!</h3>
                    <p className="text-muted-foreground">All team members are meeting performance targets.</p>
                  </div>
                )}
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
                    <h4 className="font-semibold">Average Resolution Rate</h4>
                    <p className="text-sm text-muted-foreground">Target: 85%</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(teamPerformance.reduce((sum: number, agent: any) => sum + agent.resolutionRate, 0) / teamPerformance.length)}%
                    </div>
                    <Badge variant="default">On Target</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Customer Satisfaction Score</h4>
                    <p className="text-sm text-muted-foreground">Target: 4.5/5</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{summary.avgSatisfaction.toFixed(1)}/5</div>
                    <Badge variant={summary.avgSatisfaction >= 4.5 ? 'default' : 'destructive'}>
                      {summary.avgSatisfaction >= 4.5 ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">Average Response Time</h4>
                    <p className="text-sm text-muted-foreground">Target: ≤ 20 minutes</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {Math.round(teamPerformance.reduce((sum: number, agent: any) => sum + agent.avgResponseTime, 0) / teamPerformance.length)}m
                    </div>
                    <Badge variant="default">Good</Badge>
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