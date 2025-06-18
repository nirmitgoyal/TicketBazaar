import { lazy, Suspense, ReactNode } from "react";
import { Switch, Route } from "wouter";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for optimal bundle splitting
const Home = lazy(() => import("@/pages/home"));
const EventDetails = lazy(() => import("@/pages/event-details"));
const EventMap = lazy(() => import("@/pages/event-map"));
const MapPage = lazy(() => import("@/pages/map"));
const ListTicket = lazy(() => import("@/pages/list-ticket"));
const ListTicketGlobal = lazy(() => import("@/pages/list-ticket-global"));
const MyTickets = lazy(() => import("@/pages/my-tickets"));
const TicketVerification = lazy(() => import("@/pages/ticket-verification"));
const Profile = lazy(() => import("@/pages/profile"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const CompleteProfile = lazy(() => import("@/pages/complete-profile"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const DataDeletion = lazy(() => import("@/pages/data-deletion"));
const NotFound = lazy(() => import("@/pages/not-found"));
const VerificationDemo = lazy(() => import("@/pages/verification-demo"));
const EnhancedVerificationPage = lazy(() => import("@/pages/enhanced-verification"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const SellerPolicy = lazy(() => import("@/pages/SellerPolicy"));
const CityEvents = lazy(() => import("@/pages/city-events"));
const GlobalCities = lazy(() => import("@/pages/global-cities"));
const HowToSellTickets = lazy(() => import("@/pages/how-to-sell-tickets"));

// Lazy load dashboard components with fallback handling
const VerificationReport = lazy(() => import("@/pages/verification-report").then(module => ({ 
  default: (module as any).VerificationReport || (module as any).default || (() => <div>Page not found</div>)
})));
const PopularityDashboard = lazy(() => import("@/pages/popularity-dashboard").then(module => ({ 
  default: (module as any).PopularityDashboard || (module as any).default || (() => <div>Page not found</div>)
})));

/**
 * Enhanced loading component with error boundary
 */
function PageLoader({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">Failed to load page</div>
            <button 
              onClick={() => window.location.reload()} 
              className="text-blue-600 underline"
            >
              Refresh page
            </button>
          </div>
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-lg">Loading page...</span>
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

/**
 * Protected route wrapper with lazy loading
 */
function LazyProtectedRoute({ 
  path, 
  component: Component 
}: { 
  path: string; 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
  return (
    <ProtectedRoute
      path={path}
      component={() => (
        <PageLoader>
          <Component />
        </PageLoader>
      )}
    />
  );
}

/**
 * Regular route wrapper with lazy loading
 */
function LazyRoute({ 
  path, 
  component: Component 
}: { 
  path: string; 
  component: React.LazyExoticComponent<React.ComponentType<any>> 
}) {
  return (
    <Route
      path={path}
      component={() => (
        <PageLoader>
          <Component />
        </PageLoader>
      )}
    />
  );
}

/**
 * Main routing component with optimized lazy loading
 */
export function AppRoutes() {
  return (
    <Switch>
      {/* Public routes */}
      <LazyRoute path="/" component={Home} />
      <LazyRoute path="/event/:id" component={EventDetails} />
      <LazyRoute path="/events/map" component={EventMap} />
      <LazyRoute path="/map" component={MapPage} />
      <LazyRoute path="/events/category/:category" component={Home} />
      <LazyRoute path="/cities" component={GlobalCities} />
      <LazyRoute path="/city/:citySlug" component={CityEvents} />
      
      {/* Authentication routes */}
      <LazyRoute path="/auth" component={Login} />
      <LazyRoute path="/login" component={Login} />
      <LazyRoute path="/register" component={Register} />
      <LazyRoute path="/complete-profile" component={CompleteProfile} />
      
      {/* Ticket management */}
      <LazyRoute path="/list-ticket" component={ListTicket} />
      <LazyRoute path="/list-ticket-global" component={ListTicketGlobal} />
      <LazyProtectedRoute path="/my-tickets" component={MyTickets} />
      
      {/* Verification */}
      <LazyRoute path="/ticket-verification" component={TicketVerification} />
      <LazyRoute path="/verification-demo" component={VerificationDemo} />
      <LazyRoute path="/verification-report/:ticketId" component={VerificationReport} />
      <LazyProtectedRoute path="/enhanced-verification" component={EnhancedVerificationPage} />
      <LazyProtectedRoute path="/ticket/verify/:ticketId" component={TicketVerification} />
      
      {/* User profile */}
      <LazyProtectedRoute path="/profile" component={Profile} />
      
      {/* Information pages */}
      <LazyRoute path="/how-to-sell-tickets" component={HowToSellTickets} />
      <LazyRoute path="/sell-ticket" component={HowToSellTickets} />
      <LazyRoute path="/resell-tickets" component={HowToSellTickets} />
      <LazyRoute path="/buy-second-hand-tickets" component={Home} />
      
      {/* Legal pages */}
      <LazyRoute path="/terms-of-service" component={TermsOfService} />
      <LazyRoute path="/privacy-policy" component={PrivacyPolicy} />
      <LazyRoute path="/data-deletion" component={DataDeletion} />
      <LazyRoute path="/faq" component={FAQPage} />
      <LazyRoute path="/seller-policy" component={SellerPolicy} />
      
      {/* Analytics */}
      <LazyRoute path="/popularity" component={PopularityDashboard} />
      <LazyRoute path="/analytics" component={PopularityDashboard} />
      
      {/* Redirect route */}
      <Route path="/map-to-home" component={() => {
        window.location.href = '/';
        return <PageLoader><div>Redirecting...</div></PageLoader>;
      }} />
      
      {/* 404 fallback */}
      <Route path="*" component={() => (
        <PageLoader>
          <NotFound />
        </PageLoader>
      )} />
    </Switch>
  );
}