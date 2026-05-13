import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { neonAuthClient, signOutFromNeonAuth } from "@/lib/neon-auth";

/**
 * Auth context type definition
 */
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logoutMutation: UseMutationResult<void, Error, void>;
};

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication Provider Component
 * Provides authentication state and functions to all child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const neonSession = neonAuthClient.useSession();

  // Note: We can't check for httpOnly cookies via JavaScript, so we always
  // attempt to fetch user data and let the server validate the session
  console.log('[AUTH] Initializing auth provider');

  // Fetch the current authenticated user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/auth/user");
        if (res.status === 401) {
          return null;
        }
        if (!res.ok) {
          return null;
        }
        return await res.json();
      } catch (error) {
        console.warn("Auth check failed:", error);
        return null;
      }
    },
    retry: false,
    throwOnError: false,
    enabled: !neonSession.isPending,
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  useEffect(() => {
    if (!neonSession.isPending) {
      void refetchUser();
    }
  }, [neonSession.data?.user?.id, neonSession.isPending, refetchUser]);

  /**
   * Logout mutation
   * Handles server-side session termination
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const [serverLogout, neonLogout] = await Promise.allSettled([
        apiRequest("POST", "/api/auth/logout"),
        signOutFromNeonAuth(),
      ]);

      if (serverLogout.status === "rejected" && neonLogout.status === "rejected") {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: isLoading || neonSession.isPending,
        error,
        isAuthenticated: !!user,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication state and functions
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
