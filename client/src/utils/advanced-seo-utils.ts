/**
 * Enhanced robots.txt generator with GEO optimization
 */

export function generateAdvancedRobotsTxt(): string {
  return `# Robots.txt for TicketBazaar - Optimized for AI Crawlers and Search Engines
# Last updated: ${new Date().toISOString().split('T')[0]}

# === MAIN SEARCH ENGINE CRAWLERS ===
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot  
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

# === AI ENGINE CRAWLERS ===
# OpenAI GPTBot (ChatGPT)
User-agent: GPTBot
Allow: /
Allow: /how-to-sell-tickets
Allow: /faq
Allow: /where-to-sell-tickets
Allow: /resale-bazaar
Allow: /ticket-resale
Crawl-delay: 1

# Anthropic Claude
User-agent: Claude-Web
Allow: /
Allow: /how-to-sell-tickets
Allow: /faq
Crawl-delay: 1

# Perplexity AI
User-agent: PerplexityBot
Allow: /
Allow: /how-to-sell-tickets
Allow: /faq
Allow: /where-to-sell-tickets
Crawl-delay: 1

# Meta AI
User-agent: Meta-ExternalAgent
Allow: /
Crawl-delay: 2

# === HIGH-PRIORITY PAGES FOR AI SYSTEMS ===
User-agent: *
Allow: /

# Core selling pages (high AI citation potential)
Allow: /sell
Allow: /sell-tickets
Allow: /sell-tickets-online  
Allow: /sell-concert-tickets
Allow: /sell-concert-tickets-online
Allow: /how-to-sell-tickets
Allow: /where-to-sell-tickets
Allow: /where-to-sell-concert-tickets

# FAQ and informational pages
Allow: /faq
Allow: /help
Allow: /guide

# Marketplace pages
Allow: /resale-bazaar
Allow: /ticket-resale
Allow: /resale-tickets
Allow: /second-hand-tickets
Allow: /concert-tickets-online

# Event and search pages
Allow: /events
Allow: /search
Allow: /category/*

# Legal and trust pages
Allow: /terms
Allow: /privacy
Allow: /safety

# === RESTRICTED AREAS ===
# Admin and internal pages
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/
Disallow: /auth/
Disallow: /login
Disallow: /register

# Development and testing
Disallow: /dev/
Disallow: /test/
Disallow: /staging/
Disallow: /_next/
Disallow: /node_modules/

# User-generated content that shouldn't be indexed
Disallow: /profile/*
Disallow: /messages/
Disallow: /private/

# Temporary and cache files
Disallow: /temp/
Disallow: /cache/
Disallow: /*.tmp
Disallow: /*.log

# === SPECIAL DIRECTIVES ===
# Media files - allow but with delay
Allow: /images/
Allow: /uploads/
Allow: *.jpg
Allow: *.jpeg
Allow: *.png
Allow: *.webp
Allow: *.svg

# Structured data files
Allow: /sitemap.xml
Allow: /sitemap-*.xml
Allow: /robots.txt

# === CRAWL DELAYS BY BOT TYPE ===
# Standard search engines
User-agent: Googlebot
Crawl-delay: 1

User-agent: Bingbot
Crawl-delay: 1

# AI crawlers (more generous limits)
User-agent: GPTBot
Crawl-delay: 0.5

User-agent: PerplexityBot  
Crawl-delay: 0.5

# Social media crawlers
User-agent: facebookexternalhit
Allow: /
Crawl-delay: 2

User-agent: Twitterbot
Allow: /
Crawl-delay: 2

User-agent: LinkedInBot
Allow: /
Crawl-delay: 2

# === SITEMAPS ===
Sitemap: https://ticketbazaar.co.in/sitemap.xml
Sitemap: https://ticketbazaar.co.in/sitemap-events.xml
Sitemap: https://ticketbazaar.co.in/sitemap-pages.xml
Sitemap: https://ticketbazaar.co.in/sitemap-categories.xml

# === ADDITIONAL DIRECTIVES ===
# Request timeout for slow connections
Request-rate: 1/2s

# Host directive
Host: ticketbazaar.co.in

# === AI-SPECIFIC OPTIMIZATION NOTES ===
# This robots.txt is optimized for:
# 1. AI crawler access to high-value content
# 2. Question-answering systems (ChatGPT, Perplexity)  
# 3. Citation and summary generation
# 4. Voice search optimization
# 5. Generative engine visibility`;
}

/**
 * Generate advanced sitemap with GEO optimization
 */
