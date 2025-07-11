/**
 * Auth Guard Component
 * 
 * This component provides route protection based on authentication state.
 */

import { ReactNode } from 'react';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  requireGuest = false,
  redirectTo = '/login',
  fallback,
}: AuthGuardProps) {
  const { isLoading, canAccess } = useAuthGuard({
    requireAuth,
    requireGuest,
    redirectTo,
  });

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (!canAccess) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}