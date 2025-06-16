import { lazy, Suspense } from "react";
import { Route } from "wouter";
import { ProtectedRoute } from "@/lib/protected-route";
import { PageTransition } from "@/components/ui/page-transition";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy-loaded components for better performance
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
const VerificationReport = lazy(() => import("@/pages/verification-report"));
const PopularityDashboard = lazy(() => import("@/pages/popularity-dashboard"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="container mx-auto p-4 space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  </div>
);

// Route wrapper with suspense and transitions
const LazyRoute = ({ 
  component: Component, 
  protected: isProtected = false,
  ...props 
}: { 
  component: React.ComponentType; 
  protected?: boolean;
  [key: string]: any;
}) => {
  const WrappedComponent = () => (
    <Suspense fallback={<LoadingFallback />}>
      <PageTransition>
        <Component />
      </PageTransition>
    </Suspense>
  );

  if (isProtected) {
    return <ProtectedRoute {...props} component={WrappedComponent} />;
  }

  return <Route {...props} component={WrappedComponent} />;
};

// Centralized route definitions
export const routes = [
  // Public routes
  { path: "/", component: Home },
  { path: "/event/:id", component: EventDetails },
  { path: "/events/map", component: EventMap },
  { path: "/map", component: MapPage },
  { path: "/events/category/:category", component: Home },
  { path: "/cities", component: GlobalCities },
  { path: "/city/:citySlug", component: CityEvents },
  { path: "/auth", component: Login },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/complete-profile", component: CompleteProfile },
  { path: "/list-ticket", component: ListTicket },
  { path: "/list-ticket-global", component: ListTicketGlobal },
  { path: "/ticket-verification", component: TicketVerification },
  { path: "/verification-demo", component: VerificationDemo },
  { path: "/verification-report/:ticketId", component: VerificationReport },
  { path: "/how-to-sell-tickets", component: HowToSellTickets },
  { path: "/sell-ticket", component: HowToSellTickets },
  { path: "/resell-tickets", component: HowToSellTickets },
  { path: "/buy-second-hand-tickets", component: Home },
  { path: "/terms-of-service", component: TermsOfService },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/data-deletion", component: DataDeletion },
  { path: "/faq", component: FAQPage },
  { path: "/seller-policy", component: SellerPolicy },
  { path: "/popularity", component: PopularityDashboard },
  { path: "/analytics", component: PopularityDashboard },
  
  // Protected routes
  { path: "/my-tickets", component: MyTickets, protected: true },
  { path: "/enhanced-verification", component: EnhancedVerificationPage, protected: true },
  { path: "/ticket/verify/:ticketId", component: TicketVerification, protected: true },
  { path: "/profile", component: Profile, protected: true },
];

// Route components renderer
export const AppRoutes = () => {
  return (
    <>
      {routes.map((route) => (
        <LazyRoute key={route.path} {...route} />
      ))}
      <LazyRoute component={NotFound} />
    </>
  );
};