import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

// Optimized query hook with automatic refetch control and caching
export function useOptimizedQuery<T>(
  queryKey: string | string[],
  queryFn?: () => Promise<T>,
  options?: UseQueryOptions<T> & {
    backgroundRefetch?: boolean;
    refetchOnFocus?: boolean;
    cacheTime?: number;
  }
) {
  const lastFetchTime = useRef<number>(0);
  const backgroundRefetch = options?.backgroundRefetch ?? false;
  const refetchOnFocus = options?.refetchOnFocus ?? false;
  
  const query = useQuery<T>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: refetchOnFocus,
    refetchOnMount: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, only on network/5xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });

  // Background refetch logic
  useEffect(() => {
    if (!backgroundRefetch || query.isLoading || query.isError) return;

    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (now - lastFetchTime.current > fiveMinutes) {
      query.refetch();
      lastFetchTime.current = now;
    }
  }, [backgroundRefetch, query.isLoading, query.isError]);

  return {
    ...query,
    // Add convenience methods
    refresh: () => query.refetch(),
    isStale: query.isStale,
    isCached: !query.isLoading && !query.isError && !!query.data,
  };
}

// Specialized hook for paginated data
export function usePaginatedQuery<T>(
  baseQueryKey: string,
  page: number,
  pageSize: number = 20,
  queryFn?: (page: number, pageSize: number) => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useOptimizedQuery<T>(
    [baseQueryKey, `page-${page}`, `size-${pageSize}`],
    () => queryFn ? queryFn(page, pageSize) : Promise.resolve({} as T),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes for paginated data
      ...options,
    }
  );
}

// Hook for real-time data that needs frequent updates
export function useRealTimeQuery<T>(
  queryKey: string | string[],
  queryFn?: () => Promise<T>,
  interval: number = 30000, // 30 seconds default
  options?: UseQueryOptions<T>
) {
  return useOptimizedQuery<T>(
    queryKey,
    queryFn,
    {
      refetchInterval: interval,
      refetchIntervalInBackground: false,
      staleTime: 0, // Always consider stale for real-time data
      backgroundRefetch: true,
      ...options,
    }
  );
}