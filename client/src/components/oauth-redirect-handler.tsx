import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { debugAuthFlow } from "@/utils/auth-debug";

/**
 * Component to handle OAuth redirects
 * Preserves the intended destination after OAuth callback
 */
export function OAuthRedirectHandler() {
  const [, navigate] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check if we're coming from an OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const isOAuthReturn = window.location.pathname === "/" && 
                         (document.referrer.includes("/api/auth/google/callback") ||
                          sessionStorage.getItem("oauth-redirect-pending"));
    
    if (isOAuthReturn) {
      debugAuthFlow("OAuth redirect detected in handler", {
        referrer: document.referrer,
        pathname: window.location.pathname,
        search: window.location.search,
        pendingRedirect: sessionStorage.getItem("oauth-intended-destination")
      });

      // Check if we have a stored destination
      const intendedDestination = sessionStorage.getItem("oauth-intended-destination");
      if (intendedDestination && intendedDestination !== "/") {
        setIsRedirecting(true);
        debugAuthFlow("Redirecting to intended destination", { intendedDestination });
        
        // Clear the stored values
        sessionStorage.removeItem("oauth-redirect-pending");
        sessionStorage.removeItem("oauth-intended-destination");
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate(intendedDestination);
          setIsRedirecting(false);
        }, 100);
      }
    }
  }, [navigate]);

  // Store OAuth redirect info when initiating login
  useEffect(() => {
    const handleOAuthInitiation = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get("returnTo");
      
      if (window.location.pathname === "/login" && returnTo) {
        debugAuthFlow("Storing OAuth intended destination", { returnTo });
        sessionStorage.setItem("oauth-intended-destination", returnTo);
        sessionStorage.setItem("oauth-redirect-pending", "true");
      }
    };

    // Check on mount
    handleOAuthInitiation();
    
    // Listen for navigation events
    window.addEventListener("popstate", handleOAuthInitiation);
    return () => window.removeEventListener("popstate", handleOAuthInitiation);
  }, []);

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
}