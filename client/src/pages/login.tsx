import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Ticket, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import SEO from "@/components/seo";
import { SiInstagram } from "react-icons/si";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { trackEvent } = useAnalytics();
  const [loginError, setLoginError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a return URL in the query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get("returnTo") || "/";
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate]);

  // Check for error messages from Instagram auth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    const message = urlParams.get("message");

    if (error === "instagram_denied") {
      setLoginError("Instagram login was cancelled");
    } else if (error === "eligibility") {
      setLoginError(message || "You need at least 50 followers and 1 post to continue");
    } else if (error === "instagram_error") {
      setLoginError("An error occurred during Instagram login. Please try again.");
    } else if (error === "login_failed") {
      setLoginError("Failed to log you in. Please try again.");
    }
  }, []);

  const handleInstagramLogin = () => {
    // Track login attempt
    trackEvent('login_attempt', 'authentication', 'instagram_login');
    
    // Get the return URL if any
    const urlParams = new URLSearchParams(window.location.search);
    const returnTo = urlParams.get("returnTo") || "/";
    
    // Redirect to Instagram OAuth
    window.location.href = `/api/auth/instagram?returnTo=${encodeURIComponent(returnTo)}`;
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <SEO
        title="Login with Instagram | Ticket Bazaar"
        description="Sign in to Ticket Bazaar using your Instagram account to buy and sell verified tickets for concerts, sports events, and festivals across India."
        keywords="instagram login, sign in, ticket bazaar, secure login, social login"
      />
      <div className="flex justify-center mb-6">
        <div className="flex items-center space-x-1">
          <Ticket className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold font-poppins text-primary">
            Ticket Bazaar
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome to Ticket Bazaar</CardTitle>
          <CardDescription className="text-center">
            Login with your Instagram account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Login Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button 
              onClick={handleInstagramLogin}
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white"
              size="lg"
            >
              <SiInstagram className="mr-2 h-5 w-5" />
              Login with Instagram
            </Button>

            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p className="font-medium text-center">Requirements:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>At least 50 followers on Instagram</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>At least 1 post on your account</span>
                </li>
              </ul>
              <p className="text-xs text-center text-muted-foreground mt-2">
                We use Instagram to verify real users and prevent fraud
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Separator className="mb-4" />
          <div className="text-center text-xs text-muted-foreground">
            By logging in, you agree to our
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {" "}
              Terms of Service
            </a>{" "}
            and
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {" "}
              Privacy Policy
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}