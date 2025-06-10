import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { format } from "date-fns";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TicketDetailModal } from "@/components/ticket-detail-modal";
import { TicketHeatMap } from "@/components/ticket-heatmap";
import { TicketComparison } from "@/components/ticket-comparison";
import { Link } from "wouter";
import { Event, Ticket } from "@shared/schema";

import EnhancedSEO from "@/components/enhanced-seo";
import { generateEventStructuredData, generateBreadcrumbStructuredData, generateOrganizationStructuredData } from "@/utils/seo-utils";
import { SocialShare } from "@/components/social-share";

export default function EventDetails() {
  const { id } = useParams<{ id: string }>();
  const eventId = parseInt(id);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Initialize analytics


  // Fetch event details
  const {
    data: event,
    isLoading: eventLoading,
    error: eventError,
  } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
    enabled: !isNaN(eventId),
  });

  // Fetch tickets for this event
  const { data: tickets, isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: [`/api/tickets/event/${eventId}`],
    enabled: !isNaN(eventId),
  });

  // Track event view when data is loaded
  useEffect(() => {
    if (event && !eventLoading) {

    }
  }, [event, eventLoading]);

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return "Date unavailable";
      }
      return format(dateObj, "EEE, dd MMM yyyy • h:mm a");
    } catch {
      return "Date unavailable";
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);

    // Track when user views available tickets
    if (event) {
      // Custom event tracking for ticket view

    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (eventLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-center">Loading event details...</p>
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <a className="inline-flex items-center text-primary mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
            </a>
          </Link>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-lg text-textSecondary">
              Event not found or has been removed.
            </p>
            <Button className="mt-4" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get available tickets
  const availableTickets =
    tickets?.filter((t) => t.status === "available") || [];

  // Create optimized meta data
  const eventTitle = `${event.title} Tickets in ${event.venue.split(",")[1]?.trim() || event.city || "India"} | Ticket Bazaar`;
  const description =
    event.eventDescription ||
    `Buy verified ${event.eventTitle} tickets for ${format(new Date(event.eventDate), "PPP")} at ${event.venue}. ` +
      `${availableTickets.length > 0 ? `${availableTickets.length} tickets available. ` : ""}` +
      `Secure payment, guaranteed authenticity, and instant ticket transfer. India's trusted ticket reselling platform.`;
  const canonicalUrl = `https://ticketbazaar.co.in/events/${event.id}`;

  // Get the current URL
  const [location] = useLocation();
  const currentUrl = `https://ticketbazaar.co.in${location}`;

  // Calculate ticket price range for schema
  const ticketPrices = (tickets && tickets.length > 0) ? {
    min: Math.min(...tickets.map(t => t.price)),
    max: Math.max(...tickets.map(t => t.price)),
    currency: "INR"
  } : undefined;

  // Breadcrumb data
  const breadcrumbItems = [
    { name: "Home", url: "/" },
    { name: "Events", url: "/" },
    { name: event.category, url: `/events/category/${event.category}` },
    { name: event.eventTitle || event.title, url: `/event/${event.id}` }
  ];

  // Generate structured data
  const eventStructuredData = generateEventStructuredData({
    title: event.eventTitle || event.title,
    description: event.eventDescription || `${event.eventTitle || event.title} event at ${event.venue}`,
    venue: event.venue,
    date: event.eventDate.toISOString(),
    category: event.category,
    city: event.city || event.venue.split(',').pop()?.trim() || 'India',
    price: ticketPrices?.min,
    imageUrl: event.eventImageUrl ? event.eventImageUrl : undefined,
    latitude: event.latitude ? event.latitude : undefined,
    longitude: event.longitude ? event.longitude : undefined
  }, availableTickets.length);

  const breadcrumbStructuredData = generateBreadcrumbStructuredData([
    { name: "Home", url: "https://ticketbazaar.co.in/" },
    { name: "Events", url: "https://ticketbazaar.co.in/" },
    { name: event.category, url: `https://ticketbazaar.co.in/events/category/${event.category}` },
    { name: event.eventTitle || event.title, url: `https://ticketbazaar.co.in/event/${event.id}` }
  ]);

  const organizationStructuredData = generateOrganizationStructuredData();

  return (
    <div className="container mx-auto px-4 py-8">
      <EnhancedSEO
        type="event"
        data={{
          title: event.eventTitle || event.title,
          venue: event.venue,
          city: event.city || event.venue.split(',').pop()?.trim() || 'India'
        }}
        canonicalUrl={`https://ticketbazaar.co.in/event/${id}`}
        ogType="event"
        ogImage={event.eventImageUrl || undefined}
        structuredData={[eventStructuredData, breadcrumbStructuredData, organizationStructuredData]}
      />
      
      <Link href="/">
        <a className="inline-flex items-center text-primary mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
        </a>
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="relative h-48 md:h-64 w-full bg-primary/10">
          {event.eventImageUrl ? (
            <img
              src={event.eventImageUrl}
              alt={event.eventTitle}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-primary/30 text-4xl font-light">
                {event.title}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold font-poppins mb-3">
            {event.title}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center text-textSecondary mb-6 space-y-2 md:space-y-0 md:space-x-6">
            <p className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {event.venue}
            </p>
            <p className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {formatDate(event.eventDate)}
            </p>
          </div>

          {event.eventDescription && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">About this event</h2>
              <p className="text-textSecondary">{event.eventDescription}</p>
            </div>
          )}

          <div className="border-t pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-xl font-semibold mb-1">Tickets</h2>
                <p className="text-textSecondary">
                  {availableTickets.length > 0
                    ? `${availableTickets.length} tickets available`
                    : "No tickets available at the moment"}
                </p>
              </div>

              <div className="flex mt-4 md:mt-0 space-x-3">
                <SocialShare event={event} variant="outline" />

                <Button
                  onClick={handleOpenModal}
                  disabled={availableTickets.length === 0}
                >
                  {availableTickets.length > 0
                    ? "View Available Tickets"
                    : "Sold Out"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Comparison Tool */}
      {availableTickets.length > 1 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Compare Tickets</h2>
          <TicketComparison
            tickets={availableTickets}
            event={event}
            onSelectTicket={(ticket) => {
              handleOpenModal();
            }}
          />
        </div>
      )}

      {/* Ticket Heat Map */}
      <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
        <TicketHeatMap eventId={eventId} />
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Buyer Protection</h2>
        <p className="text-textSecondary mb-4">
          When you buy tickets on Ticket Bazaar, you can be confident that your
          purchase is protected. All tickets are verified by our team, and our
          buyer guarantee ensures:
        </p>
        <ul className="list-disc pl-5 text-textSecondary space-y-2">
          <li>
            Secure escrow payment system - we hold the payment until the
            transaction is complete
          </li>
          <li>Full refund if tickets are invalid or the event is cancelled</li>
          <li>Comparable or better replacement tickets when available</li>
          <li>24/7 customer support before and during the event</li>
        </ul>
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        eventId={eventId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}