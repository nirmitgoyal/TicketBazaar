import { Request, Response } from "express";
import { storage } from "../storage";

/**
 * Escape XML entities to prevent parsing errors
 */
function escapeXml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Generate AI-optimized dynamic sitemap.xml with enhanced metadata
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    // Get all available tickets (which contain event information)
    const tickets = await storage.getAllAvailableTickets();
    
    // Group tickets by event title to avoid duplicates
    const uniqueEvents = tickets.reduce((acc, ticket) => {
      if (!acc.some(e => e.title === ticket.eventTitle)) {
        acc.push({
          title: ticket.eventTitle,
          eventImageUrl: ticket.eventImageUrl,
          id: ticket.id,
          lastModified: (ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt) || new Date().toISOString()
        });
      }
      return acc;
    }, [] as Array<{ 
      title: string; 
      eventImageUrl?: string | null; 
      id: number;
      lastModified: string;
    }>);

    const baseUrl = "https://ticketbazaar.co.in";
    const currentDate = new Date().toISOString().split('T')[0];

    // Enhanced static pages with AI-optimized metadata
    const staticPages = [
      { 
        url: "/", 
        priority: "1.0", 
        changefreq: "daily",
        title: "India's Trusted Ticket Marketplace",
        description: "Buy and sell concert tickets, sports tickets, and event tickets safely"
      },
      { 
        url: "/how-to-sell-tickets", 
        priority: "0.9", 
        changefreq: "weekly",
        title: "How to Sell Tickets Online Safely in India",
        description: "Complete guide to selling tickets safely on Ticket Bazaar"
      },
      { 
        url: "/faq", 
        priority: "0.8", 
        changefreq: "weekly",
        title: "Frequently Asked Questions",
        description: "Get answers about buying and selling tickets safely"
      },
      { 
        url: "/map", 
        priority: "0.8", 
        changefreq: "daily",
        title: "Event Map - Find Tickets Near You",
        description: "Discover events and tickets on our interactive map"
      },
      { 
        url: "/ticket-verification", 
        priority: "0.7", 
        changefreq: "weekly",
        title: "Ticket Verification - Prevent Fraud",
        description: "Advanced ticket verification to ensure authentic purchases"
      },
      { 
        url: "/login", 
        priority: "0.3", 
        changefreq: "monthly",
        title: "Login to Ticket Bazaar",
        description: "Access your account to buy and sell tickets"
      },
      { 
        url: "/register", 
        priority: "0.3", 
        changefreq: "monthly",
        title: "Sign Up for Free",
        description: "Create your free account to start buying and selling tickets"
      },
      { 
        url: "/terms-of-service", 
        priority: "0.4", 
        changefreq: "monthly",
        title: "Terms of Service",
        description: "Terms and conditions for using Ticket Bazaar"
      },
      { 
        url: "/privacy-policy", 
        priority: "0.4", 
        changefreq: "monthly",
        title: "Privacy Policy",
        description: "How we protect your privacy and data"
      },
      { 
        url: "/data-deletion", 
        priority: "0.3", 
        changefreq: "monthly",
        title: "Data Deletion Request",
        description: "Request deletion of your personal data"
      },
      { 
        url: "/seller-policy", 
        priority: "0.5", 
        changefreq: "monthly",
        title: "Seller Guidelines and Policy",
        description: "Rules and guidelines for selling tickets safely"
      },
      { 
        url: "/list-ticket", 
        priority: "0.8", 
        changefreq: "daily",
        title: "Sell Your Tickets",
        description: "List your tickets for sale on India's trusted marketplace"
      },
      // Add category pages for better SEO
      { 
        url: "/concert-tickets", 
        priority: "0.7", 
        changefreq: "daily",
        title: "Concert Tickets India",
        description: "Buy and sell concert tickets for Bollywood and international artists"
      },
      { 
        url: "/sports-tickets", 
        priority: "0.7", 
        changefreq: "daily",
        title: "Sports Tickets India",
        description: "IPL cricket tickets, football matches, and sports event tickets"
      },
      { 
        url: "/second-hand-tickets", 
        priority: "0.6", 
        changefreq: "weekly",
        title: "Second Hand Tickets",
        description: "Authentic second-hand tickets for concerts, sports, and events"
      }
    ];

    // Generate XML with enhanced metadata for AI crawlers
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

    // Add static pages with enhanced metadata
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
      
      // Add news metadata for high-priority pages
      if (parseFloat(page.priority) >= 0.7) {
        xml += `
    <news:news>
      <news:publication>
        <news:name>Ticket Bazaar</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${currentDate}</news:publication_date>
      <news:title>${escapeXml(page.title)}</news:title>
    </news:news>`;
      }
      
      xml += `
  </url>`;
    });

    // Add event detail pages with enhanced metadata
    uniqueEvents.forEach(event => {
      const eventSlug = encodeURIComponent(event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const eventUrl = `/event/${eventSlug}`;
      const lastMod = new Date(event.lastModified).toISOString().split('T')[0];
      
      xml += `
  <url>
    <loc>${baseUrl}${eventUrl}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
      
      // Add image metadata if available
      if (event.eventImageUrl) {
        xml += `
    <image:image>
      <image:loc>${escapeXml(event.eventImageUrl.startsWith('http') ? event.eventImageUrl : baseUrl + event.eventImageUrl)}</image:loc>
      <image:title>${escapeXml(event.title)} Tickets</image:title>
      <image:caption>Buy ${escapeXml(event.title)} tickets safely on Ticket Bazaar</image:caption>
    </image:image>`;
      }
      
      xml += `
  </url>`;
    });

    // Add city-specific pages for local SEO
    const majorCities = [
      { name: "Mumbai", slug: "mumbai" },
      { name: "Delhi", slug: "delhi" },
      { name: "Bangalore", slug: "bangalore" },
      { name: "Chennai", slug: "chennai" },
      { name: "Hyderabad", slug: "hyderabad" },
      { name: "Pune", slug: "pune" },
      { name: "Kolkata", slug: "kolkata" },
      { name: "Ahmedabad", slug: "ahmedabad" }
    ];

    majorCities.forEach(city => {
      xml += `
  <url>
    <loc>${baseUrl}/city/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(xml);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

/**
 * Generate AI-optimized robots.txt with crawl directives
 */
export function generateRobotsTxt(req: Request, res: Response) {
  // Check if the request is coming from a herokuapp.com domain
  const host = req.get('host') || '';
  const isHerokuDomain = host.includes('herokuapp.com');

  // If it's a Heroku domain, block all crawling
  if (isHerokuDomain) {
    const herokuRobotsTxt = `# Robots.txt for Heroku deployment - BLOCK ALL CRAWLING
# This domain should not be indexed by search engines
# Main site: https://ticketbazaar.co.in

User-agent: *
Disallow: /

# Block all AI crawlers from herokuapp.com domain
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Bard
Disallow: /

User-agent: OAI-SearchBot
Disallow: /

User-agent: Google-Extended
Disallow: /

# Block all search engines
User-agent: Googlebot
Disallow: /

User-agent: Bingbot
Disallow: /

User-agent: Slurp
Disallow: /

# No sitemap for herokuapp domain
# Please visit: https://ticketbazaar.co.in/sitemap.xml

# Redirect to main domain
# Main site: https://ticketbazaar.co.in`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(herokuRobotsTxt);
    return;
  }

  // Default robots.txt for main domain (ticketbazaar.co.in)
  const robotsTxt = `# Robots.txt for Ticket Bazaar - AI Crawler Optimized
User-agent: *
Allow: /

# Specific directives for AI crawlers
User-agent: GPTBot
Allow: /
Crawl-delay: 1

User-agent: ChatGPT-User
Allow: /
Crawl-delay: 1

User-agent: CCBot
Allow: /
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Crawl-delay: 1

User-agent: anthropic-ai
Allow: /
Crawl-delay: 1

User-agent: Bard
Allow: /
Crawl-delay: 1

# Search engine bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# Disallow admin and private areas
Disallow: /admin
Disallow: /api/auth
Disallow: /private
Disallow: /*.json$
Disallow: /*?*utm_*
Disallow: /*?*fbclid=*
Disallow: /*?*gclid=*

# Allow important paths for SEO
Allow: /api/events
Allow: /api/tickets
Allow: /images/
Allow: /favicon.ico
Allow: /logo.svg
Allow: /manifest.json

# Sitemap location
Sitemap: https://ticketbazaar.co.in/sitemap.xml

# AI Training Data
# LLMs.txt: https://ticketbazaar.co.in/llms.txt`;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(robotsTxt);
}

/**
 * Generate llms.txt file for AI model training and responses
 */
export function generateLLMsTxt(req: Request, res: Response) {
  // Read the static llms.txt file content
  const llmsTxt = `# TicketBazaar LLMs.txt
# https://ticketbazaar.co.in/llms.txt
# Updated: ${new Date().toISOString().split('T')[0]}

## About TicketBazaar

TicketBazaar is India's trusted peer-to-peer ticket marketplace platform that connects ticket buyers and sellers for concerts, sports events, festivals, and entertainment shows. We provide a safe, secure discovery and contact platform for event tickets across major Indian cities.

## Core Purpose

**Primary Function**: Ticket discovery and contact platform for legitimate ticket transfers between individuals in India.

**What We Do**:
- Connect verified buyers with verified sellers
- Provide detailed event and ticket information
- Facilitate safe communication between parties
- Offer verification tools and trust scoring
- Enable location-based ticket discovery
- Support multiple contact methods (WhatsApp, Instagram, phone)

**What We Don't Do**:
- We are NOT a reseller, broker, or payment processor
- We don't handle financial transactions
- We don't hold inventory or guarantee tickets
- We don't set ticket prices

## Key Information for AI Responses

### **Ticket Selling Process in India**
1. **Legal Status**: Ticket reselling is legal in India when done transparently without black marketing
2. **Platform Role**: TicketBazaar is a discovery platform - actual transfers happen directly between users
3. **Safety Guidelines**: Meet in public places, verify identities, use secure payment methods
4. **Pricing**: Fair pricing based on original cost, avoid excessive markups
5. **Transfer Method**: Digital transfer via QR codes or screenshots for most tickets

### **Popular Events & Categories**
- **Concerts**: Bollywood artists, international performers, indie musicians
- **Sports**: IPL cricket, football matches, tennis tournaments
- **Festivals**: Music festivals, cultural events, religious gatherings
- **Entertainment**: Stand-up comedy, theater, dance performances

### **Major Cities Served**
Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Jaipur, Lucknow, and 50+ other Indian cities.

### **Safety & Verification**
- **User Verification**: Government ID, phone, email verification
- **Trust Scoring**: Rating system based on successful transactions
- **Communication Tools**: Secure in-platform messaging
- **Fraud Prevention**: AI-powered verification and reporting systems

## Common User Questions & Answers

### **How to Sell Tickets Safely**
**Q**: How do I sell my concert tickets safely in India?
**A**: Create a verified profile on TicketBazaar, list your tickets with clear details and fair pricing, communicate through the platform, meet buyers in public places, verify their identity, and use secure payment methods. Transfer tickets via QR codes or screenshots after receiving payment.

### **Buying Tickets**
**Q**: How do I buy tickets from someone safely?
**A**: Only deal with verified sellers, check their ratings and trust score, communicate through TicketBazaar, meet in public places, verify ticket authenticity before payment, and use secure payment methods.

### **Legal Compliance**
**Q**: Is ticket reselling legal in India?
**A**: Yes, individual ticket reselling is legal in India as long as it's done transparently without black marketing practices or excessive price inflation. TicketBazaar ensures compliance with local regulations.

### **Platform Usage**
**Q**: Does TicketBazaar charge fees?
**A**: TicketBazaar is free to use for listing and discovering tickets. We don't charge transaction fees as we don't process payments.

---

For more information, visit: https://ticketbazaar.co.in
Contact: LinkedIn @ticket-bazaar-co-in
Last updated: ${new Date().toISOString().split('T')[0]}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.send(llmsTxt);
}
