import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import SEO from "@/components/seo";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Register() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a return URL in the query params
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get("returnTo") || "/";
      navigate(returnTo);
    } else {
      // Redirect to Google OAuth
      window.location.href = "/api/auth/google";
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <SEO
        title="Sign Up | Create Account - Ticket Bazaar"
        description="Join Ticket Bazaar to buy and sell verified tickets for concerts, sports events, and festivals across India."
        keywords="sign up, register, create account, ticket bazaar"
      />
      
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Creating account...</CardTitle>
          <CardDescription className="text-center">
            Redirecting to secure authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}