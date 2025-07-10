import { lazy, Suspense, ReactNode } from "react";
import { Switch, Route } from "wouter";
import { ProtectedRoute } from "@/lib/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2 } from "lucide-react";
import { createResilientLazyComponent } from "@/utils/error-recovery";

// Resilient lazy loaded pages with error recovery
const Home = createResilientLazyComponent(() => import("@/pages/home"), "home");
const EventDetails = createResilientLazyComponent(() => import("@/pages/event-details"), "event-details");
const EventMap = createResilientLazyComponent(() => import("@/pages/event-map"), "event-map");
const MapPage = createResilientLazyComponent(() => import("@/pages/map"), "map");
const ListTicket = createResilientLazyComponent(() => import("@/pages/list-ticket"), "list-ticket");
const MyTickets = createResilientLazyComponent(() => import("@/pages/my-tickets"), "my-tickets");
const TicketVerification = createResilientLazyComponent(() => import("@/pages/ticket-verification"), "ticket-verification");
const Profile = createResilientLazyComponent(() => import("@/pages/profile"), "profile");
const Login = createResilientLazyComponent(() => import("@/pages/login"), "login");
const Register = createResilientLazyComponent(() => import("@/pages/register"), "register");
const CompleteProfile = createResilientLazyComponent(() => import("@/pages/complete-profile"), "complete-profile");
const TermsOfService = createResilientLazyComponent(() => import("@/pages/terms-of-service"), "terms-of-service");
const PrivacyPolicy = createResilientLazyComponent(() => import("@/pages/privacy-policy"), "privacy-policy");
const DataDeletion = createResilientLazyComponent(() => import("@/pages/data-deletion"), "data-deletion");
const NotFound = createResilientLazyComponent(() => import("@/pages/not-found"), "not-found");
const VerificationDemo = createResilientLazyComponent(() => import("@/pages/verification-demo"), "verification-demo");
const EnhancedVerificationPage = createResilientLazyComponent(() => import("@/pages/enhanced-verification"), "enhanced-verification");
const FAQPage = createResilientLazyComponent(() => import("@/pages/FAQPage"), "faq");
const SellerPolicy = createResilientLazyComponent(() => import("@/pages/SellerPolicy"), "seller-policy");
const CityEvents = createResilientLazyComponent(() => import("@/pages/city-events"), "city-events");
const GlobalCities = createResilientLazyComponent(() => import("@/pages/global-cities"), "global-cities");
const HowToSellTickets = createResilientLazyComponent(() => import("@/pages/how-to-sell-tickets"), "how-to-sell-tickets");
const SellPage = createResilientLazyComponent(() => import("@/pages/sell"), "sell");
const WhereToSellTicketsPage = createResilientLazyComponent(() => import("@/pages/where-to-sell-tickets"), "where-to-sell-tickets");
const ResaleBazaar = createResilientLazyComponent(() => import("@/pages/resale-bazaar"), "resale-bazaar");
const TicketResale = createResilientLazyComponent(() => import("@/pages/ticket-resale"), "ticket-resale");
const SecondHandTickets = createResilientLazyComponent(() => import("@/pages/second-hand-tickets"), "second-hand-tickets");
const ConcertTicketsOnline = createResilientLazyComponent(() => import("@/pages/concert-tickets-online"), "concert-tickets-online");
const EmailTest = createResilientLazyComponent(() => import("@/pages/EmailTest"), "email-test");
const SendGridSetup = createResilientLazyComponent(() => import("@/pages/SendGridSetup"), "sendgrid-setup");
const PrivacySettings = createResilientLazyComponent(() => import("@/pages/privacy-settings"), "privacy-settings");
const OAuthTest = createResilientLazyComponent(() => import("@/pages/oauth-test"), "oauth-test");

// Dashboard components with resilient loading
const VerificationReport = createResilientLazyComponent(() => import("@/pages/verification-report"), "verification-report");
const PopularityDashboard = createResilientLazyComponent(() => import("@/pages/popularity-dashboard"), "popularity-dashboard");
const GEOPerformanceDashboard = createResilientLazyComponent(() => import("@/pages/geo-performance-dashboard"), "geo-performance-dashboard");

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
      <LazyProtectedRoute path="/list-ticket" component={ListTicket} />
      <LazyProtectedRoute path="/my_tickets" component={MyTickets} />
      
      {/* Verification */}
      <LazyRoute path="/ticket-verification" component={TicketVerification} />
      <LazyRoute path="/verification-demo" component={VerificationDemo} />
      <LazyRoute path="/verification-report/:ticketId" component={VerificationReport} />
      <LazyProtectedRoute path="/enhanced-verification" component={EnhancedVerificationPage} />
      <LazyProtectedRoute path="/ticket/verify/:ticketId" component={TicketVerification} />
      
      {/* User profile */}
      <LazyProtectedRoute path="/profile" component={Profile} />
      <LazyProtectedRoute path="/privacy-settings" component={PrivacySettings} />
      
      {/* Information pages */}
      <LazyRoute path="/sell" component={SellPage} />
      <LazyRoute path="/where-to-sell-tickets" component={WhereToSellTicketsPage} />
      <LazyRoute path="/how-to-sell-tickets" component={HowToSellTickets} />
      <LazyRoute path="/resale-bazaar" component={ResaleBazaar} />
      <LazyRoute path="/ticket-resale" component={TicketResale} />
      <LazyRoute path="/second-hand-tickets" component={SecondHandTickets} />
      <LazyRoute path="/concert-tickets-online" component={ConcertTicketsOnline} />
      
      {/* Legal pages */}
      <LazyRoute path="/terms-of-service" component={TermsOfService} />
      <LazyRoute path="/privacy-policy" component={PrivacyPolicy} />
      <LazyRoute path="/data-deletion" component={DataDeletion} />
      <LazyRoute path="/faq" component={FAQPage} />
      <LazyRoute path="/seller-policy" component={SellerPolicy} />
      
      {/* Analytics */}
      <LazyRoute path="/popularity" component={PopularityDashboard} />
      <LazyRoute path="/analytics" component={PopularityDashboard} />
      <LazyRoute path="/geo-performance" component={GEOPerformanceDashboard} />
      
      {/* Email Testing */}
      <LazyRoute path="/email-test" component={EmailTest} />
      <LazyRoute path="/sendgrid-setup" component={SendGridSetup} />
      
      {/* OAuth Testing */}
      <LazyRoute path="/oauth-test" component={OAuthTest} />
      
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