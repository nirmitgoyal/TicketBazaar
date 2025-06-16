import { useCallback, useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "lodash";

/**
 * Optimized hooks collection to reduce redundant code and improve performance
 */

// Debounced search hook
export function useDebouncedSearch(initialValue = "", delay = 300) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  const debouncedUpdate = useMemo(
    () => debounce((newValue: string) => setDebouncedValue(newValue), delay),
    [delay]
  );

  useEffect(() => {
    debouncedUpdate(value);
    return () => debouncedUpdate.cancel();
  }, [value, debouncedUpdate]);

  return [debouncedValue, setValue] as const;
}

// Optimized ticket fetching with caching
export function useOptimizedTickets(filters?: any) {
  return useQuery({
    queryKey: ["/api/tickets", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value));
          }
        });
      }
      
      const response = await fetch(`/api/tickets?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes (cacheTime renamed to gcTime in v5)
  });
}

// Virtualized list hook for large datasets
export function useVirtualizedList<T>(
  items: T[], 
  containerHeight: number, 
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight]);
  
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return { visibleItems, handleScroll };
}

// Optimized event aggregation hook
export function useEventAggregation(tickets: any[]) {
  return useMemo(() => {
    if (!tickets?.length) return [];
    
    const eventsMap = new Map();
    
    tickets.forEach(ticket => {
      const eventKey = `${ticket.eventTitle}-${ticket.venue}-${ticket.eventDate}`;
      
      if (!eventsMap.has(eventKey)) {
        eventsMap.set(eventKey, {
          ...ticket,
          ticketCount: 0,
          priceRange: { min: ticket.price, max: ticket.price },
          availableTickets: 0,
        });
      }
      
      const event = eventsMap.get(eventKey);
      event.ticketCount++;
      event.priceRange.min = Math.min(event.priceRange.min, ticket.price);
      event.priceRange.max = Math.max(event.priceRange.max, ticket.price);
      
      if (ticket.status === 'available') {
        event.availableTickets++;
      }
    });
    
    return Array.from(eventsMap.values());
  }, [tickets]);
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) { // Log if component takes more than 100ms
        console.warn(`${componentName} render took ${duration.toFixed(2)}ms`);
      }
    };
  });
}

// Memory-efficient image loading hook
export function useOptimizedImage(src: string, placeholder = '/placeholder.svg') {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error };
}