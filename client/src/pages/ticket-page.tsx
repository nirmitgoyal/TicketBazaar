import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { Link } from "wouter";
import { Ticket } from "@shared/schema";
import { useAnalytics } from "@/hooks/use-analytics";
import { EventSEO } from "@/components/unified-seo-component";
import { generateEventStructuredData, generateBreadcrumbStructuredData, generateOrganizationStructuredData } from "@/utils/seo-utils";

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const ticketId = parseInt(id);
  const [, setLocation] = useLocation();

  // Initialize analytics
  const { trackEvent, trackUserAction } = useAnalytics();

  // Fetch specific ticket details
  const {
    data: ticket,
    isLoading: ticketLoading,
    error: ticketError,
  } = useQuery<Ticket>({
    queryKey: [`/api/tickets/${ticketId}`],
    enabled: !isNaN(ticketId),
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

  // For direct ticket access, we'll redirect to the event page with the modal open
  // This maintains consistency with existing UX while supporting direct URLs
  useEffect(() => {
    if (ticket) {
      // Navigate to the event page and auto-open the ticket modal
      setLocation(`/event/${ticket.id}?ticket=${ticketId}`);
    }
  }, [ticket, ticketId, setLocation]);

  // Generate SEO data for the ticket
  const eventData = {
    id: ticket.id,
    eventTitle: ticket.eventTitle,
    eventDate: ticket.eventDate,
    venue: ticket.venue,
    city: ticket.city,
    description: `${ticket.eventTitle} at ${ticket.venue}, ${ticket.city}. Section: ${ticket.section}${ticket.row ? `, Row: ${ticket.row}` : ''}${ticket.seat ? `, Seat: ${ticket.seat}` : ''}. Available on Ticket Bazaar.`,
    price: ticket.price,
    section: ticket.section
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* SEO Component for Ticket Page */}
      <EventSEO 
        event={eventData}
        type="ticket"
        ticketId={ticketId}
        structuredData={{
          event: generateEventStructuredData(eventData),
          breadcrumb: generateBreadcrumbStructuredData([
            { name: "Home", url: "/" },
            { name: eventData.eventTitle, url: `/event/${ticket.id}` },
            { name: "Ticket Details", url: `/tickets/${ticketId}` }
          ]),
          organization: generateOrganizationStructuredData()
        }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Fallback content while redirecting */}
        <div className="text-center">
          <div className="animate-pulse">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Loading ticket details...
            </h1>
            <p className="text-gray-600">
              Redirecting to event page...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}