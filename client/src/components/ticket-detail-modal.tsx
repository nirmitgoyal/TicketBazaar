import {
  CheckCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Users,
  CreditCard,
  Share2,
  Heart,
  MessageCircle,
  ExternalLink,
  Info,
  Star,
  Badge as BadgeIcon,
  Globe,
  Package,
  Eye,
  TrendingUp,
  Zap,
  Instagram,
  User as UserIcon,
} from "lucide-react";
import { SiGooglemaps } from "react-icons/si";
import { AnimatedEmptyState } from "@/components/empty-states/animated-empty-state";
import { FloatingBackground } from "@/components/empty-states/floating-elements";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Ticket, User } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { TicketVerificationSection } from "./ticket-verification-section";
import { PopularityMetrics } from "./popularity-metrics";
import { SocialShare } from "./social-share";
import {
  useAutoTrackView,
  usePopularityMetrics,
} from "@/hooks/use-popularity-tracking";
import { motion, AnimatePresence } from "framer-motion";

interface TicketDetailModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenSellerModal?: (ticket: Ticket) => void;
}

// Helper function to extract meaningful street information
const getSimplifiedAddress = (fullAddress: string): string => {
  if (!fullAddress) return "";

  // Split by comma and take the first meaningful part (usually street name/number)
  const parts = fullAddress.split(",").map((part) => part.trim());

  // Return the first non-empty part which is usually the street
  return parts[0] || fullAddress;
};

