
import React from "react";
import { Event } from "@shared/schema";

interface EventSchemaProps {
  event: Event;
  ticketPrices?: {
    min: number;
    max: number;
    currency: string;
  };
}

export const EventSchema: React.FC<EventSchemaProps> = ({ event, ticketPrices }) => {
  const eventStartDate = new Date(event.eventDate).toISOString();
  const eventEndDate = new Date(new Date(event.eventDate).getTime() + 4 * 60 * 60 * 1000).toISOString(); // Assume 4 hour duration

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.eventTitle || event.title,
    description: event.eventDescription || `${event.eventTitle} at ${event.venue}`,
    startDate: eventStartDate,
    endDate: eventEndDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.venueAddress,
        addressLocality: event.city,
        addressCountry: "IN"
      },
      geo: event.latitude && event.longitude ? {
        "@type": "GeoCoordinates",
        latitude: event.latitude,
        longitude: event.longitude
      } : undefined
    },
    image: event.eventImageUrl ? [event.eventImageUrl] : undefined,
    organizer: {
      "@type": "Organization",
      name: "Ticket Bazaar",
      url: "https://ticketbazaar.co.in"
    },
    offers: ticketPrices ? {
      "@type": "AggregateOffer",
      lowPrice: ticketPrices.min,
      highPrice: ticketPrices.max,
      priceCurrency: ticketPrices.currency,
      availability: "https://schema.org/InStock",
      url: `https://ticketbazaar.co.in/event/${event.id}`,
      seller: {
        "@type": "Organization",
        name: "Ticket Bazaar"
      }
    } : undefined,
    url: `https://ticketbazaar.co.in/event/${event.id}`,
    category: event.category,
    keywords: `${event.category}, ${event.city}, ${event.venue}, tickets, events, India`,
    isAccessibleForFree: false,
    inLanguage: "en-IN"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
