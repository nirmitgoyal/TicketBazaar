import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SEO from "@/components/seo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertCircle } from "lucide-react";
import { debugAuthFlow } from "@/utils/auth-debug";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Check for authentication errors in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  const errorMessage = urlParams.get("message");
  const hasAuthError = error === "authentication_failed";
  const hasInvalidCode = error === "invalid_code";

  // Redirect if already logged in
  useEffect(() => {
    debugAuthFlow("Login page useEffect triggered", {
      isAuthenticated,
      returnTo: urlParams.get("returnTo"),
      error: urlParams.get("error")
    });
    
    if (isAuthenticated) {
      // Check if there's a return URL in the query params
      const returnTo = urlParams.get("returnTo") || "/";
      debugAuthFlow("User authenticated, navigating to:", { returnTo });
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate, urlParams]);

  const handleGoogleSignIn = () => {
    // Preserve the returnTo parameter in the Google OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get("returnTo");
    
    // Store OAuth redirect info in session storage
    debugAuthFlow("Initiating Google OAuth", { returnTo });
    if (returnTo) {
      sessionStorage.setItem("oauth-intended-destination", returnTo);
      sessionStorage.setItem("oauth-redirect-pending", "true");
    }
    
    const googleAuthUrl = returnTo 
      ? `/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`
      : "/api/auth/google";
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <SEO
        title="Login | Access Your Account - Ticket Bazaar"
        description="Sign in to your Ticket Bazaar account to buy and sell verified tickets for concerts, sports events, and festivals across India."
        keywords="login, sign in, ticket bazaar, user account, secure login"
      />
      
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show authentication error if present */}
          {hasAuthError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-800">
                {errorMessage || "Authentication failed. Please try again."}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Show invalid code error if present */}
          {hasInvalidCode && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-sm text-orange-800">
                {errorMessage || "Authorization code is invalid or expired. Please try logging in again."}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Information about requirements */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              To Sell your tickets OR to view seller details, you need to sign in with Google and add your Instagram handle to your profile.
            </AlertDescription>
          </Alert>
          
          {/* Google Sign-in Button following Google's branding guidelines */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-300 shadow-sm"
          >
            <svg 
              className="mr-3 h-5 w-5" 
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Sign in with Google
          </Button>
          
          <div className="text-center text-sm text-gray-600">
            By signing in, you agree to our{" "}
            <a href="/terms-of-service" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}