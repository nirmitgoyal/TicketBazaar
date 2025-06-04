import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { FcGoogle } from "react-icons/fc";
import SEO from "@/components/seo";

export default function Login() {
  const { isAuthenticated, googleSignIn } = useAuth();
  const [, navigate] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a return URL in the query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get("returnTo") || "/";
      navigate(returnTo);
    }
  }, [isAuthenticated, navigate]);

  /**
   * Handle Google sign-in process
   */
  const handleGoogleSignIn = async () => {
    console.log("Google sign-in button clicked");
    setLoginError(null);
    setIsSigningIn(true);

    try {
      await googleSignIn();
      // The navigation is handled in the googleSignIn function
      // or by the useEffect hook above when isAuthenticated changes
    } catch (error) {
      console.error("Error in Google sign-in:", error);
      setLoginError(
        (error as Error).message || "Failed to sign in with Google",
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <SEO
        title="Login | Access Your Account - Ticket Bazaar"
        description="Sign in to your Ticket Bazaar account to buy and sell verified tickets for concerts, sports events, and festivals across India. Secure Google authentication."
        keywords="login, sign in, ticket bazaar, user account, Google authentication, secure login"
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
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-11"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
            >
              <FcGoogle className="h-5 w-5" />
              {isSigningIn ? "Signing in..." : "Sign in with Google"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              We only support Google sign-in to ensure the highest level of
              security and convenience.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Separator className="mb-4" />
          <div className="mt-4 text-center text-xs text-muted-foreground">
            By using this service, you agree to our
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
