import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";
import { userLoginSchema } from "@shared/schema";
import { z } from "zod";

export default function Login() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { trackEvent, trackUserAction } = useAnalytics();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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

  const loginMutation = useMutation({
    mutationFn: async (loginData: z.infer<typeof userLoginSchema>) => {
      // Track login attempt
      trackEvent('login_attempt', 'authentication', 'email_login');
      
      const response = await apiRequest("POST", "/api/auth/login", loginData);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      // Track successful login
      trackUserAction('login', {
        method: 'email'
      });
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      const urlParams = new URLSearchParams(window.location.search);
      const returnTo = urlParams.get("returnTo") || "/";
      navigate(returnTo);
    },
    onError: (error: Error) => {
      // Track login failure
      trackEvent('login_failed', 'authentication', error.message);
      
      setLoginError(error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const validatedData = userLoginSchema.parse(formData);
      loginMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setLoginError(error.errors[0].message);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <SEO
        title="Login | Access Your Account - Ticket Bazaar"
        description="Sign in to your Ticket Bazaar account to buy and sell verified tickets for concerts, sports events, and festivals across India."
        keywords="login, sign in, ticket bazaar, user account, secure login"
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
            Enter your credentials to access your account
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary hover:underline"
              >
                Sign up
              </button>
            </span>
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
