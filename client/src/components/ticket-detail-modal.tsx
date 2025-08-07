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
import { Ticket, User } from "@shared/schema";
import { TicketVerificationSection } from "./ticket-verification-section";
import { PopularityMetrics } from "./popularity-metrics";
import { SocialShare } from "./social-share";
import {
  useAutoTrackView,
  usePopularityMetrics,
} from "@/hooks/use-popularity-tracking";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface TicketDetailModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
  onOpenSellerModal?: (ticket: Ticket) => void;
  selectedTicketId?: number | null;
}

// Component to handle profile picture with proper fallback hierarchy
function SellerProfilePicture({ seller }: { seller: User }) {
  const [googleImageFailed, setGoogleImageFailed] = useState(false);
  const [instagramImageFailed, setInstagramImageFailed] = useState(false);

  // Get user initials for fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Try Google profile picture first
  if (seller.profilePicture && !googleImageFailed) {
    return (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <img
          src={seller.profilePicture}
          alt={seller.fullName || "Seller"}
          className="w-full h-full object-cover"
          onError={() => setGoogleImageFailed(true)}
        />
      </div>
    );
  }

  // Fallback to Instagram avatar if Google profile picture failed
  if (seller.instagram && !instagramImageFailed) {
    return (
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
        <img
          src={`https://unavatar.io/instagram/${seller.instagram}`}
          alt={seller.fullName || "Seller"}
          className="w-full h-full object-cover"
          onError={() => setInstagramImageFailed(true)}
        />
      </div>
    );
  }

  // Final fallback to user initials
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
      {seller.fullName ? (
        <span className="text-sm font-semibold text-primary">
          {getInitials(seller.fullName)}
        </span>
      ) : (
        <UserIcon className="h-5 w-5 text-primary" />
      )}
    </div>
  );
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
  selectedTicketId,
}: TicketDetailModalProps) {
  const [, setLocation] = useLocation();

  // Auto-track view when modal opens (for the first ticket in the event)
  useAutoTrackView(eventId, { enabled: isOpen });

  // Handle URL updates when modal opens with a specific ticket
  useEffect(() => {
    if (isOpen && selectedTicketId) {
      // Update URL to include ticket parameter
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('ticket', selectedTicketId.toString());
      window.history.replaceState({}, '', currentUrl.toString());
    }
  }, [isOpen, selectedTicketId]);

  // Handle browser back button
  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = (event: PopStateEvent) => {
      // Check if we should close the modal based on URL
      const currentUrl = new URL(window.location.href);
      const ticketParam = currentUrl.searchParams.get('ticket');
      
      if (!ticketParam || !selectedTicketId) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, selectedTicketId, onClose]);

  // Enhanced onClose to handle URL cleanup
  const handleClose = () => {
    // Clean up URL parameters
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('ticket');
    window.history.replaceState({}, '', currentUrl.toString());
    
    onClose();
  };

  // Fetch availability metrics for the event
  const { data: popularityMetrics } = usePopularityMetrics(eventId);

  // Fetch available tickets for this event
  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/event/${eventId}`],
    enabled: !!eventId && isOpen,
  });

  // Get event details from the selected ticket or first ticket
  const selectedTicket = selectedTicketId 
    ? tickets?.find(t => t.id === selectedTicketId)
    : null;
  const firstTicket = selectedTicket || tickets?.[0];

  // Fetch seller data for the first ticket
  const { data: seller } = useQuery<User>({
    queryKey: [`/api/auth/users/${firstTicket?.sellerId}`],
    enabled: !!firstTicket?.sellerId && isOpen,
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
      <Dialog open={isOpen} onOpenChange={handleClose}>
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
      <Dialog open={isOpen} onOpenChange={handleClose}>
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
                <Button variant="outline" onClick={handleClose}>
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
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-textSecondary text-sm sm:text-base">
                    {/* Date - Full format on desktop, short on mobile */}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      {/* Mobile: Short format */}
                      <span className="font-medium sm:hidden">
                        {new Date(firstTicket.eventDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      {/* Desktop: Full format */}
                      <span className="font-medium hidden sm:inline">
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
                    </div>
                    {/* Time */}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {new Date(firstTicket.eventDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {firstTicket?.venue && (
                  <button
                    onClick={handleVenueClick}
                    className="flex flex-wrap items-center gap-2 text-left hover:text-primary transition-colors cursor-pointer group w-full sm:w-auto"
                    title="Open in maps"
                  >
                    <SiGooglemaps className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 min-w-0">
                      <span className="font-medium group-hover:underline break-words">
                        {firstTicket.venue}
                      </span>
                      {firstTicket.venueAddress && (
                        <span className="text-textSecondary text-sm sm:text-base break-words">
                          • {getSimplifiedAddress(firstTicket.venueAddress)}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="h-3 w-3 opacity-50 group-hover:opacity-100 flex-shrink-0 ml-auto sm:ml-0" />
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
            {seller && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SellerProfilePicture seller={seller} />
                    <div>
                      <p className="text-sm text-textSecondary">Posted by</p>
                      <p className="font-semibold text-base">{seller.fullName}</p>
                    </div>
                  </div>
                  {seller.instagram && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const instagramHandle = seller.instagram?.replace("@", "");
                        
                        // Detect if device is mobile
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          navigator.userAgent
                        ) || window.innerWidth <= 768;

                        if (isMobile) {
                          // Try to open Instagram app first
                          const instagramAppUrl = `instagram://user?username=${instagramHandle}`;
                          const instagramWebUrl = `https://www.instagram.com/${instagramHandle}/`;
                          
                          // Create a hidden iframe to test if the app opens
                          const iframe = document.createElement('iframe');
                          iframe.style.display = 'none';
                          iframe.src = instagramAppUrl;
                          document.body.appendChild(iframe);
                          
                          // Set a timeout to fallback to web version if app doesn't open
                          let appOpened = false;
                          const timeout = setTimeout(() => {
                            if (!appOpened) {
                              window.open(instagramWebUrl, '_blank');
                            }
                            document.body.removeChild(iframe);
                          }, 1000);
                          
                          // If the page loses focus, the app likely opened
                          const handleVisibilityChange = () => {
                            if (document.hidden) {
                              appOpened = true;
                              clearTimeout(timeout);
                              document.body.removeChild(iframe);
                              document.removeEventListener('visibilitychange', handleVisibilityChange);
                            }
                          };
                          
                          document.addEventListener('visibilitychange', handleVisibilityChange);
                          
                          // Alternative method: try direct navigation for iOS
                          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                            try {
                              window.location.href = instagramAppUrl;
                            } catch (e) {
                              // If direct navigation fails, the timeout will handle the fallback
                            }
                          }
                        } else {
                          // Desktop: Open Instagram profile in new tab
                          const instagramWebUrl = `https://www.instagram.com/${instagramHandle}/`;
                          window.open(instagramWebUrl, '_blank');
                        }
                      }}
                      className="flex items-center gap-2 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-300 transition-colors"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="hidden sm:inline">Chat with {seller.instagram}</span>
                      <span className="sm:hidden">Instagram</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
