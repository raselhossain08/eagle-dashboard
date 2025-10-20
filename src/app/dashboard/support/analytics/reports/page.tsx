'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, FileText, BarChart3, Users, MessageSquare } from 'lucide-react';
import { useState } from 'react';

const reportTemplates = [
  {
    id: 1,
    name: 'Weekly Support Summary',
    description: 'Overview of support performance and key metrics for the week',
    category: 'performance',
    frequency: 'weekly',
    lastGenerated: '2024-01-15'
  },
  {
    id: 2,
    name: 'Customer Satisfaction Report',
    description: 'Detailed analysis of customer feedback and satisfaction scores',
    category: 'satisfaction',
    frequency: 'monthly',
    lastGenerated: '2024-01-10'
  },
  {
    id: 3,
    name: 'Team Performance Review',
    description: 'Individual and team performance metrics and trends',
    category: 'performance',
    frequency: 'monthly',
    lastGenerated: '2024-01-05'
  },
  {
    id: 4,
    name: 'Ticket Volume Analysis',
    description: 'Analysis of ticket volume trends and patterns',
    category: 'volume',
    frequency: 'weekly',
    lastGenerated: '2024-01-14'
  },
  {
    id: 5,
    name: 'Impersonation Audit Report',
    description: 'Security audit of all impersonation sessions',
    category: 'security',
    frequency: 'monthly',
    lastGenerated: '2024-01-01'
  },
  {
    id: 6,
    name: 'SLA Compliance Report',
    description: 'Service Level Agreement compliance and performance',
    category: 'compliance',
    frequency: 'weekly',
    lastGenerated: '2024-01-13'
  }
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState('last-week');

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

  const handleGenerateReport = (reportId: number) => {
    console.log('Generating report:', reportId);
    // Implement report generation logic
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
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Generate Custom Report
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
                  <span>Total Reports</span>
                  <span className="font-medium">6</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated This Month</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span>Scheduled Reports</span>
                  <span className="font-medium">3</span>
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
                          Last: {new Date(report.lastGenerated).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleGenerateReport(report.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Generate
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
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Weekly Support Summary</div>
                      <div className="text-sm text-muted-foreground">
                        Generated on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="default">Completed</Badge>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold">Customer Satisfaction Report</div>
                      <div className="text-sm text-muted-foreground">
                        Generated on {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Processing</Badge>
                    <Button variant="outline" size="sm" disabled>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}