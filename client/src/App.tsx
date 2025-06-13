import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAnalytics, AnalyticsProvider } from "@/hooks/use-analytics";
import { WebSocketProvider } from "@/hooks/use-websocket";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/ui/page-transition";
import { AtmosphereProvider } from "@/contexts/AtmosphereContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HelmetProvider } from "@/components/helmet-manager";
import { CanonicalUrlManager } from "@/components/canonical-url-manager";

// Pages
import Home from "@/pages/home";
import EventDetails from "@/pages/event-details";
import EventMap from "@/pages/event-map";
import MapPage from "@/pages/map";
import ListTicket from "@/pages/list-ticket";
import ListTicketGlobal from "@/pages/list-ticket-global";
import MyTickets from "@/pages/my-tickets";
import TicketVerification from "@/pages/ticket-verification";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";
import CompleteProfile from "@/pages/complete-profile";
import TermsOfService from "@/pages/terms-of-service";
import PrivacyPolicy from "@/pages/privacy-policy";
import DataDeletion from "@/pages/data-deletion";
import NotFound from "@/pages/not-found";
import VerificationDemo from "@/pages/verification-demo";
import FAQPage from "@/pages/FAQPage";
import SellerPolicy from "@/pages/SellerPolicy";
import CityEvents from "@/pages/city-events";
import GlobalCities from "@/pages/global-cities";
import HowToSellTickets from "@/pages/how-to-sell-tickets";

// Components
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/ui/footer";

/**
 * Route wrapper for page transitions
 */
function RouteWithTransition({
  component: Component,
  ...rest
}: {
  component: React.ComponentType;
  [key: string]: any;
}) {
  return (
    <Route
      {...rest}
      component={(props: any) => (
        <PageTransition>
          <Component {...props} />
        </PageTransition>
      )}
    />
  );
}

/**
 * Protected route with animation support
 */
function AnimatedProtectedRoute({
  component: Component,
  path,
}: {
  component: React.ComponentType;
  path: string;
}) {
  return (
    <ProtectedRoute
      path={path}
      component={() => (
        <PageTransition>
          <Component />
        </PageTransition>
      )}
    />
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  const RedirectFromMapToHome = () => {
    useEffect(() => {
      document.body.classList.add("page-transitioning");
      const timer = setTimeout(() => {
        document.body.classList.remove("page-transitioning");
        window.scrollTo(0, 0);
        setLocation("/", { replace: true });
      }, 250);
      return () => {
        clearTimeout(timer);
        document.body.classList.remove("page-transitioning");
      };
    }, [setLocation]);

    return (
      <div className="transition-page min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="text-primary animate-pulse">Returning to home...</div>
      </div>
    );
  };

  return (
    <Switch location={location}>
      <Route path="/" component={Home} />
      <Route path="/event/:id" component={EventDetails} />
      <Route path="/events/map" component={EventMap} />
      <Route path="/map" component={MapPage} />
      <Route path="/events/category/:category" component={Home} />
      <Route path="/cities" component={GlobalCities} />
      <Route path="/city/:citySlug" component={CityEvents} />
      <Route path="/auth" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/complete-profile" component={CompleteProfile} />
      <Route path="/list-ticket" component={ListTicket} />
      <Route path="/list-ticket-global" component={ListTicketGlobal} />
      <ProtectedRoute path="/my-tickets" component={MyTickets} />
      <Route path="/ticket-verification" component={TicketVerification} />
      <Route path="/verification-demo" component={VerificationDemo} />
      <ProtectedRoute path="/ticket/verify/:ticketId" component={TicketVerification} />
      <ProtectedRoute path="/profile" component={Profile} />
      <Route path="/how-to-sell-tickets" component={HowToSellTickets} />
      <Route path="/sell-ticket" component={HowToSellTickets} />
      <Route path="/resell-tickets" component={HowToSellTickets} />
      <Route path="/buy-second-hand-tickets" component={Home} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/data-deletion" component={DataDeletion} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/seller-policy" component={SellerPolicy} />
      <Route path="/map-to-home" component={RedirectFromMapToHome} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <AnalyticsProvider>
              <AtmosphereProvider>
                <HelmetProvider>
                  <CanonicalUrlManager />
                  <div className="min-h-screen flex flex-col safe-area-top">
                    <Navigation />
                    <main className="flex-grow container mx-auto mobile-container py-3 sm:py-6">
                      <Router />
                    </main>
                    <Footer />
                  </div>
                  <Toaster />
                </HelmetProvider>
              </AtmosphereProvider>
            </AnalyticsProvider>
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;