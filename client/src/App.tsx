import { useEffect } from "react";
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
import { ErrorBoundary } from "@/components/error-boundary";
import { performanceMonitor } from "@/utils/performance";
import ScrollNavigation from "@/components/scroll-navigation";
import { LegalComplianceModal } from "@/components/ui/legal-compliance-modal";
import { CookieConsentBanner } from "@/components/ui/cookie-consent-banner";
import { useLegalCompliance } from "@/hooks/use-legal-compliance";

// Optimized App component with consolidated routing

function App() {
  const [location] = useLocation();
  const { shouldShowModal, hideModal } = useLegalCompliance();

  useEffect(() => {
    // Monitor app performance on location change
    const endTiming = performanceMonitor.startTiming('app-render');
    endTiming();
    
    // Log performance metrics periodically
    const interval = setInterval(() => {
      const memoryUsage = performanceMonitor.getMetrics('memory-usage');
      if (memoryUsage.length > 0) {
        console.log('App Performance:', {
          location,
          memoryMetrics: memoryUsage.slice(-1)[0],
          avgRenderTime: performanceMonitor.getAverageMetric('app-render')
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [location]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to monitoring service
        console.error('App-level error:', error, errorInfo);
        performanceMonitor.recordMetric({
          name: 'app-error',
          value: 1,
          timestamp: Date.now(),
          metadata: { error: error.message, location }
        });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Service Temporarily Unavailable</h1>
              <p className="text-gray-600 mb-4">We're experiencing technical difficulties. Please try again later.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh Application
              </button>
            </div>
          </div>
        }>
          <AuthProvider>
            <WebSocketProvider>
              <AnalyticsProvider>
                <AtmosphereProvider>
                  <HelmetProvider>
                    <SEOConsolidated />
                    <CanonicalUrlManager />
                    <div className="min-h-screen flex flex-col safe-area-top prevent-horizontal-overflow">
                      <ErrorBoundary fallback={
                        <div className="bg-red-50 border border-red-200 p-4 m-4 rounded">
                          <p className="text-red-800">Navigation temporarily unavailable</p>
                        </div>
                      }>
                        <Navigation />
                      </ErrorBoundary>
                      
                      <main className="flex-grow container mx-auto mobile-container py-3 sm:py-6 pt-20 sm:pt-24">
                        <AppRoutes />
                      </main>
                      
                      <ErrorBoundary fallback={
                        <div className="bg-gray-100 p-4 text-center text-gray-600">
                          <p>Footer content unavailable</p>
                        </div>
                      }>
                        <Footer />
                      </ErrorBoundary>
                    </div>
                    <ScrollNavigation />
                    <Toaster />
                    
                    {/* Legal Compliance Modal - shows on first visit or when triggered */}
                    <LegalComplianceModal
                      isOpen={shouldShowModal}
                      onClose={hideModal}
                      showOnFirstVisit={true}
                    />
                    
                    {/* Cookie Consent Banner - shows for users who haven't accepted */}
                    <CookieConsentBanner />
                  </HelmetProvider>
                </AtmosphereProvider>
              </AnalyticsProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;