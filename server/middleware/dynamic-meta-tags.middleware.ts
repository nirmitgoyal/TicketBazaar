import { Request, Response, NextFunction } from "express";
import { readFileSync } from "fs";
import path from "path";

export interface MetaTagData {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
}

// Function to inject meta tags into HTML
function injectMetaTags(html: string, metaData: MetaTagData): string {
  const {
    title,
    description,
    image,
    url,
    type = "website"
  } = metaData;

  // Replace the title tag
  html = html.replace(
    /<title>.*?<\/title>/i,
    `<title>${title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"/i,
    `<meta name="description" content="${description}"`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"/i,
    `<meta property="og:title" content="${title}"`
  );

  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"/i,
    `<meta property="og:description" content="${description}"`
  );

  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"/i,
    `<meta property="og:image" content="${image}"`
  );

  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"/i,
    `<meta property="og:url" content="${url}"`
  );

  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"/i,
    `<meta property="og:type" content="${type}"`
  );

  // Replace Twitter Card tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"/i,
    `<meta name="twitter:title" content="${title}"`
  );

  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"/i,
    `<meta name="twitter:description" content="${description}"`
  );

  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"/i,
    `<meta name="twitter:image" content="${image}"`
  );

  // Replace canonical URL
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"/i,
    `<link rel="canonical" href="${url}"`
  );

  return html;
}

// Middleware to handle dynamic meta tag injection for tickets and events
export function dynamicMetaTagsMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalSend = res.send;

  // Override res.send to intercept HTML responses
  res.send = function(data: any) {
    // Only process HTML responses
    if (typeof data === 'string' && data.includes('<!doctype html>')) {
      // Check if this is a route that needs dynamic meta tags
      const path = req.path;
      const isTicketRoute = path.match(/^\/tickets\/(\d+)$/);
      const isEventRoute = path.match(/^\/events?\/(\d+)$/);

      if (isTicketRoute || isEventRoute) {
        // We'll handle the meta tag injection asynchronously
        handleDynamicMetaTags(req, res, data, originalSend, isTicketRoute, isEventRoute);
        return;
      }
    }

    // For non-HTML or non-matching routes, just send as normal
    return originalSend.call(this, data);
  };

  next();
}

async function handleDynamicMetaTags(
  req: Request,
  res: Response,
  html: string,
  originalSend: Function,
  isTicketRoute: RegExpMatchArray | null,
  isEventRoute: RegExpMatchArray | null
) {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    let metaData: MetaTagData;

    if (isTicketRoute) {
      const ticketId = parseInt(isTicketRoute[1]);
      metaData = await getTicketMetaData(ticketId, baseUrl, req.originalUrl);
    } else if (isEventRoute) {
      const eventId = parseInt(isEventRoute[1]);
      metaData = await getEventMetaData(eventId, baseUrl, req.originalUrl);
    } else {
      // This shouldn't happen, but just in case
      return originalSend.call(res, html);
    }

    if (metaData) {
      const modifiedHtml = injectMetaTags(html, metaData);
      return originalSend.call(res, modifiedHtml);
    }

    // If no meta data found, send original HTML
    return originalSend.call(res, html);

  } catch (error) {
    console.error("Error in dynamic meta tags middleware:", error);
    // On error, send original HTML
    return originalSend.call(res, html);
  }
}

async function getTicketMetaData(ticketId: number, baseUrl: string, originalUrl: string): Promise<MetaTagData | null> {
  try {
    const { storage } = await import("../storage");
    const ticket = await storage.getTicketById(ticketId);

    if (!ticket) {
      return {
        title: "Ticket Not Available | TicketBazaar",
        description: "This ticket listing has expired or is no longer available. Browse other tickets on TicketBazaar - India's trusted ticket marketplace.",
        image: `${baseUrl}/images/ticket-bazaar-social.png`,
        url: `${baseUrl}${originalUrl}`,
        type: "website"
      };
    }

    const eventDate = new Date(ticket.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const title = `${ticket.eventTitle} - ${ticket.section}${ticket.row ? `, Row ${ticket.row}` : ''} Ticket | TicketBazaar`;
    const description = `Buy ${ticket.eventTitle} ticket for ${eventDate} at ${ticket.venue}, ${ticket.city}. Section: ${ticket.section}${ticket.row ? `, Row: ${ticket.row}` : ''}${ticket.seat ? `, Seat: ${ticket.seat}` : ''}. Secure payment, verified seller on TicketBazaar.`;

    return {
      title,
      description,
      image: `${baseUrl}/api/og/ticket/${ticketId}.png`,
      url: `${baseUrl}${originalUrl}`,
      type: "product"
    };

  } catch (error) {
    console.error("Error fetching ticket meta data:", error);
    return null;
  }
}

async function getEventMetaData(eventId: number, baseUrl: string, originalUrl: string): Promise<MetaTagData | null> {
  try {
    const { storage } = await import("../storage");
    const event = await storage.getTicketById(eventId);

    if (!event) {
      return {
        title: "Event Not Found | TicketBazaar",
        description: "This event is no longer available. Browse other events on TicketBazaar - India's trusted ticket marketplace.",
        image: `${baseUrl}/images/ticket-bazaar-social.png`,
        url: `${baseUrl}${originalUrl}`,
        type: "website"
      };
    }

    // Get ticket count for this event
    const tickets = await storage.getTicketsByEvent(eventId);
    const availableCount = tickets?.length || 0;

    const eventDate = new Date(event.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const title = `${event.eventTitle} | TicketBazaar`;
    const description = `Buy tickets for ${event.eventTitle} on ${eventDate} at ${event.venue}, ${event.city}. ${availableCount} ticket${availableCount !== 1 ? 's' : ''} available. Secure payment, verified sellers on TicketBazaar.`;

    return {
      title,
      description,
      image: `${baseUrl}/api/og/event/${eventId}.png`,
      url: `${baseUrl}${originalUrl}`,
      type: "event"
    };

  } catch (error) {
    console.error("Error fetching event meta data:", error);
    return null;
  }
}