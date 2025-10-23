'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, FileText, BarChart3, Users, MessageSquare, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supportService } from '@/lib/api/support';
import { toast } from 'sonner';

const reportTemplates = [
  {
    id: 'weekly-summary',
    name: 'Weekly Support Summary',
    description: 'Overview of support performance and key metrics for the week',
    category: 'performance',
    frequency: 'weekly',
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Report',
    description: 'Detailed analysis of customer feedback and satisfaction scores',
    category: 'satisfaction',
    frequency: 'monthly',
  },
  {
    id: 'team-performance',
    name: 'Team Performance Review',
    description: 'Individual and team performance metrics and trends',
    category: 'performance',
    frequency: 'monthly',
  },
  {
    id: 'ticket-volume',
    name: 'Ticket Volume Analysis',
    description: 'Analysis of ticket volume trends and patterns',
    category: 'volume',
    frequency: 'weekly',
  },
  {
    id: 'sla-compliance',
    name: 'SLA Compliance Report',
    description: 'Service Level Agreement compliance and performance',
    category: 'compliance',
    frequency: 'weekly',
  }
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('last-week');
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());

  const filteredReports = reportTemplates.filter(report =>
    selectedCategory === 'all' || report.category === selectedCategory
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'satisfaction': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'volume': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'security': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'compliance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getDateRange = () => {
    const endDate = new Date().toISOString();
    let startDate: string;

    switch (dateRange) {
      case 'last-week':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last-month':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'last-quarter':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    return { startDate, endDate };
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingReports(prev => new Set([...prev, reportId]));
      const { startDate, endDate } = getDateRange();
      
      const report = await supportService.generateReport(reportId, { startDate, endDate });
      
      // Add to recent reports
      setRecentReports(prev => [
        {
          ...report,
          status: 'completed',
          generatedAt: new Date().toISOString()
        },
        ...prev.slice(0, 4) // Keep only 5 most recent
      ]);

      // Download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${report.title} generated successfully`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  const handleGenerateCustomReport = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      
      const [analytics, teamPerformance] = await Promise.all([
        supportService.getSupportAnalytics({ startDate, endDate }),
        supportService.getTeamPerformance({ startDate, endDate })
      ]);

      const customReport = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'custom-report',
        title: 'Custom Support Report',
        generatedAt: new Date().toISOString(),
        period: { startDate, endDate },
        data: {
          analytics,
          teamPerformance,
          summary: {
            totalTickets: analytics.overview.totalTickets,
            resolutionRate: analytics.overview.resolutionRate,
            avgResponseTime: analytics.overview.avgResponseTime,
            teamProductivity: teamPerformance.summary.avgProductivity
          }
        }
      };

      // Download the custom report
      const blob = new Blob([JSON.stringify(customReport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-support-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Custom report generated successfully');
    } catch (error) {
      console.error('Failed to generate custom report:', error);
      toast.error('Failed to generate custom report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage support analytics reports
          </p>
        </div>
        <Button onClick={handleGenerateCustomReport} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Custom Report'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Filter reports by category and date range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-week">Last 7 Days</SelectItem>
                  <SelectItem value="last-month">Last 30 Days</SelectItem>
                  <SelectItem value="last-quarter">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <h4 className="font-semibold mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Templates</span>
                  <span className="font-medium">{reportTemplates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated Today</span>
                  <span className="font-medium">{recentReports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Types</span>
                  <span className="font-medium">5</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>
                Pre-configured report templates for common analytics needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center space-x-2">
                            <FileText className="w-5 h-5" />
                            <span>{report.name}</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            {report.description}
                          </CardDescription>
                        </div>
                        <Badge className={getCategoryColor(report.category)}>
                          {report.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Frequency: {report.frequency}</span>
                        </div>
                        <div className="text-muted-foreground">
                          Real-time data
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generatingReports.has(report.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {generatingReports.has(report.id) ? 'Generating...' : 'Generate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>
                Recently generated reports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground">No reports generated yet</h3>
                  <p className="text-muted-foreground">Generate your first report using the templates above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report, index) => (
                    <div key={report.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-semibold">{report.title}</div>
                          <div className="text-sm text-muted-foreground">
                            Generated on {new Date(report.generatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="default">Completed</Badge>
                        <Button variant="outline" size="sm" disabled>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}