'use client';

import { Area, AreaChart as RechartsArea, Bar, BarChart as RechartsBar, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SeriesChartProps {
  data: Record<string, unknown>[];
  index: string;
  categories: string[];
  colors?: string[];
  className?: string;
  valueFormatter?: (value: number) => string;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showGridLines?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  fill?: string;
  layout?: 'vertical' | 'horizontal';
  yAxisWidth?: number;
}
const palette: Record<string, string> = { blue: '#2563eb', emerald: '#059669', violet: '#7c3aed', amber: '#d97706', rose: '#e11d48', cyan: '#0891b2', indigo: '#4f46e5', pink: '#db2777' };
const color = (name?: string) => palette[name || 'blue'] || palette.blue;

export function AreaChart({ data, index, categories, colors, className, valueFormatter, showXAxis = true, showYAxis = true, showGridLines = true, showTooltip = true }: SeriesChartProps) {
  return <div className={className}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <RechartsArea data={data}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" vertical={false} />}
        {showXAxis && <XAxis dataKey={index} />}
        {showYAxis && <YAxis tickFormatter={valueFormatter} />}
        {showTooltip && <Tooltip formatter={(value) => valueFormatter ? valueFormatter(Number(value)) : String(value)} />}
        {categories.map((key, i) => <Area key={key} dataKey={key} stroke={color(colors?.[i])} fill={color(colors?.[i])} fillOpacity={0.12} isAnimationActive={false} />)}
      </RechartsArea>
    </ResponsiveContainer>
  </div>;
}

export function BarChart({ data, index, categories, colors, className, valueFormatter, showXAxis = true, showYAxis = true, showGridLines = true, showTooltip = true, layout, yAxisWidth }: SeriesChartProps) {
  const vertical = layout === 'vertical';
  return <div className={className}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <RechartsBar data={data} layout={vertical ? 'vertical' : 'horizontal'}>
        {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
        {showXAxis && <XAxis type={vertical ? 'number' : 'category'} dataKey={vertical ? undefined : index} />}
        {showYAxis && <YAxis type={vertical ? 'category' : 'number'} dataKey={vertical ? index : undefined} width={yAxisWidth} tickFormatter={vertical ? undefined : valueFormatter} />}
        {showTooltip && <Tooltip formatter={(value) => valueFormatter ? valueFormatter(Number(value)) : String(value)} />}
        {categories.map((key, i) => <Bar key={key} dataKey={key} fill={color(colors?.[i])} isAnimationActive={false} />)}
      </RechartsBar>
    </ResponsiveContainer>
  </div>;
}

export function DonutChart({ data, index, category, colors, className, valueFormatter }: Omit<SeriesChartProps, 'categories'> & { category: string }) {
  return <div className={className}>
    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
      <PieChart>
        <Pie data={data} dataKey={category} nameKey={index} innerRadius="55%" outerRadius="80%" isAnimationActive={false}>
          {data.map((_, i) => <Cell key={i} fill={color(colors?.[i % (colors?.length || 1)])} />)}
        </Pie>
        <Tooltip formatter={(value) => valueFormatter ? valueFormatter(Number(value)) : String(value)} />
      </PieChart>
    </ResponsiveContainer>
  </div>;
}
