import { useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { AnalyticsProvider } from "@/hooks/use-analytics";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { AtmosphereProvider } from "@/contexts/AtmosphereContext";
import { HelmetProvider } from "@/components/helmet-manager";
import { CanonicalUrlManager } from "@/components/canonical-url-manager";
import { AppRoutes } from "@/router/routes";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";
import { SEOConsolidated } from "@/components/seo-consolidated";

// Optimized App component with consolidated routing

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <AnalyticsProvider>
            <AtmosphereProvider>
              <HelmetProvider>
                <SEOConsolidated />
                <CanonicalUrlManager />
                <div className="min-h-screen flex flex-col safe-area-top">
                  <Navigation />
                  <main className="flex-grow container mx-auto mobile-container py-3 sm:py-6">
                    <AppRoutes />
                  </main>
                  <Footer />
                </div>
                <Toaster />
              </HelmetProvider>
            </AtmosphereProvider>
          </AnalyticsProvider>
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;