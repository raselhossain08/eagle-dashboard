'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { 
  Download, 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw,
  CheckCircle,
  Clock,
  Filter,
  FileBarChart,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supportService } from '@/lib/api/support';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import { SupportReport } from '@/types/support';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
  icon: React.ReactNode;
  estimatedTime: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'weekly-summary',
    name: 'Weekly Support Summary',
    description: 'Comprehensive overview of support performance and key metrics',
    category: 'performance',
    frequency: 'weekly',
    icon: <BarChart3 className="w-5 h-5" />,
    estimatedTime: '2-3 min'
  },
  {
    id: 'customer-satisfaction',
    name: 'Customer Satisfaction Report',
    description: 'Detailed analysis of customer feedback and satisfaction scores',
    category: 'satisfaction',
    frequency: 'monthly',
    icon: <Users className="w-5 h-5" />,
    estimatedTime: '1-2 min'
  },
  {
    id: 'team-performance',
    name: 'Team Performance Review',
    description: 'Individual and team performance metrics with insights',
    category: 'performance',
    frequency: 'monthly',
    icon: <Users className="w-5 h-5" />,
    estimatedTime: '3-4 min'
  },
  {
    id: 'ticket-volume',
    name: 'Ticket Volume Analysis',
    description: 'Analysis of ticket volume trends and patterns over time',
    category: 'volume',
    frequency: 'weekly',
    icon: <MessageSquare className="w-5 h-5" />,
    estimatedTime: '1-2 min'
  },
  {
    id: 'sla-compliance',
    name: 'SLA Compliance Report',
    description: 'Service Level Agreement compliance and performance tracking',
    category: 'compliance',
    frequency: 'weekly',
    icon: <CheckCircle className="w-5 h-5" />,
    estimatedTime: '2-3 min'
  }
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date(),
  });
  const [recentReports, setRecentReports] = useState<SupportReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalGenerated: 0,
    todayGenerated: 0,
    avgGenerationTime: '2.5 min'
  });

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

  const getDateRangeForAPI = useCallback(() => {
    if (!dateRange?.from || !dateRange?.to) {
      const endDate = new Date();
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
    }

    return {
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString()
    };
  }, [dateRange]);

  useEffect(() => {
    loadRecentReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecentReports = async () => {
    try {
      // In a real app, you'd have an endpoint to get recent reports
      // For now, we'll use localStorage to simulate persistence
      const savedReports = localStorage.getItem('recentReports');
      if (savedReports) {
        setRecentReports(JSON.parse(savedReports));
      }
    } catch (error) {
      console.error('Failed to load recent reports:', error);
    }
  };

  const saveReportToHistory = (report: SupportReport) => {
    const updatedReports = [report, ...recentReports.slice(0, 4)];
    setRecentReports(updatedReports);
    localStorage.setItem('recentReports', JSON.stringify(updatedReports));
    
    setStats(prev => ({
      ...prev,
      totalGenerated: prev.totalGenerated + 1,
      todayGenerated: prev.todayGenerated + 1
    }));
  };

  const handleGenerateReport = async (reportId: string) => {
    try {
      setGeneratingReports(prev => new Set([...prev, reportId]));
      const { startDate, endDate } = getDateRangeForAPI();
      
      const report = await supportService.generateReport(reportId, { startDate, endDate });
      
      // Save to history
      saveReportToHistory(report);

      // Download the report
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${report.title} generated and downloaded successfully`);
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      toast.error(error.message || 'Failed to generate report');
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
      const { startDate, endDate } = getDateRangeForAPI();
      
      const [analytics, teamPerformance] = await Promise.all([
        supportService.getSupportAnalytics({ startDate, endDate }),
        supportService.getTeamPerformance({ startDate, endDate })
      ]);

      const customReport: SupportReport = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'custom-report',
        title: 'Custom Comprehensive Support Report',
        generatedAt: new Date().toISOString(),
        period: { 
          startDate: new Date(startDate), 
          endDate: new Date(endDate) 
        },
        data: {
          analytics,
          teamPerformance,
          summary: {
            totalTickets: analytics.overview.totalTickets,
            resolutionRate: analytics.overview.resolutionRate,
            avgResponseTime: analytics.overview.avgResponseTime,
            teamProductivity: teamPerformance.summary.avgProductivity,
            customerSatisfaction: analytics.overview.customerSatisfaction,
            activeTickets: analytics.overview.activeTickets
          }
        },
        insights: [
          `Generated ${analytics.overview.totalTickets} tickets in the selected period`,
          `Maintained ${Math.round(analytics.overview.resolutionRate)}% resolution rate`,
          `Average response time: ${analytics.overview.avgResponseTime} minutes`,
          `Team productivity average: ${Math.round(teamPerformance.summary.avgProductivity)}%`
        ]
      };

      // Save to history
      saveReportToHistory(customReport);

      // Download the custom report
      const blob = new Blob([JSON.stringify(customReport, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `custom-support-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Custom report generated and downloaded successfully');
    } catch (error: any) {
      console.error('Failed to generate custom report:', error);
      toast.error(error.message || 'Failed to generate custom report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Reports</h1>
          <p className="text-muted-foreground">
            Generate comprehensive support analytics reports with real-time data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleGenerateCustomReport} 
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            <FileBarChart className="w-4 h-4 mr-2" />
            {loading ? 'Generating...' : 'Generate Custom Report'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Report Filters
            </CardTitle>
            <CardDescription>
              Filter and customize your report generation
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
              <DatePickerWithRange 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                placeholder="Select date range"
              />
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Statistics
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available Templates</span>
                  <span className="font-medium">{reportTemplates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Generated</span>
                  <span className="font-medium">{stats.totalGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Today Generated</span>
                  <span className="font-medium">{stats.todayGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Time</span>
                  <span className="font-medium">{stats.avgGenerationTime}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Report Templates
              </CardTitle>
              <CardDescription>
                Pre-configured report templates with real-time data integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center space-x-2 mb-2">
                            {report.icon}
                            <span>{report.name}</span>
                          </CardTitle>
                          <CardDescription className="text-sm leading-relaxed">
                            {report.description}
                          </CardDescription>
                        </div>
                        <Badge className={getCategoryColor(report.category)}>
                          {report.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3 text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{report.frequency}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{report.estimatedTime}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Live Data
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={generatingReports.has(report.id)}
                        >
                          {generatingReports.has(report.id) ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          title="Preview report structure"
                        >
                          <Eye className="w-4 h-4" />
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Reports
                </div>
                <Badge variant="secondary">
                  {recentReports.length} generated
                </Badge>
              </CardTitle>
              <CardDescription>
                Recently generated reports with real-time tracking and download history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentReports.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No reports generated yet
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                    Generate your first report using the templates above to get comprehensive analytics insights.
                  </p>
                  <Button 
                    onClick={handleGenerateCustomReport}
                    variant="outline"
                    disabled={loading}
                  >
                    <FileBarChart className="w-4 h-4 mr-2" />
                    Generate First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentReports.map((report, index) => (
                    <div 
                      key={report.id || index} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {report.title}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <span>
                              Generated {new Date(report.generatedAt).toLocaleDateString('en', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{report.type.replace('-', ' ')}</span>
                          </div>
                          {report.period && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Period: {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="default" 
                          className="bg-green-100 text-green-800 hover:bg-green-200"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Re-download the report
                            const blob = new Blob([JSON.stringify(report, null, 2)], { 
                              type: 'application/json' 
                            });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${report.type}-${new Date(report.generatedAt).toISOString().split('T')[0]}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            toast.success('Report downloaded successfully');
                          }}
                          title="Download report again"
                        >
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