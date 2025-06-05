
import { Router } from "express";
import { db } from "../db";
import { events } from "../../shared/schema";

const router = Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    // Get all events from database
    const allEvents = await db.select().from(events);
    
    const baseUrl = "https://ticketbazaar.co.in";
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Map View -->
  <url>
    <loc>${baseUrl}/map</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Authentication Pages -->
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Legal Pages -->
  <url>
    <loc>${baseUrl}/terms-of-service</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/data-deletion</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
  
  <!-- Event Listing Page -->
  <url>
    <loc>${baseUrl}/list-ticket</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    // Add all events dynamically
    allEvents.forEach(event => {
      sitemap += `
  <url>
    <loc>${baseUrl}/event/${event.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add category pages
    const categories = ['concerts', 'sports', 'festivals', 'comedy', 'theatre', 'workshops'];
    categories.forEach(category => {
      sitemap += `
  <url>
    <loc>${baseUrl}/events/category/${category}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

export default router;
