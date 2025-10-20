"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueReport, useProductRevenueBreakdown } from "@/hooks/use-reports";
import { useDashboardStore } from "@/store/dashboard-store";
import { DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { useMemo } from "react";

export default function RevenuePage() {
  const { dateRange } = useDashboardStore();
  const { data: revenueData, isLoading } = useRevenueReport(dateRange);
  const { data: productRevenueData, isLoading: isProductLoading } = useProductRevenueBreakdown(dateRange);

  // Transform revenue data for charts
  const transformedRevenueData = useMemo(() => {
    if (revenueData?.trends && revenueData.trends.length > 0) {
      console.log('✅ Using real revenue data from backend:', revenueData);
      return revenueData.trends.map(item => ({
        name: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
        value: item.revenue
      }));
    }
    console.log('🔄 No revenue trends data available from backend');
    return [];
  }, [revenueData]);

  // Transform revenue type data
  const transformedRevenueTypeData = useMemo(() => {
    if (revenueData && revenueData.totalRevenue > 0) {
      const total = revenueData.totalRevenue;
      const recurring = revenueData.recurringRevenue || 0;
      const oneTime = revenueData.oneTimeRevenue || 0;
      const services = Math.max(0, total - recurring - oneTime);
      
      return [
        { name: "Recurring", value: Math.round((recurring / total) * 100), color: "#3b82f6" },
        { name: "One-time", value: Math.round((oneTime / total) * 100), color: "#ef4444" },
        { name: "Services", value: Math.round((services / total) * 100), color: "#10b981" },
      ].filter(item => item.value > 0);
    }
    return [];
  }, [revenueData]);

  // Transform product performance data
  const transformedProductData = useMemo(() => {
    if (productRevenueData && typeof productRevenueData === 'object' && 'products' in productRevenueData) {
      const products = (productRevenueData as any).products;
      if (Array.isArray(products)) {
        return products.map((product: any) => ({
          name: product.name,
          value: product.revenue
        }));
      }
    }
    return [];
  }, [productRevenueData]);

  // Calculate AOV trends from revenue data
  const aovTrendsData = useMemo(() => {
    if (revenueData?.trends && revenueData.trends.length > 0) {
      return revenueData.trends.map(item => ({
        date: item.date,
        value: item.transactions > 0 ? item.revenue / item.transactions : 0
      }));
    }
    return [];
  }, [revenueData]);

  // Calculate metrics
  const revenueMetrics = useMemo(() => {
    if (revenueData) {
      return {
        totalRevenue: `$${(revenueData.totalRevenue / 1000).toFixed(1)}K`,
        mrr: `$${(revenueData.recurringRevenue / 1000).toFixed(1)}K`,
        aov: `$${revenueData.averageOrderValue.toFixed(2)}`,
        customers: revenueData.transactions
      };
    }
    
    return {
      totalRevenue: '--',
      mrr: '--',
      aov: '--',
      customers: '--'
    };
  }, [revenueData]);

  return (
    <DashboardShell
      title="Revenue Reports"
      description="Comprehensive revenue analytics and insights"
    >
      <div className="space-y-6">
        {/* Revenue Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueMetrics.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                {revenueData ? "Total revenue from analytics" : "No data available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueMetrics.mrr}</div>
              <p className="text-xs text-muted-foreground">
                {revenueData ? "Monthly recurring revenue" : "No data available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueMetrics.aov}</div>
              <p className="text-xs text-muted-foreground">
                {revenueData ? "Average order value" : "No data available"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof revenueMetrics.customers === 'number' ? revenueMetrics.customers.toLocaleString() : revenueMetrics.customers}</div>
              <p className="text-xs text-muted-foreground">
                {revenueData ? "Total transactions" : "No data available"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Revenue Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BarChart
            data={transformedRevenueData}
            title="Monthly Revenue"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            isLoading={isLoading}
          />
          <DonutChart
            data={transformedRevenueTypeData}
            title="Revenue by Type"
            valueFormatter={(value) => `${value}%`}
            isLoading={isLoading}
          />
        </div>

        {/* Secondary Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            data={aovTrendsData}
            title="Average Order Value Trend"
            valueFormatter={(value) => `$${value.toFixed(2)}`}
            isLoading={isLoading}
          />
          <BarChart
            data={transformedProductData}
            title="Revenue by Product"
            valueFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            orientation="horizontal"
            isLoading={isProductLoading}
          />
        </div>

        {/* Revenue Details */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium text-sm">
                <div>Product</div>
                <div className="text-right">Revenue</div>
                <div className="text-right">Customers</div>
                <div className="text-right">Avg. Revenue/Customer</div>
              </div>
              {productRevenueData && typeof productRevenueData === 'object' && 'products' in productRevenueData ? (
                (productRevenueData as any).products.map((item: any, index: number) => (
                  <div key={item.name || index} className="grid grid-cols-4 gap-4 items-center py-2 border-b">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-right">${item.revenue.toLocaleString()}</div>
                    <div className="text-right">{item.customers.toLocaleString()}</div>
                    <div className="text-right">${item.avgRevenue.toFixed(2)}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isProductLoading ? "Loading product revenue data..." : "No revenue breakdown data available"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}