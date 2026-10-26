import React from 'react';
import { AreaChart, BarChart } from './charts';

interface SparkAreaChartProps {
  data: { date: string; value: number }[];
  color?: string;
  className?: string;
}

export const SparkAreaChart: React.FC<SparkAreaChartProps> = ({
  data,
  color = 'blue',
  className = 'h-12 w-24',
}) => {
  return (
    <AreaChart
      className={className}
      data={data}
      index="date"
      categories={['value']}
      colors={[color as any]}
      showXAxis={false}
      showYAxis={false}
      showGridLines={false}
      showLegend={false}
      showTooltip={false}
      fill="none"
    />
  );
};

interface SparkBarChartProps {
  data: { date: string; value: number }[];
  color?: string;
  className?: string;
}

export const SparkBarChart: React.FC<SparkBarChartProps> = ({
  data,
  color = 'emerald',
  className = 'h-12 w-24',
}) => {
  return (
    <BarChart
      className={className}
      data={data}
      index="date"
      categories={['value']}
      colors={[color as any]}
      showXAxis={false}
      showYAxis={false}
      showGridLines={false}
      showLegend={false}
      showTooltip={false}
    />
  );
};

interface SparkLineData {
  date: string;
  value: number;
}

interface StatCardWithSparkProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  sparkData: SparkLineData[];
  sparkType: 'area' | 'bar';
  color: string;
}

export const StatCardWithSpark: React.FC<StatCardWithSparkProps> = ({
  title,
  value,
  change,
  changeType,
  sparkData,
  sparkType,
  color,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-emerald-700 dark:text-emerald-400';
      case 'negative':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-w-0 rounded-md border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[12px] font-medium text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
          <p className={`mt-1 text-[12px] tabular-nums ${getChangeColor()}`}>
            {change}
          </p>
        </div>
        <div className="ml-4">
          {sparkType === 'area' ? (
            <SparkAreaChart data={sparkData} color={color} />
          ) : (
            <SparkBarChart data={sparkData} color={color} />
          )}
        </div>
      </div>
    </div>
  );
};

interface TrendingStatsProps {
  stats: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'flat';
    sparkData: SparkLineData[];
  }>;
}

export const TrendingStats: React.FC<TrendingStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-md border bg-card md:grid-cols-2 md:divide-y-0 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="min-w-0 px-4 py-3 md:border-r md:border-border md:last:border-r-0"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-medium text-muted-foreground">
              {stat.label}
            </span>
            <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
              {stat.trend === 'up' && (
                <svg className="h-4 w-4 text-emerald-700 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {stat.trend === 'down' && (
                <svg className="h-4 w-4 text-red-700 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {stat.trend === 'flat' && (
                <svg className="h-4 w-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>{stat.trend === 'up' ? 'Up' : stat.trend === 'down' ? 'Down' : 'Flat'}</span>
            </div>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl font-semibold tabular-nums text-foreground">
              {stat.value}
            </span>
            <SparkAreaChart 
              data={stat.sparkData} 
              className="h-8 w-16" 
              color={stat.trend === 'up' ? 'emerald' : stat.trend === 'down' ? 'red' : 'gray'}
            />
          </div>
        </div>
      ))}
    </div>
  );
}; 