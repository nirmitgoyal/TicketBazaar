import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signOutFromFirebase } from "@/lib/firebase";

/**
 * Auth context type definition
 */
type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  logoutMutation: UseMutationResult<void, Error, void>;
  googleSignIn: () => Promise<void>;
};

// Create the auth context
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Authentication Provider Component
 * Provides authentication state and functions to all child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

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
        return await res.json();
      } catch (error) {
        return null;
      }
    },
  });

  /**
   * Sign in with Google
   * Handles both Firebase authentication and server-side session creation
   */
  const googleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      // If user cancelled popup, don't show error or refetch
      if (result === null) {
        return;
      }
      // Authentication is handled in signInWithGoogle
      // We'll refetch the user after successful auth
      await refetchUser();
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({
        title: "Google Sign-in failed",
        description:
          (error as Error).message || "Failed to sign in with Google",
        variant: "destructive",
      });
      throw error;
    }
  };

  /**
   * Logout mutation
   * Handles both server-side session termination and Firebase sign-out
   */
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // First logout from the server
      const res = await apiRequest("POST", "/api/auth/logout");
      if (res.status !== 200) {
        const data = await res.json();
        throw new Error(data.message || "Logout failed");
      }

      // Then sign out from Firebase
      await signOutFromFirebase();
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
        googleSignIn,
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
