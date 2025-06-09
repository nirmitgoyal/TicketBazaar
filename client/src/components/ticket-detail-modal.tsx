import { CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Ticket, User, Event } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { TicketVerification } from "./ticket-verification";

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
  // Fetch event details
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isOpen,
  });

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
            <DialogTitle className="text-xl">Loading tickets...</DialogTitle>
            <DialogDescription>Please wait while we fetch available tickets for this event.</DialogDescription>
          </DialogHeader>
          <div className="py-8 text-center">
            <p className="text-textSecondary">Fetching available tickets...</p>
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

          <div className="mb-6">
            <h4 className="font-medium text-lg mb-3">Available Tickets</h4>

            {tickets.map((ticket) => {
              const seller = sellers.data && sellers.data[ticket.sellerId];

              return (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 mb-3 hover:border-primary cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {ticket.section}
                        {ticket.row ? ` - Row ${ticket.row}` : ""}
                        {ticket.seat ? `, Seat ${ticket.seat}` : ""}
                      </p>
                      <p className="text-sm text-textSecondary mt-1">
                        Seller:{" "}
                        {seller
                          ? `@${seller.instagram} (${seller.rating ? seller.rating.toFixed(1) : "0.0"}/5 ⭐)`
                          : "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-textSecondary">
                        Quantity: {ticket.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mt-3 text-sm text-textSecondary">
                    <div className="flex items-center mr-4">
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      <span>Verified User</span>
                    </div>
                    {ticket.transferMethod && (
                      <div className="flex items-center">
                        <ShieldCheck className="h-4 w-4 mr-1 text-secondary" />
                        <span>Transfer: {ticket.transferMethod}</span>
                      </div>
                    )}
                  </div>

                  {ticket.additionalInfo && (
                    <p className="mt-2 text-sm text-textSecondary">
                      {ticket.additionalInfo}
                    </p>
                  )}

                  {/* Perplexity AI Verification Section */}
                  <TicketVerification ticket={ticket} />

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => {
                        if (seller?.instagram) {
                          const instagramHandle = seller.instagram.replace('@', '');
                          window.open(`https://www.instagram.com/${instagramHandle}/`, '_blank');
                        }
                      }}
                      className="whitespace-nowrap bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Contact @{seller?.instagram}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Quick Tip:</strong> Click "Contact @username" to visit the seller's Instagram profile and send them a direct message.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}