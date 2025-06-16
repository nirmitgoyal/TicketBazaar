import { Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { usePopularityMetrics } from "@/hooks/use-popularity-tracking";

interface UnifiedPopularityMetricsProps {
  ticketId?: number;
  eventId?: number;
  variant?: "inline" | "event";
  className?: string;
}

export default function UnifiedPopularityMetrics({ 
  ticketId, 
  eventId, 
  variant = "inline",
  className = ""
}: UnifiedPopularityMetricsProps) {
  // For ticket-specific metrics
  const { data: ticketMetrics, isLoading: ticketLoading } = usePopularityMetrics(ticketId!);
  
  // For event-level metrics (aggregate from first ticket)
  const { data: eventTickets, isLoading: eventLoading } = useQuery({
    queryKey: ["/api/tickets/event", eventId],
    queryFn: async () => {
      if (!eventId) return [];
      const response = await fetch(`/api/tickets/event/${eventId}`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!eventId && variant === "event",
  });

  const { data: eventMetrics } = useQuery({
    queryKey: ["/api/popularity/metrics", eventTickets?.[0]?.id],
    queryFn: async () => {
      if (!eventTickets?.[0]?.id) return null;
      const response = await fetch(`/api/popularity/metrics/${eventTickets[0].id}`);
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    },
    enabled: !!eventTickets?.[0]?.id && variant === "event",
  });

  const isLoading = variant === "event" ? eventLoading : ticketLoading;
  const metrics = variant === "event" ? eventMetrics : ticketMetrics;

  if (isLoading || !metrics?.viewCount) return null;

  const totalViews = metrics.viewCount.total || 0;
  const uniqueViews = metrics.viewCount.unique || 0;
  const isTrending = metrics.popularity?.trendingFactor && metrics.popularity.trendingFactor > (variant === "event" ? 3 : 5);

  // Don't show if no meaningful data
  if (totalViews === 0) return null;

  const baseClasses = "flex items-center gap-1 text-xs text-textSecondary";
  const variantClasses = variant === "event" ? "mt-1" : "mb-1";

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses} ${className}`}
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Eye className="h-3 w-3" />
      <span className="text-xs">{uniqueViews} unique views</span>
      {isTrending && (
        <TrendingUp className="h-3 w-3 text-orange-500" />
      )}
    </motion.div>
  );
}