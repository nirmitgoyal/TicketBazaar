import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { debugAuthFlow } from "@/utils/auth-debug";

export function AuthRedirectDebug() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Check if we just came from an OAuth callback
    const referrer = document.referrer;
    const isFromOAuth = referrer.includes('/api/auth/google/callback') || 
                       window.location.search.includes('state=') ||
                       window.location.search.includes('code=');
    
    if (isFromOAuth || location === '/list-ticket') {
      debugAuthFlow("OAuth redirect detected", {
        location,
        referrer,
        isAuthenticated,
        isLoading,
        userEmail: user?.email,
        hasInstagram: !!user?.instagram,
        search: window.location.search
      });
    }
  }, [location, isAuthenticated, isLoading, user]);

  // Track auth state changes
  useEffect(() => {
    debugAuthFlow("Auth state changed", {
      isAuthenticated,
      isLoading,
      userEmail: user?.email,
      hasInstagram: !!user?.instagram,
      location
    });
  }, [isAuthenticated, isLoading, user, location]);

  return null;
}