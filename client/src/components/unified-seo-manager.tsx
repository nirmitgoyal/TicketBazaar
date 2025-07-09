import React from "react";
import { Helmet } from "react-helmet";
import { 
  generateCanonicalUrl,
  generateMetaDescription,
  generatePageTitle,
  generateKeywords,
  generateOrganizationStructuredData,
  type BreadcrumbItem
} from "@/utils/seo-utils";

export interface UnifiedSEOProps {
  /** Page type for auto-generating meta content */
  type?: "event" | "search" | "category" | "general" | "selling" | "how-to";
  
  /** Custom title override */
  title?: string;
  
  /** Custom description override */
  description?: string;
  
  /** Custom canonical URL override */
  canonicalUrl?: string;
  
  /** Open Graph image URL */
  ogImage?: string;
  
  /** Open Graph type */
  ogType?: "website" | "article" | "event" | "marketplace";
  
  /** Custom keywords override */
  keywords?: string;
  
  /** Data object for dynamic content generation */
  data?: any;
  
  /** Structured data schemas */
  structuredData?: object[];
  
  /** Breadcrumb navigation items */
  breadcrumbs?: BreadcrumbItem[];
  
  /** Prevent search engine indexing */
  noIndex?: boolean;
  
  /** International language alternates */
  hreflang?: Record<string, string>;
  
  /** Additional custom meta tags */
  children?: React.ReactNode;
}

/**
 * Unified SEO Manager component that consolidates all SEO functionality
 * 
 * Features:
 * - Dynamic meta tag generation based on page type and data
 * - Comprehensive Open Graph and Twitter Card support
 * - Structured data (JSON-LD) support
 * - International SEO with hreflang
 * - Mobile optimization
 * - Performance optimizations (preconnect)
 * - Breadcrumb structured data
 * - Custom meta tag support
 */
export default function UnifiedSEOManager({
  type = "general",
  title,
  description,
  canonicalUrl,
  ogImage = "/images/ticket-bazaar-social.png",
  ogType = "website",
  keywords,
  data,
  structuredData = [],
  breadcrumbs,
  noIndex = false,
  hreflang = {},
  children,
}: UnifiedSEOProps) {
  // Generate dynamic content based on type and data
  const finalTitle = title || generatePageTitle(type, data);
  const finalDescription = description || generateMetaDescription(type, data);
  const finalKeywords = keywords || generateKeywords(type, data);
  const finalCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? generateCanonicalUrl(window.location.pathname) : '');

  // Ensure the title has the site name
  const fullTitle = !finalTitle.includes("Ticket Bazaar")
    ? `${finalTitle} | Ticket Bazaar`
    : finalTitle;

  // Generate full image URL
  const fullOgImage = ogImage.startsWith('http') 
    ? ogImage 
    : `https://ticketbazaar.co.in${ogImage}`;

  // Generate breadcrumb structured data if provided
  const breadcrumbStructuredData = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : null;

  // Generate default structured data
  const defaultStructuredData = [generateOrganizationStructuredData()];

  // Combine all structured data
  const allStructuredData = [
    ...defaultStructuredData,
    ...structuredData,
    ...(breadcrumbStructuredData ? [breadcrumbStructuredData] : [])
  ];

  // Default hreflang entries
  const defaultHreflang = {
    "en-in": finalCanonicalUrl,
    "hi-in": finalCanonicalUrl.replace('ticketbazaar.co.in', 'hi.ticketbazaar.co.in'),
    "x-default": finalCanonicalUrl,
    ...hreflang
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Robots directives */}
      <meta 
        name="robots" 
        content={noIndex 
          ? "noindex, nofollow" 
          : "index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1"
        } 
      />
      <meta 
        name="googlebot" 
        content={noIndex 
          ? "noindex, nofollow" 
          : "index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1"
        } 
      />

      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en-in" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Mobile and Performance */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1976D2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Ticket Bazaar" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${finalTitle} - Ticket Bazaar`} />
      <meta property="og:site_name" content="Ticket Bazaar" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:rich_attachment" content="true" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={`${finalTitle} - Ticket Bazaar`} />
      <meta name="twitter:site" content="@ticketbazaar" />
      <meta name="twitter:creator" content="@ticketbazaar" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Ticket Bazaar" />
      <meta name="publisher" content="Ticket Bazaar" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="1 day" />
      <meta name="coverage" content="India" />
      <meta name="target" content="all" />
      <meta name="subject" content="Ticket Resale and Selling Platform" />
      <meta name="classification" content="Marketplace, Entertainment, Events, Tickets" />
      <meta name="application-name" content="Ticket Bazaar" />

      {/* Microsoft/Windows */}
      <meta name="msapplication-TileColor" content="#1976D2" />
      <meta name="msapplication-config" content="/browserconfig.xml" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://maps.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

      {/* Alternative language versions (hreflang) */}
      {Object.entries(defaultHreflang).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}

      {/* PWA meta tags */}
      <meta name="apple-touch-fullscreen" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* Structured Data (JSON-LD) */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}

      {/* Additional custom tags */}
      {children}
    </Helmet>
  );
}

/**
 * Simplified SEO component for basic pages
 */
export function SimpleSEO({ title, description, children }: { 
  title: string; 
  description: string; 
  children?: React.ReactNode;
}) {
  return (
    <UnifiedSEOManager
      title={title}
      description={description}
      type="general"
    >
      {children}
    </UnifiedSEOManager>
  );
}

/**
 * Event-specific SEO component
 */
export function EventSEO({ 
  event, 
  children 
}: { 
  event: any; 
  children?: React.ReactNode;
}) {
  return (
    <UnifiedSEOManager
      type="event"
      data={event}
      ogType="event"
      structuredData={[
        {
          "@context": "https://schema.org",
          "@type": "Event",
          "name": event?.title,
          "description": event?.description,
          "startDate": event?.date,
          "location": {
            "@type": "Place",
            "name": event?.venue,
            "address": event?.location
          }
        }
      ]}
    >
      {children}
    </UnifiedSEOManager>
  );
}

/**
 * Landing page SEO component for keyword-optimized pages
 */
export function LandingSEO({ 
  keyword, 
  title, 
  description, 
  children 
}: { 
  keyword: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <UnifiedSEOManager
      type="general"
      title={title}
      description={description}
      data={{ keyword }}
      ogType="website"
    >
      {children}
    </UnifiedSEOManager>
  );
}
