/**
 * Unified Metrics Component
 * Consolidates all metrics functionality into a single, flexible component
 * Replaces: event-popularity-metrics.tsx, popularity-metrics-inline.tsx, 
 *           popularity-metrics.tsx, unified-popularity-metrics.tsx
 */

import React from 'react';
import { Eye, TrendingUp, Users, Clock, Star, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export type MetricType = 
  | 'popularity'
  | 'views'
  | 'engagement'
  | 'trending'
  | 'trust'
  | 'response'
  | 'custom';

export type DisplayMode = 
  | 'inline'
  | 'card'
  | 'compact'
  | 'detailed'
  | 'progress';

export interface MetricData {
  label: string;
  value: number | string;
  icon?: React.ElementType;
  color?: string;
  tooltip?: string;
  suffix?: string;
  prefix?: string;
  progress?: number; // 0-100
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

export interface UnifiedMetricsProps {
  type?: MetricType;
  mode?: DisplayMode;
  metrics?: MetricData[];
  className?: string;
  showLabels?: boolean;
  animated?: boolean;
  // Type-specific props
  popularityScore?: number;
  viewCount?: number;
  contactCount?: number;
  responseRate?: number;
  responseTime?: number;
  trustScore?: number;
  trending?: boolean;
  sellingFast?: boolean;
}

const defaultMetricIcons: Record<string, React.ElementType> = {
  views: Eye,
  popularity: TrendingUp,
  engagement: Users,
  time: Clock,
  rating: Star,
  activity: Activity
};

const defaultMetricColors: Record<string, string> = {
  high: 'text-green-600',
  medium: 'text-yellow-600',
  low: 'text-red-600',
  neutral: 'text-gray-600'
};

export const UnifiedMetrics: React.FC<UnifiedMetricsProps> = ({
  type = 'custom',
  mode = 'inline',
  metrics = [],
  className,
  showLabels = true,
  animated = true,
  popularityScore,
  viewCount,
  contactCount,
  responseRate,
  responseTime,
  trustScore,
  trending,
  sellingFast
}) => {
  // Generate metrics based on type
  const getMetricsForType = (): MetricData[] => {
    switch (type) {
      case 'popularity':
        return [
          {
            label: 'Popularity',
            value: popularityScore || 0,
            icon: TrendingUp,
            suffix: '%',
            progress: popularityScore,
            color: getColorForScore(popularityScore || 0),
            tooltip: 'Based on views, saves, and engagement'
          },
          {
            label: 'Views',
            value: viewCount || 0,
            icon: Eye,
            tooltip: 'Total number of views'
          },
          {
            label: 'Inquiries',
            value: contactCount || 0,
            icon: Users,
            tooltip: 'Number of contact requests'
          }
        ];
      
      case 'trust':
        return [
          {
            label: 'Trust Score',
            value: trustScore || 0,
            icon: Star,
            suffix: '/100',
            progress: trustScore,
            color: getColorForScore(trustScore || 0),
            tooltip: 'Overall seller trust rating'
          }
        ];
      
      case 'response':
        return [
          {
            label: 'Response Rate',
            value: responseRate || 0,
            icon: Activity,
            suffix: '%',
            progress: responseRate,
            tooltip: 'Percentage of inquiries responded to'
          },
          {
            label: 'Avg Response Time',
            value: formatResponseTime(responseTime || 0),
            icon: Clock,
            tooltip: 'Average time to respond to inquiries'
          }
        ];
      
      default:
        return metrics;
    }
  };
  
  const metricsToDisplay = type === 'custom' ? metrics : getMetricsForType();
  
  // Render based on display mode
  switch (mode) {
    case 'inline':
      return <InlineMetrics metrics={metricsToDisplay} className={className} showLabels={showLabels} />;
    
    case 'card':
      return <CardMetrics metrics={metricsToDisplay} className={className} animated={animated} />;
    
    case 'compact':
      return <CompactMetrics metrics={metricsToDisplay} className={className} trending={trending} sellingFast={sellingFast} />;
    
    case 'detailed':
      return <DetailedMetrics metrics={metricsToDisplay} className={className} animated={animated} />;
    
    case 'progress':
      return <ProgressMetrics metrics={metricsToDisplay} className={className} animated={animated} />;
    
    default:
      return null;
  }
};

// Display mode components

const InlineMetrics: React.FC<{
  metrics: MetricData[];
  className?: string;
  showLabels?: boolean;
}> = ({ metrics, className, showLabels }) => {
  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon || defaultMetricIcons.views;
        return (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5">
                  <Icon className={cn('w-4 h-4', metric.color || 'text-gray-500')} />
                  {showLabels && <span className="text-gray-600">{metric.label}:</span>}
                  <span className="font-medium">
                    {metric.prefix}{metric.value}{metric.suffix}
                  </span>
                </div>
              </TooltipTrigger>
              {metric.tooltip && (
                <TooltipContent>
                  <p>{metric.tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

const CardMetrics: React.FC<{
  metrics: MetricData[];
  className?: string;
  animated?: boolean;
}> = ({ metrics, className, animated }) => {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon || defaultMetricIcons.views;
        return (
          <motion.div
            key={index}
            initial={animated ? { opacity: 0, y: 20 } : undefined}
            animate={animated ? { opacity: 1, y: 0 } : undefined}
            transition={animated ? { delay: index * 0.1 } : undefined}
            className="bg-white rounded-lg border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{metric.label}</span>
              <Icon className={cn('w-5 h-5', metric.color || 'text-gray-400')} />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {metric.prefix}{metric.value}{metric.suffix}
              </span>
              {metric.trend && (
                <TrendIndicator trend={metric.trend} value={metric.trendValue} />
              )}
            </div>
            {metric.progress !== undefined && (
              <Progress value={metric.progress} className="h-2" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const CompactMetrics: React.FC<{
  metrics: MetricData[];
  className?: string;
  trending?: boolean;
  sellingFast?: boolean;
}> = ({ metrics, className, trending, sellingFast }) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {metrics.slice(0, 3).map((metric, index) => {
        const Icon = metric.icon || defaultMetricIcons.views;
        return (
          <Badge key={index} variant="secondary" className="text-xs">
            <Icon className="w-3 h-3 mr-1" />
            {metric.value}{metric.suffix}
          </Badge>
        );
      })}
      {trending && (
        <Badge variant="default" className="text-xs bg-orange-500">
          <TrendingUp className="w-3 h-3 mr-1" />
          Trending
        </Badge>
      )}
      {sellingFast && (
        <Badge variant="destructive" className="text-xs">
          <Activity className="w-3 h-3 mr-1" />
          Selling Fast
        </Badge>
      )}
    </div>
  );
};

const DetailedMetrics: React.FC<{
  metrics: MetricData[];
  className?: string;
  animated?: boolean;
}> = ({ metrics, className, animated }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon || defaultMetricIcons.views;
        return (
          <motion.div
            key={index}
            initial={animated ? { opacity: 0, x: -20 } : undefined}
            animate={animated ? { opacity: 1, x: 0 } : undefined}
            transition={animated ? { delay: index * 0.1 } : undefined}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-full bg-white', metric.color?.replace('text-', 'text-'))}>
                <Icon className={cn('w-5 h-5', metric.color || 'text-gray-600')} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="font-semibold">
                  {metric.prefix}{metric.value}{metric.suffix}
                </p>
              </div>
            </div>
            {metric.progress !== undefined && (
              <div className="w-32">
                <Progress value={metric.progress} className="h-2" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

const ProgressMetrics: React.FC<{
  metrics: MetricData[];
  className?: string;
  animated?: boolean;
}> = ({ metrics, className, animated }) => {
  // Filter only metrics with progress values
  const progressMetrics = metrics.filter(m => m.progress !== undefined);
  
  return (
    <div className={cn('space-y-3', className)}>
      {progressMetrics.map((metric, index) => (
        <motion.div
          key={index}
          initial={animated ? { opacity: 0, scaleX: 0 } : undefined}
          animate={animated ? { opacity: 1, scaleX: 1 } : undefined}
          transition={animated ? { delay: index * 0.1, duration: 0.5 } : undefined}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">{metric.label}</span>
            <span className="text-sm text-gray-600">
              {metric.value}{metric.suffix}
            </span>
          </div>
          <Progress 
            value={metric.progress} 
            className="h-2"
          />
        </motion.div>
      ))}
    </div>
  );
};

// Helper components

const TrendIndicator: React.FC<{
  trend: 'up' | 'down' | 'stable';
  value?: string;
}> = ({ trend, value }) => {
  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  };
  
  return (
    <span className={cn('text-xs font-medium', trendClasses[trend])}>
      {trend === 'up' && '↑'}
      {trend === 'down' && '↓'}
      {trend === 'stable' && '→'}
      {value && ` ${value}`}
    </span>
  );
};

// Helper functions

function getColorForScore(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Export convenience hooks

export const usePopularityMetrics = (ticketId: number) => {
  const [metrics, setMetrics] = React.useState<{
    popularityScore: number;
    viewCount: number;
    contactCount: number;
  }>({
    popularityScore: 0,
    viewCount: 0,
    contactCount: 0
  });
  
  React.useEffect(() => {
    // Fetch metrics from API
    fetch(`/api/popularity/metrics/${ticketId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMetrics(data.data);
        }
      })
      .catch(console.error);
  }, [ticketId]);
  
  return metrics;
};