import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Generic API hook for GET requests
export function useApiQuery<T>(
  endpoint: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }
) {
  return useQuery<T>({
    queryKey: [endpoint],
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    cacheTime: options?.cacheTime,
  });
}

// Generic API hook for mutations (POST, PUT, DELETE)
export function useApiMutation<TData, TVariables = unknown>(
  endpoint: string,
  method: "POST" | "PUT" | "DELETE" = "POST",
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
    invalidateQueries?: string[];
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const response = await apiRequest(endpoint, {
        method,
        body: variables ? JSON.stringify(variables) : undefined,
      });
      return response;
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data);
      options?.invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
    onError: options?.onError,
  });
}

// Specific hooks for common operations
export function useEvents() {
  return useApiQuery("/api/events", {
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEventTickets(eventTitle: string, enabled: boolean = true) {
  return useApiQuery(`/api/tickets/event/${encodeURIComponent(eventTitle)}`, {
    enabled: enabled && !!eventTitle,
  });
}

export function useUserTickets(userId: number, enabled: boolean = true) {
  return useApiQuery(`/api/tickets/user/${userId}`, {
    enabled: enabled && !!userId,
  });
}

export function useCreateTicket() {
  return useApiMutation("/api/tickets", "POST", {
    invalidateQueries: ["/api/events", "/api/tickets"],
  });
}

export function useUpdateTicket() {
  return useApiMutation("/api/tickets", "PUT", {
    invalidateQueries: ["/api/events", "/api/tickets"],
  });
}

export function useDeleteTicket() {
  return useApiMutation("/api/tickets", "DELETE", {
    invalidateQueries: ["/api/events", "/api/tickets"],
  });
}