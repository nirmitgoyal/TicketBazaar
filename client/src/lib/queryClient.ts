import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Makes a URL protocol-aware, ensuring it works in both development and production
 * Relative URLs (/api/...) will maintain current protocol (http/https)
 *
 * @param url The URL to make protocol-aware
 * @returns A URL that will work in both HTTP and HTTPS environments
 */
function getProtocolAwareUrl(url: string): string {
  // If it's already an absolute URL, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If it's a relative URL, keep it as is
  // The browser will use the current protocol
  return url;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const protocolAwareUrl = getProtocolAwareUrl(url);

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const res = await fetch(protocolAwareUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    const e: any = error;
    if (e && e.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw e;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = getProtocolAwareUrl(queryKey[0] as string);
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Global defensive shim: some stale client chunks (or cached service worker assets)
// still reference a bare `useQueryClient` identifier (not the imported symbol).
// Expose a safe fallback that returns our singleton. This is idempotent.
try {
  if (typeof globalThis !== 'undefined' && typeof (globalThis as any).useQueryClient === 'undefined') {
    (globalThis as any).useQueryClient = () => queryClient;
  }
  if (typeof window !== 'undefined' && typeof (window as any).useQueryClient === 'undefined') {
    (window as any).useQueryClient = () => queryClient;
  }
} catch { /* no-op */ }