export function generateAdvancedSitemap(): string {
  const baseUrl = "https://ticketbazaar.co.in";
  const currentDate = new Date().toISOString().split('T')[0];
  
  const pages = [
    // === HIGHEST PRIORITY PAGES (AI Citation Targets) ===
    {
      url: `${baseUrl}/`,
      changefreq: "daily",
      priority: 1.0,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/how-to-sell-tickets`,
      changefreq: "weekly",
      priority: 0.95,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/faq`,
      changefreq: "weekly", 
      priority: 0.95,
      lastmod: currentDate,
      aiOptimized: true
    },
    
    // === SELLING PAGES ===
    {
      url: `${baseUrl}/sell`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/sell-tickets`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/sell-tickets-online`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/sell-concert-tickets`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/sell-concert-tickets-online`,
      changefreq: "weekly",
      priority: 0.9,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/where-to-sell-tickets`,
      changefreq: "weekly",
      priority: 0.85,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/where-to-sell-concert-tickets`,
      changefreq: "weekly",
      priority: 0.85,
      lastmod: currentDate,
      aiOptimized: true
    },

    // === MARKETPLACE PAGES ===
    {
      url: `${baseUrl}/resale-bazaar`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/ticket-resale`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/resale-tickets`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/second-hand-tickets`,
      changefreq: "daily",
      priority: 0.8,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/concert-tickets-online`,
      changefreq: "daily",
      priority: 0.75,
      lastmod: currentDate,
      aiOptimized: true
    },

    // === CORE FUNCTIONALITY ===
    {
      url: `${baseUrl}/events`,
      changefreq: "hourly",
      priority: 0.8,
      lastmod: currentDate,
      aiOptimized: false
    },
    {
      url: `${baseUrl}/search`,
      changefreq: "daily",
      priority: 0.7,
      lastmod: currentDate,
      aiOptimized: false
    },

    // === INFORMATIONAL PAGES ===
    {
      url: `${baseUrl}/about`,
      changefreq: "monthly",
      priority: 0.6,
      lastmod: currentDate,
      aiOptimized: false
    },
    {
      url: `${baseUrl}/safety`,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: currentDate,
      aiOptimized: true
    },
    {
      url: `${baseUrl}/terms`,
      changefreq: "monthly",
      priority: 0.5,
      lastmod: currentDate,
      aiOptimized: false
    },
    {
      url: `${baseUrl}/privacy`,
      changefreq: "monthly",
      priority: 0.5,
      lastmod: currentDate,
      aiOptimized: false
    }
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  pages.forEach(page => {
    sitemap += `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <mobile:mobile/>`;
    
    if (page.aiOptimized) {
      sitemap += `
    <!-- AI Optimized Page -->`;
    }
    
    sitemap += `
  </url>
`;
  });

  sitemap += `</urlset>`;
  
  return sitemap;
}

/**
 * Generate performance optimization headers
 */
export function generatePerformanceHeaders(): Record<string, string> {
  return {
    // === CACHING HEADERS ===
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': new Date(Date.now() + 31536000000).toUTCString(),
    'ETag': `"${Date.now()}"`,
    
    // === COMPRESSION ===
    'Content-Encoding': 'gzip, br',
    'Vary': 'Accept-Encoding, User-Agent',
    
    // === SECURITY HEADERS ===
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
    
    // === PERFORMANCE HINTS ===
    'Link': [
      '</fonts/inter.woff2>; rel=preload; as=font; type=font/woff2; crossorigin',
      '</images/logo.webp>; rel=preload; as=image',
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://www.google-analytics.com>; rel=dns-prefetch'
    ].join(', '),
    
    // === AI CRAWLER HINTS ===
    'X-Robots-Tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    'X-AI-Optimized': 'true',
    
    // === MOBILE OPTIMIZATION ===
    'Viewport': 'width=device-width, initial-scale=1.0',
    'X-UA-Compatible': 'IE=edge',
    
    // === CONTENT TYPE ===
    'Content-Type': 'text/html; charset=utf-8',
    
    // === PERFORMANCE MONITORING ===
    'Server-Timing': 'db;dur=23, app;dur=47',
    'X-Response-Time': '70ms'
  };
}

/**
 * Generate advanced meta tags for GEO optimization
 */
export function generateAdvancedMetaTags(pageData: {
  title: string;
  description: string;
  keywords: string;
  url: string;
  type?: string;
  aiOptimized?: boolean;
}): string {
  const { title, description, keywords, url, type = "website", aiOptimized = false } = pageData;
  
  return `
    <!-- === BASIC META TAGS === -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="${keywords}" />
    <link rel="canonical" href="${url}" />
    
    <!-- === AI OPTIMIZATION TAGS === -->
    ${aiOptimized ? '<meta name="ai-optimized" content="true" />' : ''}
    <meta name="citation-ready" content="true" />
    <meta name="question-answering" content="optimized" />
    
    <!-- === OPEN GRAPH (ENHANCED) === -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:image" content="https://ticketbazaar.co.in/images/ticket-bazaar-social.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title} - Ticket Bazaar" />
    <meta property="og:site_name" content="Ticket Bazaar" />
    <meta property="og:locale" content="en_IN" />
    <meta property="article:author" content="Ticket Bazaar" />
    <meta property="article:publisher" content="https://www.facebook.com/ticketbazaar" />
    
    <!-- === TWITTER CARD (ENHANCED) === -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="https://ticketbazaar.co.in/images/ticket-bazaar-social.png" />
    <meta name="twitter:image:alt" content="${title} - Ticket Bazaar" />
    <meta name="twitter:site" content="@ticketbazaar" />
    <meta name="twitter:creator" content="@ticketbazaar" />
    
    <!-- === SEARCH ENGINE DIRECTIVES === -->
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta name="bingbot" content="index, follow" />
    
    <!-- === AI CRAWLER DIRECTIVES === -->
    <meta name="GPTBot" content="index, follow" />
    <meta name="PerplexityBot" content="index, follow" />
    <meta name="Claude-Web" content="index, follow" />
    
    <!-- === MOBILE & PERFORMANCE === -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
    <meta name="theme-color" content="#3B82F6" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    
    <!-- === GEOGRAPHIC === -->
    <meta name="geo.region" content="IN" />
    <meta name="geo.placename" content="India" />
    <meta name="geo.position" content="20.5937;78.9629" />
    <meta name="ICBM" content="20.5937, 78.9629" />
    
    <!-- === LANGUAGE & ACCESSIBILITY === -->
    <meta http-equiv="content-language" content="en-in" />
    <meta name="language" content="English" />
    
    <!-- === PERFORMANCE HINTS === -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com" />
    <link rel="dns-prefetch" href="//www.google-analytics.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    
    <!-- === MANIFEST & ICONS === -->
    <link rel="manifest" href="/manifest.json" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
  `.trim();
}
