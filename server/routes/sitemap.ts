import { Request, Response } from "express";
import { storage } from "../storage";

/**
 * Generate dynamic sitemap.xml based on current events and pages
 */
export async function generateSitemap(req: Request, res: Response) {
  try {
    // Get all events for dynamic URLs
    const events = await storage.getAllEvents();
    
    // Group events by title to avoid duplicates
    const uniqueEvents = events.reduce((acc, event) => {
      if (!acc.some(e => e.title === event.title)) {
        acc.push(event);
      }
      return acc;
    }, [] as typeof events);

    const baseUrl = "https://ticketbazaar.co.in";
    const currentDate = new Date().toISOString().split('T')[0];

    // Static pages configuration
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/map", priority: "0.9", changefreq: "daily" },
      { url: "/login", priority: "0.3", changefreq: "monthly" },
      { url: "/register", priority: "0.3", changefreq: "monthly" },
      { url: "/terms-of-service", priority: "0.5", changefreq: "monthly" },
      { url: "/privacy-policy", priority: "0.5", changefreq: "monthly" },
      { url: "/data-deletion", priority: "0.4", changefreq: "monthly" },
      { url: "/faq", priority: "0.6", changefreq: "weekly" },
      { url: "/seller-policy", priority: "0.5", changefreq: "monthly" },
      { url: "/list-ticket", priority: "0.7", changefreq: "weekly" },
    ];

    // Category pages
    const categories = ["concerts", "sports", "festivals", "theater", "comedy", "workshops"];
    const categoryPages = categories.map(category => ({
      url: `/events/category/${category}`,
      priority: "0.8",
      changefreq: "daily"
    }));

    // Generate XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

    // Add static pages
    staticPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add category pages
    categoryPages.forEach(page => {
      xml += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Add event detail pages
    uniqueEvents.forEach(event => {
      const eventUrl = `/event/${encodeURIComponent(event.title)}`;
      xml += `
  <url>
    <loc>${baseUrl}${eventUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;
      
      // Add image if available
      if (event.eventImageUrl) {
        xml += `
    <image:image>
      <image:loc>${event.eventImageUrl.startsWith('http') ? event.eventImageUrl : baseUrl + event.eventImageUrl}</image:loc>
      <image:title>${event.title}</image:title>
      <image:caption>Event tickets for ${event.title}</image:caption>
    </image:image>`;
      }
      
      xml += `
  </url>`;
    });

    xml += `
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

/**
 * Generate robots.txt file
 */
export function generateRobotsTxt(req: Request, res: Response) {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/processing
Disallow: /complete-profile
Disallow: /my-tickets
Disallow: /profile
Disallow: /ticket-verification
Disallow: /*?*
Allow: /events/category/

# Allow specific search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Crawl delay
Crawl-delay: 1

Sitemap: https://ticketbazaar.co.in/sitemap.xml

# Host directive
Host: ticketbazaar.co.in`;

  res.set('Content-Type', 'text/plain');
  res.send(robotsTxt);
}