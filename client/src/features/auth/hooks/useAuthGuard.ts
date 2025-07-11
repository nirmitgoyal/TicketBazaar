/**
 * useAuthGuard Hook
 * 
 * This hook provides authentication guard functionality for protected routes.
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from './useAuth';

export interface AuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  requireGuest?: boolean;
}

export function useAuthGuard({
  redirectTo = '/login',
  requireAuth = true,
  requireGuest = false,
}: AuthGuardOptions = {}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      navigate(redirectTo);
    } else if (requireGuest && isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, requireAuth, requireGuest, redirectTo, navigate]);

  return {
    isAuthenticated,
    isLoading,
    canAccess: isLoading || (requireAuth ? isAuthenticated : !requireGuest || !isAuthenticated),
  };
}