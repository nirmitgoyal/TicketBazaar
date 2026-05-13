import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getNeonAuthToken } from "./neon-auth";

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

export async function apiFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const protocolAwareUrl = getProtocolAwareUrl(url);
  const headers = new Headers(init.headers);
  const token = await getNeonAuthToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(protocolAwareUrl, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const headers = new Headers(data ? { "Content-Type": "application/json" } : {});
    const res = await apiFetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = getProtocolAwareUrl(queryKey[0] as string);
    const res = await apiFetch(url);

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
