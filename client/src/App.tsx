import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { WebSocketProvider } from "@/hooks/use-websocket";

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <WebSocketProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="flex-grow container mx-auto px-4 py-6">
                <Switch>
                  {/* Main routes */}
                  <Route path="/" component={Home} />
                  <Route path="/event/:id" component={EventDetails} />
                  <Route path="/events/map" component={EventMap} />
                  <Route path="/map" component={MapPage} />

                  {/* Category and city routes */}
                  <Route path="/events/category/:category" component={Home} />
                  <Route path="/cities" component={GlobalCities} />
                  <Route path="/city/:citySlug" component={CityEvents} />

                  {/* Auth routes */}
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
                  <Route path="/complete-profile" component={CompleteProfile} />

                  {/* Ticket routes */}
                  <Route path="/list-ticket" component={ListTicket} />
                  <Route path="/list-ticket-global" component={ListTicketGlobal} />
                  <ProtectedRoute path="/my-tickets" component={MyTickets} />
                  <Route path="/ticket-verification" component={TicketVerification} />
                  <Route path="/verification-demo" component={VerificationDemo} />
                  <ProtectedRoute path="/ticket/verify/:ticketId" component={TicketVerification} />

                  {/* Profile */}
                  <ProtectedRoute path="/profile" component={Profile} />

                  {/* Info pages */}
                  <Route path="/how-to-sell-tickets" component={HowToSellTickets} />
                  <Route path="/sell-ticket" component={HowToSellTickets} />
                  <Route path="/resell-tickets" component={HowToSellTickets} />
                  <Route path="/buy-second-hand-tickets" component={Home} />

                  {/* Legal pages */}
                  <Route path="/terms-of-service" component={TermsOfService} />
                  <Route path="/privacy-policy" component={PrivacyPolicy} />
                  <Route path="/data-deletion" component={DataDeletion} />
                  <Route path="/faq" component={FAQPage} />
                  <Route path="/seller-policy" component={SellerPolicy} />

                  <Route component={NotFound} />
                </Switch>
              </main>
              <Footer />
            </div>
            <Toaster />
          </WebSocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;