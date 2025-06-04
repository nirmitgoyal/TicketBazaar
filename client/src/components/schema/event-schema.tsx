import React from "react";
import { Event } from "@shared/schema";

interface EventSchemaProps {
  events: Event[];
  url: string;
}

/**
 * Creates schema.org structured data for event listings to enhance SEO
 */
export const EventSchema = ({ events, url }: EventSchemaProps) => {
  // Only generate schema if we have events
  if (!events || events.length === 0) return null;

  // Create ItemList structured data for event listings
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Event",
        name: event.title,
        description:
          event.description ||
          `${event.title} at ${event.venue}. Buy second hand and 2nd hand tickets with secure verification.`,
        startDate: event.date && !isNaN(new Date(event.date).getTime()) 
          ? new Date(event.date).toISOString() 
          : new Date().toISOString(),
        location: {
          "@type": "Place",
          name: event.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: event.city || "India",
            addressCountry: "IN",
          },
        },
        image: event.imageUrl || "/images/ticket-bazaar-social.png",
        url: `https://ticketbazaar.co.in/event/${event.id}`,
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
          url: `https://ticketbazaar.co.in/event/${event.id}`,
          category: "second hand tickets, 2nd hand tickets",
        },
      },
    })),
  };

  return (
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  );
};
