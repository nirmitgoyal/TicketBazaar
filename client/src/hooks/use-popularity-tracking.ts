import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useEffect, useRef } from "react";

interface PopularityMetrics {
  popularity?: {
    totalViews: number;
    uniqueViews: number;
    viewsToday: number;
    viewsThisWeek: number;
    viewsThisMonth: number;
    popularityScore: number;
    trendingFactor: number;
    lastViewedAt?: string;
  };
  viewCount: {
    total: number;
    unique: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export function usePopularityMetrics(ticketId: number) {
  return useQuery<PopularityMetrics>({
    queryKey: [`/api/popularity/metrics/${ticketId}`],
    enabled: !!ticketId,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useTrackTicketView() {
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const response = await apiRequest("POST", "/api/popularity/track-view", {
        ticketId,
      });
      return response.json();
    },
    onSuccess: (_, ticketId) => {
      // Invalidate popularity metrics for this ticket
      queryClient.invalidateQueries({ 
        queryKey: [`/api/popularity/metrics/${ticketId}`] 
      });
      
      // Invalidate popular and trending tickets lists
      queryClient.invalidateQueries({ 
        queryKey: ["/api/popularity/popular"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/popularity/trending"] 
      });
    },
  });
}

export function useAutoTrackView(ticketId: number, options?: {
  delay?: number;
  enabled?: boolean;
}) {
  const { delay = 2000, enabled = true } = options || {};
  const trackView = useTrackTicketView();
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || !ticketId || hasTracked.current) return;

    const timer = setTimeout(() => {
      if (!hasTracked.current) {
        trackView.mutate(ticketId);
        hasTracked.current = true;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [ticketId, enabled, delay, trackView]);

  // Reset tracking when ticket changes
  useEffect(() => {
    hasTracked.current = false;
  }, [ticketId]);

  return {
    isTracking: trackView.isPending,
    hasTracked: hasTracked.current,
  };
}

export function usePopularTickets(limit = 20) {
  return useQuery({
    queryKey: ["/api/popularity/popular", limit],
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useTrendingTickets(limit = 20) {
  return useQuery({
    queryKey: ["/api/popularity/trending", limit],
    staleTime: 30000, // Cache for 30 seconds
  });
}

export function usePopularityAnalytics() {
  return useQuery({
    queryKey: ["/api/popularity/analytics"],
    staleTime: 120000, // Cache for 2 minutes
  });
}

export function useRefreshPopularity() {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/popularity/refresh");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all popularity-related queries
      queryClient.invalidateQueries({ 
        queryKey: ["/api/popularity"] 
      });
    },
  });
}