import { Router } from "express";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "fs";
import path from "path";

const router = Router();

// Load font data once at startup for performance
let fontData: ArrayBuffer;
try {
  // Try to load a default font - in production, ensure this font exists
  const fontPath = path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files", "inter-latin-400-normal.woff");
  fontData = readFileSync(fontPath);
} catch (error) {
  console.warn("Font loading failed, using fallback approach");
  // Create a minimal fallback font buffer
  fontData = new ArrayBuffer(0);
}

// Generate OG image for a ticket
router.get("/ticket/:id.png", async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: "Invalid ticket ID" });
    }

    // Fetch ticket data
    const { storage } = await import("../storage");
    const ticket = await storage.getTicketById(ticketId);
    
    if (!ticket) {
      // Return fallback image for missing tickets
      return sendFallbackImage(res);
    }

    // Create the HTML/JSX-like structure for the OG image
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            height: '630px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e40af',
            backgroundImage: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
            padding: '60px',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            position: 'relative',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: '40px',
                  right: '60px',
                  fontSize: '24px',
                  fontWeight: '600',
                  opacity: 0.9,
                },
                children: 'TicketBazaar'
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '52px',
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: '20px',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: '1.1',
                },
                children: ticket.eventTitle
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '28px',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: '40px',
                  opacity: 0.95,
                },
                children: `${new Date(ticket.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  textAlign: 'center',
                  marginBottom: '20px',
                  opacity: 0.9,
                },
                children: `📍 ${ticket.venue}, ${ticket.city}`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '15px',
                  padding: '20px 40px',
                  fontSize: '22px',
                  fontWeight: '600',
                },
                children: `🎫 Section: ${ticket.section}${ticket.row ? ` • Row: ${ticket.row}` : ''}${ticket.seat ? ` • Seat: ${ticket.seat}` : ''}`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '40px',
                  fontSize: '20px',
                  opacity: 0.8,
                },
                children: "India's Trusted Ticket Marketplace"
              }
            }
          ]
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: fontData.byteLength > 0 ? [
          {
            name: 'Inter',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ] : []
      }
    );

    // Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(pngBuffer);

  } catch (error) {
    console.error("Error generating ticket OG image:", error);
    return sendFallbackImage(res);
  }
});

// Generate OG image for an event
router.get("/event/:id.png", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    // Fetch event data (from first ticket of the event)
    const { storage } = await import("../storage");
    const event = await storage.getTicketById(eventId);
    
    if (!event) {
      return sendFallbackImage(res);
    }

    // Get all tickets for this event to show availability
    const tickets = await storage.getTicketsByEvent(eventId);
    const availableCount = tickets?.length || 0;

    // Create the HTML/JSX-like structure for the event OG image
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            height: '630px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#059669',
            backgroundImage: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
            padding: '60px',
            fontFamily: 'Inter, sans-serif',
            color: 'white',
            position: 'relative',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: '40px',
                  right: '60px',
                  fontSize: '24px',
                  fontWeight: '600',
                  opacity: 0.9,
                },
                children: 'TicketBazaar'
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '52px',
                  fontWeight: '800',
                  textAlign: 'center',
                  marginBottom: '20px',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  lineHeight: '1.1',
                },
                children: event.eventTitle
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '28px',
                  fontWeight: '500',
                  textAlign: 'center',
                  marginBottom: '40px',
                  opacity: 0.95,
                },
                children: `${new Date(event.eventDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: '24px',
                  textAlign: 'center',
                  marginBottom: '30px',
                  opacity: 0.9,
                },
                children: `📍 ${event.venue}, ${event.city}`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '15px',
                  padding: '20px 40px',
                  fontSize: '22px',
                  fontWeight: '600',
                },
                children: `🎟️ ${availableCount} ticket${availableCount !== 1 ? 's' : ''} available`
              }
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '40px',
                  fontSize: '20px',
                  opacity: 0.8,
                },
                children: "India's Trusted Ticket Marketplace"
              }
            }
          ]
        }
      },
      {
        width: 1200,
        height: 630,
        fonts: fontData.byteLength > 0 ? [
          {
            name: 'Inter',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ] : []
      }
    );

    // Convert SVG to PNG using Resvg
    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(pngBuffer);

  } catch (error) {
    console.error("Error generating event OG image:", error);
    return sendFallbackImage(res);
  }
});

// Helper function to send fallback image
function sendFallbackImage(res: any) {
  try {
    // Try to read the existing fallback image
    const fallbackPath = path.join(process.cwd(), "client", "public", "images", "ticket-bazaar-social.png");
    const fallbackImage = readFileSync(fallbackPath);
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache fallback for 24 hours
    res.send(fallbackImage);
  } catch (error) {
    console.error("Error sending fallback image:", error);
    // If fallback also fails, send a simple response
    res.status(404).json({ error: "Image not found" });
  }
}

export default router;