'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { AreaChart, BarChart, DonutChart } from './charts';
import { formatCurrency } from '../lib/analyticsHelpers';

interface AnalyticsChartsProps {
  timeSeriesData: Record<string, unknown>[];
  topProductsData: Record<string, unknown>[];
  categoryChartData: Record<string, unknown>[];
}

export function AnalyticsCharts({ timeSeriesData, topProductsData, categoryChartData }: AnalyticsChartsProps) {
  const valueFormatter = (value: number) => formatCurrency(value * 100);
  return <>
    <Card>
      <CardHeader><CardTitle>Revenue trend</CardTitle></CardHeader>
      <CardContent><AreaChart className="h-80" data={timeSeriesData} index="date" categories={['revenue']} colors={['blue']} valueFormatter={valueFormatter} /></CardContent>
    </Card>
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Top products by revenue</CardTitle></CardHeader>
        <CardContent><BarChart className="h-80" data={topProductsData} index="name" categories={['revenue']} colors={['emerald']} valueFormatter={valueFormatter} layout="vertical" yAxisWidth={120} /></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Category performance</CardTitle></CardHeader>
        <CardContent><DonutChart className="h-80" data={categoryChartData} category="revenue" index="name" valueFormatter={valueFormatter} colors={['blue', 'emerald', 'violet', 'amber', 'rose', 'cyan', 'indigo', 'pink']} /></CardContent>
      </Card>
    </div>
  </>;
}
