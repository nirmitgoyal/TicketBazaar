import { Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { usePopularityMetrics } from "@/hooks/use-popularity-tracking";

interface PopularityMetricsInlineProps {
  ticketId: number;
}

export function PopularityMetricsInline({ ticketId }: PopularityMetricsInlineProps) {
  const { data: metrics, isLoading } = usePopularityMetrics(ticketId);

  if (isLoading || !metrics?.viewCount) return null;

  const totalViews = metrics.viewCount.total || 0;
  const uniqueViews = metrics.viewCount.unique || 0;
  const isTrending = metrics.popularity?.trendingFactor && metrics.popularity.trendingFactor > 5;

  // Don't show if no views
  if (totalViews === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-3 text-xs text-textSecondary mb-2"
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* View Count */}
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3" />
        <span>{totalViews} view{totalViews !== 1 ? 's' : ''}</span>
      </div>

      {/* Trending Indicator */}
      {isTrending && (
        <div className="flex items-center gap-1 text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span>Trending</span>
        </div>
      )}

      {/* Unique Views Indicator */}
      {uniqueViews > 1 && (
        <div className="text-primary">
          <span>{uniqueViews} unique</span>
        </div>
      )}
    </motion.div>
  );
}