import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowLeft, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { SocialShare } from "@/components/social-share";
import { Link } from "wouter";
import { Ticket, User } from "@shared/schema";
import { useAnalytics } from "@/hooks/use-analytics";
import { EventSEO } from "@/components/unified-seo-component";
import { generateEventStructuredData, generateBreadcrumbStructuredData, generateOrganizationStructuredData } from "@/utils/seo-utils";

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const ticketParam = id; // This can now be either an ID or a slug
  const [, setLocation] = useLocation();

  // Initialize analytics
  const { trackEvent, trackUserAction } = useAnalytics();

  // Fetch specific ticket details using either ID or slug
  const {
    data: ticket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useQuery<Ticket>({
    queryKey: [`/api/tickets/${ticketParam}`],
    queryFn: async () => {
      const response = await fetch(`/api/tickets/${ticketParam}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ticket: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Ensure eventDate is a Date object
      if (data.eventDate && typeof data.eventDate === 'string') {
        data.eventDate = new Date(data.eventDate);
      }
      return data;
    },
    enabled: !!ticketParam, // Enable query if ticketParam exists (either ID or slug)
  });

  // Fetch seller information
  const {
    data: seller,
    isLoading: sellerLoading,
  } = useQuery<User>({
    queryKey: [`/api/auth/users/${ticket?.sellerId}`],
    queryFn: async () => {
      if (!ticket?.sellerId) throw new Error("No seller ID");
      const response = await fetch(`/api/auth/users/${ticket.sellerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch seller: ${response.status} ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!ticket?.sellerId, // Enable query only if we have a ticket with sellerId
  });

  // Track ticket view when data is loaded
  useEffect(() => {
    if (ticket && !ticketLoading) {
      trackEvent("view_ticket_details", "Ticket View", ticket.eventTitle);
    }
  }, [ticket, ticketLoading, trackEvent]);

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = new Date(date);
      return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch (error) {
      return "Date not available";
    }
  };

  // Handle loading state
  if (ticketLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error or missing ticket
  if (ticketError || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Ticket Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              This ticket listing has expired, been removed, or doesn't exist.
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse All Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate SEO data for the ticket
  const eventData = {
    title: ticket.eventTitle,
    description: `${ticket.eventTitle} at ${ticket.venue}, ${ticket.city || ''}. Section: ${ticket.section}${ticket.row ? `, Row: ${ticket.row}` : ''}${ticket.seat ? `, Seat: ${ticket.seat}` : ''}. Available on Ticket Bazaar.`,
    date: ticket.eventDate instanceof Date ? ticket.eventDate.toISOString() : new Date(ticket.eventDate).toISOString(),
    venue: ticket.venue,
    city: ticket.city || '',
    category: ticket.category,
    imageUrl: ticket.eventImageUrl || undefined
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* SEO Component for Ticket Page */}
      <EventSEO 
        event={eventData}
        ticketCount={1}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {ticket.eventTitle}
              </h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(ticket.eventDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{ticket.venue}, {ticket.city}</span>
                </div>
              </div>
            </div>
            
            {/* Share buttons for this specific ticket */}
            <div className="flex items-center gap-2">
              <SocialShare ticket={ticket} />
            </div>
          </div>
        </div>

        {/* Ticket details card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
              <div className="space-y-3">
                {ticket.row && (
                  <div>
                    <span className="font-medium text-gray-700">Row:</span>
                    <span className="ml-2">{ticket.row}</span>
                  </div>
                )}
                {ticket.seat && (
                  <div>
                    <span className="font-medium text-gray-700">Seat:</span>
                    <span className="ml-2">{ticket.seat}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="ml-2">{ticket.quantity} ticket{ticket.quantity > 1 ? 's' : ''}</span>
                </div>
                {ticket.additionalInfo && (
                  <div>
                    <span className="font-medium text-gray-700">Additional Info:</span>
                    <p className="ml-2 mt-1 text-gray-600">{ticket.additionalInfo}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">Event Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="ml-2">{ticket.city}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 capitalize">{ticket.category}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Interested in this ticket?</h3>
          <p className="mb-4">Connect with the seller on Instagram</p>
          {seller?.instagram ? (
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => {
                const instagramHandle = seller.instagram?.replace("@", "");
                window.open(`https://ig.me/m/${instagramHandle}`, "_blank");
              }}
            >
              <Instagram className="mr-2 h-5 w-5" />
              Message @{seller.instagram?.replace("@", "")}
            </Button>
          ) : (
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" disabled>
              <Instagram className="mr-2 h-5 w-5" />
              Seller contact unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}