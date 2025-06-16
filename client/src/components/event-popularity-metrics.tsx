import { Eye, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

interface EventPopularityMetricsProps {
  eventId: number;
}

export function EventPopularityMetrics({ eventId }: EventPopularityMetricsProps) {
  // Fetch tickets for this event to calculate aggregate popularity
  const { data: eventTickets, isLoading } = useQuery({
    queryKey: ["/api/tickets/event", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/event/${eventId}`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Fetch popularity data for the first ticket of this event as a proxy
  const { data: popularityData } = useQuery({
    queryKey: ["/api/popularity/metrics", eventTickets?.[0]?.id],
    queryFn: async () => {
      if (!eventTickets?.[0]?.id) return null;
      const response = await fetch(`/api/popularity/metrics/${eventTickets[0].id}`);
      if (!response.ok) return null;
      const result = await response.json();
      return result.data;
    },
    enabled: !!eventTickets?.[0]?.id,
  });

  if (isLoading || !eventTickets?.length || !popularityData?.viewCount) return null;

  const totalViews = popularityData.viewCount.total || 0;
  const uniqueViews = popularityData.viewCount.unique || 0;
  const ticketCount = eventTickets.length;
  const isTrending = popularityData.popularity?.trendingFactor && popularityData.popularity.trendingFactor > 3;

  // Don't show if no meaningful data
  if (totalViews === 0 && ticketCount === 0) return null;

  return (
    <motion.div
      className="flex items-center gap-1 text-xs text-textSecondary mt-1"
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Eye className="h-3 w-3" />
      <span className="text-xs">{uniqueViews} unique views</span>
    </motion.div>
  );
}