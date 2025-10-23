// Test script to verify reports API functionality
import { reportsService } from '@/lib/api/reports';

export async function testReportsAPI() {
  console.log('🧪 Testing Reports API endpoints...');
  
  const testParams = {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'day' as const,
  };

  try {
    // Test Revenue Report
    console.log('Testing Revenue Report...');
    const revenueData = await reportsService.getRevenueReport(testParams);
    console.log('✅ Revenue Report Success:', {
      dataLength: revenueData?.length || 0,
      firstItem: revenueData?.[0] || 'No data',
      totalRevenue: revenueData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0
    });

    // Test Subscription Report
    console.log('Testing Subscription Report...');
    const subscriptionData = await reportsService.getSubscriptionReport(testParams);
    console.log('✅ Subscription Report Success:', {
      dataLength: subscriptionData?.length || 0,
      firstItem: subscriptionData?.[0] || 'No data',
      totalMRR: subscriptionData?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0
    });

    // Test Report Templates
    console.log('Testing Report Templates...');
    const templates = await reportsService.getReportTemplates();
    console.log('✅ Report Templates Success:', {
      templatesCount: templates?.length || 0,
      templateNames: templates?.map((t: any) => t.name) || []
    });

    console.log('🎉 All Reports API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Reports API test failed:', error);
    return false;
  }
}

// Function to be called from browser console or component
(window as any).testReportsAPI = testReportsAPI;