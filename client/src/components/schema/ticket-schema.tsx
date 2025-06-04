import React from "react";
import { Event, Ticket } from "@shared/schema";

interface TicketSchemaProps {
  event: Event;
  tickets: Ticket[];
  url: string;
}

/**
 * Creates schema.org structured data for ticket listings to enhance SEO
 */
export const TicketSchema = ({ event, tickets, url }: TicketSchemaProps) => {
  // Only generate schema if we have event details and at least one ticket
  if (!event || !tickets || tickets.length === 0) return null;

  // Find the lowest and highest prices for the tickets
  const prices = tickets.map((ticket) => ticket.sellingPrice);
  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);

  // Format date to ISO format with validation
  const isValidDate = event.date && !isNaN(new Date(event.date).getTime());
  const fallbackDate = new Date().toISOString();
  
  const eventDate = isValidDate ? new Date(event.date).toISOString() : fallbackDate;
  const eventEndDate = isValidDate 
    ? new Date(new Date(event.date).getTime() + 3 * 60 * 60 * 1000).toISOString()
    : new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString(); // Assuming 3 hour events

  // Create the structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description:
      event.description ||
      `${event.title} at ${event.venue}. Buy second hand and 2nd hand tickets with secure verification.`,
    startDate: eventDate,
    endDate: eventEndDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city || "India",
        addressRegion: "",
        addressCountry: "IN",
      },
    },
    image: [event.imageUrl || "/images/ticket-bazaar-social.png"],
    performer: {
      "@type": "PerformingGroup",
      name: event.title.split(" at ")[0] || event.title,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: lowestPrice,
      highPrice: highestPrice,
      offerCount: tickets.length,
      availability: "https://schema.org/InStock",
      url: url,
      validFrom: new Date().toISOString(),
      category: "second hand tickets, 2nd hand tickets",
    },
    organizer: {
      "@type": "Organization",
      name: "Ticket Bazaar",
      url: "https://ticketbazaar.co.in",
    },
  };

  return (
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  );
};
