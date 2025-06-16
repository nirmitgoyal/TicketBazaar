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
      className="text-xs text-textSecondary mb-1"
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="text-xs">{uniqueViews} unique views</span>
    </motion.div>
  );
}