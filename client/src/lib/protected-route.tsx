import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

  // In development, allow access even if not authenticated to streamline local testing
  if (!user && import.meta.env.MODE === 'production') {
          return (
            <Redirect to={`/login?returnTo=${encodeURIComponent(location)}`} />
          );
        }

        return <Component />;
      }}
    </Route>
  );
}
