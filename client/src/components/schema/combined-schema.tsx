import React from "react";
import { Event, Ticket } from "@shared/schema";

interface CombinedSchemaProps {
  event?: Event;
  ticket?: Ticket;
}

const CombinedSchema: React.FC<CombinedSchemaProps> = ({
  event,
  ticket,
}) => {
  const schemas = [];

  // Event schema
  if (event) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: event.date.toISOString(),
      location: {
        "@type": "Place",
        name: event.venue,
        address: {
          "@type": "PostalAddress",
          addressLocality: event.city,
          addressCountry: "IN",
        },
        ...(event.latitude &&
          event.longitude && {
            geo: {
              "@type": "GeoCoordinates",
              latitude: event.latitude,
              longitude: event.longitude,
            },
          }),
      },
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: {
        "@type": "Organization",
        name: "TicketBazaar",
      },
      ...(event.imageUrl && { image: event.imageUrl }),
    });
  }

  // Ticket schema
  if (ticket && event) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Product",
      name: ticket.title,
      description: `${ticket.title} - ${event.title}`,
      category: "Event Ticket",
      offers: {
        "@type": "Offer",
        price: ticket.sellingPrice,
        priceCurrency: "INR",
        availability:
          ticket.status === "available"
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "TicketBazaar",
        },
      },
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Section",
          value: ticket.section,
        },
        {
          "@type": "PropertyValue",
          name: "Quantity",
          value: ticket.quantity,
        },
      ],
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </>
  );
};

export default CombinedSchema;