export function TicketDetailModal({
  eventId,
  isOpen,
  onClose,
  onOpenSellerModal,
}: TicketDetailModalProps) {
  // Auto-track view when modal opens (for the first ticket in the event)
  useAutoTrackView(eventId, { enabled: isOpen });

  // Fetch availability metrics for the event
  const { data: popularityMetrics } = usePopularityMetrics(eventId);

  // Fetch available tickets for this event
  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/event/${eventId}`],
    enabled: !!eventId && isOpen,
  });

  // Get event details from the first ticket (since events are embedded in tickets)
  const firstTicket = tickets?.[0];

  // Fetch seller data for the first ticket
  const { data: seller, error: sellerError } = useQuery<User>({
    queryKey: [`/api/auth/users/${firstTicket?.sellerId}`],
    enabled: !!firstTicket?.sellerId && isOpen,
    retry: false, // Don't retry if seller not found
  });

  // Function to handle venue click with device-specific behavior
  const handleVenueClick = () => {
    if (!firstTicket?.venue) return;

    const query = firstTicket.venueAddress
      ? `${firstTicket.venue}, ${firstTicket.venueAddress}`
      : firstTicket.venue;

    // Detect if device is mobile/tablet
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) || window.innerWidth <= 768;

    if (isMobile) {
      // Try to open Google Maps app first, fallback to web version
      const mapsAppUrl = `comgooglemaps://?q=${encodeURIComponent(query)}`;
      const mapsWebUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}`;

      // Try to open Maps app
      window.location.href = mapsAppUrl;

      // Fallback to web version after a short delay if app doesn't open
      setTimeout(() => {
        window.open(mapsWebUrl, "_blank");
      }, 500);
    } else {
      // Desktop: Open Google Maps in new tab
      const mapsWebUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}`;
      window.open(mapsWebUrl, "_blank");
    }
  };

  // Fetch seller info for each ticket
  const sellers = useQuery<Record<number, User>>({
    queryKey: [`/api/sellers`],
    enabled: !!tickets && tickets.length > 0,
    queryFn: async () => {
      if (!tickets) return {};

      // Get unique seller IDs
      const sellerIds = Array.from(
        new Set(tickets.map((ticket) => ticket.sellerId)),
      );

      // Fetch seller data for each seller ID with proper error handling
      const sellerPromises = sellerIds.map(async (sellerId) => {
        try {
          const response = await fetch(`/api/auth/users/${sellerId}`);
          if (!response.ok) {
            return null;
          }
          const seller = await response.json();
          return { id: sellerId, data: seller };
        } catch (error) {
          // Silently handle network errors
          return null;
        }
      });

      const sellerResults = await Promise.allSettled(sellerPromises);

      // Convert to Record<sellerId, User>
      return sellerResults.reduce(
        (acc, result) => {
          if (result.status === "fulfilled" && result.value) {
            const sellerData = result.value;
            if (sellerData && sellerData.data) {
              acc[sellerData.id] = sellerData.data;
            }
          }
          return acc;
        },
        {} as Record<number, User>,
      );
    },
  });

  if (ticketsLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 sm:m-6 m-4 sm:max-w-4xl max-w-[calc(100vw-32px)]">
          <DialogTitle className="sr-only">Loading Event Details</DialogTitle>
          <DialogDescription className="sr-only">
            Loading event information and available tickets
          </DialogDescription>
          {/* Hero Section Skeleton */}
          <div className="relative">
            <Skeleton className="h-48 md:h-64 w-full rounded-t-lg" />

            {/* Header Content Skeleton */}
            <div className="p-6 pb-4 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-6">
            {/* Event Description Skeleton */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>

            {/* Popularity Metrics Skeleton */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets List Skeleton */}
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border rounded-xl p-5 space-y-4">
                  {/* Ticket Header */}
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>

                  {/* Action Area */}
                  <div className="flex justify-between items-center pt-4">
                    <Skeleton className="h-8 w-32" />
                    <div className="flex gap-2">
                      <Skeleton className="h-9 w-20 rounded-md" />
                      <Skeleton className="h-9 w-32 rounded-md" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 sm:m-6 m-4 sm:max-w-4xl max-w-[calc(100vw-32px)]"
          data-testid="event-modal"
        >
          {/* Hero Section */}
          <div className="relative">
            {firstTicket?.eventImageUrl && (
              <div className="h-48 md:h-64 overflow-hidden rounded-t-lg">
                <img
                  src={firstTicket.eventImageUrl}
                  alt={firstTicket.eventTitle}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            {/* Header Content */}
            <div className="p-6 pb-4">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                  {firstTicket?.eventTitle || "Event Details"}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  No tickets are currently available for this event. View event
                  details and create alerts for when tickets become available.
                </DialogDescription>

                {/* Event Meta Info */}
                <div className="space-y-2">
                  {firstTicket?.eventDate && (
                    <div className="flex items-center gap-2 text-textSecondary">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(firstTicket.eventDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>
                        {new Date(firstTicket.eventDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  )}

                  {firstTicket?.venue && (
                    <button
                      onClick={handleVenueClick}
                      className="flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group"
                      title="Open in maps"
                    >
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-medium group-hover:underline">
                        {firstTicket.venue}
                      </span>
                      {firstTicket.venueAddress && (
                        <span className="text-textSecondary">
                          • {firstTicket.venueAddress}
                        </span>
                      )}
                      <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    </button>
                  )}
                </div>
              </DialogHeader>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Empty State Card */}
            <FloatingBackground>
              <AnimatedEmptyState
                icon={CreditCard}
                title="No Tickets Available"
                description="No tickets are currently listed for sale for this event. Check back later or create an alert to be notified when tickets become available."
                animation="bounce"
                className="py-8"
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Button variant="outline" onClick={onClose}>
                  Browse Other Events
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  <Heart className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </div>
            </FloatingBackground>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[85vh] overflow-y-auto p-0 sm:m-6 m-4 sm:max-w-4xl max-w-[calc(100vw-32px)]"
        data-testid="event-modal"
      >
        <DialogTitle className="sr-only">
          {firstTicket?.eventTitle || "Event Details"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Event details and available tickets for{" "}
          {firstTicket?.eventTitle || "this event"}
        </DialogDescription>
        {/* Hero Section */}
        <div className="relative">
          {firstTicket?.eventImageUrl && (
            <div className="h-48 md:h-64 overflow-hidden rounded-t-lg">
              <img
                src={firstTicket.eventImageUrl}
                alt={firstTicket.eventTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Event Status Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {firstTicket?.trending && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Badge className="bg-red-500 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </motion.div>
            )}

          </div>

          {/* Header Content */}
          <div className="p-6 pb-4">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight">
                {firstTicket?.eventTitle || "Available Tickets"}
              </DialogTitle>

              {/* Event Meta Info */}
              <div className="space-y-2">
                {firstTicket?.eventDate && (
                  <div className="flex items-center gap-2 text-textSecondary">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {new Date(firstTicket.eventDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>
                      {new Date(firstTicket.eventDate).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                )}

                {firstTicket?.venue && (
                  <button
                    onClick={handleVenueClick}
                    className="flex items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group"
                    title="Open in maps"
                  >
                    <SiGooglemaps className="h-8 w-8 text-primary" />
                    <span className="font-medium group-hover:underline">
                      {firstTicket.venue}
                    </span>
                    {firstTicket.venueAddress && (
                      <span className="text-textSecondary">
                        • {getSimplifiedAddress(firstTicket.venueAddress)}
                      </span>
                    )}
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                  </button>
                )}

                {/* Additional Event Details */}
                <div className="flex flex-wrap gap-3 pt-2">
                  {firstTicket?.category && (
                    <Badge variant="secondary" className="capitalize">
                      <BadgeIcon className="h-3 w-3 mr-1" />
                      {firstTicket.category}
                    </Badge>
                  )}
                  {firstTicket?.ageRestriction && (
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {firstTicket.ageRestriction}
                    </Badge>
                  )}
                  {firstTicket?.city && (
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      {firstTicket.city}
                      {firstTicket.country &&
                        firstTicket.country !== "US" &&
                        `, ${firstTicket.country}`}
                    </Badge>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Seller Information */}
            {firstTicket && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#E55346] text-white text-base font-semibold">
                        {seller ? seller.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-base">
                        {seller ? seller.fullName : "Seller"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {seller?.instagram ? `@${seller.instagram.replace("@", "")}` : `Seller ID: ${firstTicket.sellerId}`}
                      </p>
                    </div>
                  </div>
                  {seller?.instagram && (
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => {
                        const instagramHandle = seller.instagram?.replace("@", "");
                        window.open(`https://instagram.com/${instagramHandle}`, "_blank");
                      }}
                      className="flex items-center gap-2 font-medium border-gray-300"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>View Profile</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Content */}
          <div className="px-6 pb-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Event Description */}
            {firstTicket?.eventDescription && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Event Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-textSecondary leading-relaxed">
                    {firstTicket.eventDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Popularity Metrics */}
            {eventId && popularityMetrics && (
              <PopularityMetrics
                metrics={popularityMetrics}
                className="border rounded-lg"
              />
            )}

            {/* Available Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Available Tickets
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {tickets?.length || 0} {tickets?.length === 1 ? 'Listing' : 'Listings'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tickets?.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-border rounded-xl p-5 hover:border-primary/30 transition-all duration-200 bg-card"
                  >
                    {/* Ticket Header */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          {ticket.title}
                          {ticket.isVerified && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-textSecondary">
                          <MapPin className="h-4 w-4" />
                          <span>
                            Section {ticket.section}
                            {ticket.row && `, Row ${ticket.row}`}
                            {ticket.seat && `, Seat ${ticket.seat}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          ${Number(ticket.price).toFixed(2)}
                        </div>
                        <div className="text-sm text-textSecondary">
                          per ticket
                        </div>
                      </div>
                    </div>

                    {/* Ticket Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-textSecondary" />
                        <span>
                          <span className="font-medium">{ticket.quantity}</span>{" "}
                          {ticket.quantity === 1 ? "ticket" : "tickets"} available
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-textSecondary" />
                        <span>{ticket.transferMethod || "Mobile Transfer"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-textSecondary" />
                        <span>
                          {ticket.isTransferrable
                            ? "Transferrable"
                            : "Non-transferrable"}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    {ticket.additionalInfo && (
                      <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                        <p className="text-sm text-textSecondary">
                          <span className="font-medium">Note:</span>{" "}
                          {ticket.additionalInfo}
                        </p>
                      </div>
                    )}

                    {/* Contact Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContactSeller(ticket);
                        }}
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Contact Seller
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Verification Section */}
            {firstTicket && (
              <TicketVerificationSection ticket={firstTicket} />
            )}

            {/* Social Share */}
            {firstTicket && (
              <div className="flex justify-center pt-4">
                <SocialShare
                  title={firstTicket.eventTitle}
                  description={`Check out tickets for ${firstTicket.eventTitle} at ${firstTicket.venue}`}
                  url={window.location.href}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
