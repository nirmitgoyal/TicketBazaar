/**
 * useAuth Hook
 * 
 * This hook provides authentication state and actions to components.
 * It uses React Context and React Query for efficient state management.
 */

import { createContext, useContext, ReactNode, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@ticketbazaar/types';
import { AuthContextType, AuthState, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/AuthService';
import { useToast } from '@/hooks/use-toast';

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user query
  const {
    data: user,
    isLoading,
    error,
    refetch: refreshUser,
  } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
      toast({
        title: 'Registration successful',
        description: `Welcome to TicketBazaar, ${user.fullName}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear(); // Clear all cached data
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'user'], user);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Profile update failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Actions
  const login = useCallback(async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    await updateProfileMutation.mutateAsync(data);
  }, [updateProfileMutation]);

  const contextValue: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error: error?.message || null,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * 
 * This hook provides access to authentication state and actions.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}