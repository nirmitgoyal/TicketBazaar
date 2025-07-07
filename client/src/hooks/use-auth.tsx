import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

  // Check if there's a session cookie present to avoid unnecessary API calls
  const hasSessionCookie = document.cookie.includes('tb.sid');

  // Fetch the current authenticated user
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<SelectUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // Skip the API call if there's no session cookie
      if (!hasSessionCookie) {
        return null;
      }
      
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
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
    enabled: hasSessionCookie, // Only run query if session cookie exists
  });



  /**
   * Logout mutation
   * Handles server-side session termination
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/logout");
      if (res.status !== 200) {
        const data = await res.json();
        throw new Error(data.message || "Logout failed");
      }
    },
    onSuccess: () => {
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
        isLoading,
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
