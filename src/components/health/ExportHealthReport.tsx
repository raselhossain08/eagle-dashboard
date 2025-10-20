import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { HealthMetrics, HealthHistory } from '@/types/health';

interface ExportHealthReportProps {
  healthData: HealthMetrics;
  historyData?: HealthHistory[];
}

export function ExportHealthReport({ healthData, historyData }: ExportHealthReportProps) {
  const exportToJSON = () => {
    const report = {
      timestamp: new Date().toISOString(),
      systemHealth: healthData,
      history: historyData,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-report-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    const headers = ['Service', 'Status', 'Response Time', 'Timestamp'];
    const csvData = healthData.services.map(service => [
      service.name,
      service.status,
      service.responseTime || 'N/A',
      healthData.lastCheck,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-services-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToJSON}>
        <Download className="h-4 w-4 mr-2" />
        JSON
      </Button>
      <Button variant="outline" size="sm" onClick={exportToCSV}>
        <FileText className="h-4 w-4 mr-2" />
        CSV
      </Button>
    </div>
  );
}