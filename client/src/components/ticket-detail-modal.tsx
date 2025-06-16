import { CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Ticket, User, Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { TicketVerificationSection } from "./ticket-verification-section";
import { PopularityMetrics } from "./popularity-metrics";
import { useAutoTrackView, usePopularityMetrics } from "@/hooks/use-popularity-tracking";

interface TicketDetailModalProps {
  eventId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function TicketDetailModal({
  eventId,
  isOpen,
  onClose,
}: TicketDetailModalProps) {
  // Auto-track view when modal opens (for the first ticket in the event)
  useAutoTrackView(eventId, { enabled: isOpen });

  // Fetch event details
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isOpen,
  });

  // Fetch popularity metrics for the event
  const { data: popularityMetrics } = usePopularityMetrics(eventId);

  // Fetch available tickets for this event
  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/event/${eventId}`],
    enabled: !!eventId && isOpen,
  });

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
          if (result.status === 'fulfilled' && result.value) {
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Loading tickets...</DialogTitle>
            <DialogDescription className="sr-only">Please wait while we fetch available tickets for this event.</DialogDescription>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </DialogHeader>
          <div className="py-6 space-y-4">
            {/* Event details skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            
            {/* Popularity metrics skeleton */}
            <div className="p-3 border rounded-lg space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex space-x-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-18" />
              </div>
            </div>
            
            {/* Tickets list skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-36" />
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-24 rounded-md" />
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
        <DialogContent className="max-w-3xl" data-testid="event-modal">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {event?.title || "No Tickets Available"}
            </DialogTitle>
            <DialogDescription>No tickets are currently listed for sale for this event.</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-textSecondary">
              No tickets are currently available for this event.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl" data-testid="event-modal">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {event?.title || "Available Tickets"}
          </DialogTitle>
          <DialogDescription>Browse and contact sellers for available tickets to this event.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          {event && (
            <div className="mb-6">
              <p className="text-textSecondary mb-1">{event.venue}</p>
              <p className="text-textSecondary text-sm">
                {event.eventDate
                  ? new Date(event.eventDate).toLocaleString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Date TBD"}
              </p>
            </div>
          )}

          {/* Popularity Metrics */}
          {popularityMetrics && popularityMetrics.viewCount && (
            <div className="mb-4">
              <PopularityMetrics 
                metrics={{
                  totalViews: popularityMetrics.viewCount?.total || 0,
                  uniqueViews: popularityMetrics.viewCount?.unique || 0,
                  viewsToday: popularityMetrics.viewCount?.today || 0,
                  viewsThisWeek: popularityMetrics.viewCount?.thisWeek || 0,
                  viewsThisMonth: popularityMetrics.viewCount?.thisMonth || 0,
                  popularityScore: popularityMetrics.popularity?.popularityScore || 0,
                  trendingFactor: popularityMetrics.popularity?.trendingFactor || 0,
                  lastViewedAt: popularityMetrics.popularity?.lastViewedAt,
                }} 
                compact={true}
                showTrending={true}
              />
            </div>
          )}

          {/* Platform Disclaimer */}
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-amber-700">
                  <strong>Important:</strong> Ticket Bazaar is a discovery platform. We don't handle payments or facilitate transactions. All arrangements are made directly between you and the seller.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-lg mb-3">Available Tickets</h4>

            {tickets.map((ticket) => {
              const seller = sellers.data && sellers.data[ticket.sellerId];

              return (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 mb-3 hover:border-primary cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {ticket.section}
                        {ticket.row ? ` • Row ${ticket.row}` : ""}
                        {ticket.seat ? ` • Seat ${ticket.seat}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-textSecondary">
                          @{seller?.instagram || "unknown"} • Verified Seller
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">Available for Transfer</p>
                      <p className="text-sm text-textSecondary">{ticket.quantity} available</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <TicketVerificationSection ticket={ticket} />
                    <Button
                      onClick={() => {
                        if (seller?.instagram) {
                          const instagramHandle = seller.instagram.replace('@', '');
                          window.open(`https://www.instagram.com/${instagramHandle}/`, '_blank');
                        }
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Contact Seller
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}