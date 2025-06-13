/**
 * Automatic Sitemap Generator for Global SEO
 * Generates XML sitemaps for better search engine discovery
 */

import { GLOBAL_CITIES, GLOBAL_EVENT_CATEGORIES } from './global-seo-utils';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: Array<{
    hreflang: string;
    href: string;
  }>;
}

/**
 * Generate main sitemap URLs
 */
export function generateMainSitemapUrls(): SitemapUrl[] {
  const baseUrl = 'https://tickethub.global';
  const currentDate = new Date().toISOString().split('T')[0];

  return [
    {
      loc: baseUrl,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 1.0,
      alternates: [
        { hreflang: 'en', href: baseUrl },
        { hreflang: 'en-US', href: baseUrl },
        { hreflang: 'en-GB', href: `https://uk.tickethub.global` },
        { hreflang: 'en-AU', href: `https://au.tickethub.global` },
        { hreflang: 'en-CA', href: `https://ca.tickethub.global` },
        { hreflang: 'x-default', href: baseUrl }
      ]
    },
    {
      loc: `${baseUrl}/cities`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/list-ticket-global`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: `${baseUrl}/map`,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: 0.7
    }
  ];
}

/**
 * Generate category sitemap URLs
 */
export function generateCategorySitemapUrls(): SitemapUrl[] {
  const baseUrl = 'https://tickethub.global';
  const currentDate = new Date().toISOString().split('T')[0];

  return Object.keys(GLOBAL_EVENT_CATEGORIES).map(category => ({
    loc: `${baseUrl}/events/category/${category}`,
    lastmod: currentDate,
    changefreq: 'daily',
    priority: 0.8,
    alternates: [
      { hreflang: 'en', href: `${baseUrl}/events/category/${category}` },
      { hreflang: 'en-US', href: `${baseUrl}/events/category/${category}` },
      { hreflang: 'en-GB', href: `https://uk.tickethub.global/events/category/${category}` },
      { hreflang: 'x-default', href: `${baseUrl}/events/category/${category}` }
    ]
  }));
}

/**
 * Generate city sitemap URLs
 */
export function generateCitySitemapUrls(): SitemapUrl[] {
  const baseUrl = 'https://tickethub.global';
  const currentDate = new Date().toISOString().split('T')[0];

  return Object.entries(GLOBAL_CITIES).map(([slug, city]) => ({
    loc: `${baseUrl}/city/${slug}`,
    lastmod: currentDate,
    changefreq: 'weekly',
    priority: 0.7,
    alternates: [
      { hreflang: 'en', href: `${baseUrl}/city/${slug}` },
      { hreflang: 'x-default', href: `${baseUrl}/city/${slug}` }
    ]
  }));
}

/**
 * Generate event-specific sitemap URLs
 */
export function generateEventSitemapUrls(events: any[]): SitemapUrl[] {
  const baseUrl = 'https://tickethub.global';
  const currentDate = new Date().toISOString().split('T')[0];

  return events.map(event => ({
    loc: `${baseUrl}/event/${event.id}`,
    lastmod: new Date(event.updatedAt || event.createdAt || currentDate).toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.6
  }));
}

/**
 * Generate complete sitemap XML
 */
export function generateSitemapXML(urls: SitemapUrl[]): string {
  const xmlUrls = urls.map(url => {
    let urlXml = `  <url>
    <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      urlXml += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXml += `
    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      urlXml += `
    <priority>${url.priority}</priority>`;
    }
    
    if (url.alternates && url.alternates.length > 0) {
      url.alternates.forEach(alternate => {
        urlXml += `
    <xhtml:link rel="alternate" hreflang="${alternate.hreflang}" href="${alternate.href}" />`;
      });
    }
    
    urlXml += `
  </url>`;
    
    return urlXml;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlUrls}
</urlset>`;
}

/**
 * Generate sitemap index XML for multiple sitemaps
 */
export function generateSitemapIndexXML(sitemaps: Array<{name: string, lastmod: string}>): string {
  const baseUrl = 'https://tickethub.global';
  
  const sitemapXml = sitemaps.map(sitemap => `  <sitemap>
    <loc>${baseUrl}/sitemaps/${sitemap.name}.xml</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapXml}
</sitemapindex>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = 'https://tickethub.global';
  
  return `User-agent: *
Allow: /

# Allow all major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/
Disallow: /.*

# Allow important discovery pages
Allow: /
Allow: /cities
Allow: /city/*
Allow: /events/category/*
Allow: /event/*
Allow: /map
Allow: /list-ticket-global

# Sitemap locations
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemaps/main.xml
Sitemap: ${baseUrl}/sitemaps/cities.xml
Sitemap: ${baseUrl}/sitemaps/categories.xml
Sitemap: ${baseUrl}/sitemaps/events.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;
}

/**
 * Generate all sitemaps for the application
 */
export function generateAllSitemaps(events: any[] = []) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  const sitemaps = {
    main: {
      urls: generateMainSitemapUrls(),
      lastmod: currentDate
    },
    cities: {
      urls: generateCitySitemapUrls(),
      lastmod: currentDate
    },
    categories: {
      urls: generateCategorySitemapUrls(),
      lastmod: currentDate
    },
    events: {
      urls: generateEventSitemapUrls(events),
      lastmod: currentDate
    }
  };

  const xmlSitemaps = Object.entries(sitemaps).map(([name, data]) => ({
    name,
    xml: generateSitemapXML(data.urls),
    lastmod: data.lastmod
  }));

  const sitemapIndex = generateSitemapIndexXML(
    xmlSitemaps.map(s => ({ name: s.name, lastmod: s.lastmod }))
  );

  const robotsTxt = generateRobotsTxt();

  return {
    sitemaps: xmlSitemaps,
    sitemapIndex,
    robotsTxt
  };
}

/**
 * Get priority for different page types
 */
export function getPagePriority(pageType: string): number {
  const priorities: Record<string, number> = {
    homepage: 1.0,
    cities: 0.9,
    category: 0.8,
    city: 0.7,
    event: 0.6,
    listing: 0.5,
    profile: 0.4
  };
  
  return priorities[pageType] || 0.5;
}

/**
 * Get change frequency for different page types
 */
export function getChangeFrequency(pageType: string): 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' {
  const frequencies: Record<string, any> = {
    homepage: 'daily',
    cities: 'weekly',
    category: 'daily',
    city: 'weekly',
    event: 'weekly',
    listing: 'daily',
    profile: 'monthly'
  };
  
  return frequencies[pageType] || 'weekly';
}