/**
 * Unified SEO Component
 * Consolidates all SEO functionality into a single, comprehensive component
 * Replaces: enhanced-seo.tsx, seo-consolidated.tsx, seo.tsx, helmet-manager.tsx
 */

import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import {
  generateCanonicalUrl,
  generateMetaDescription,
  generatePageTitle,
  generateKeywords,
  generateOrganizationStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateHreflangLinks,
  type BreadcrumbItem,
  type SEOPageData
} from '@/utils/unified-seo-utils';

export interface UnifiedSEOProps {
  // Basic meta tags
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  
  // Content type for auto-generation
  type?: "event" | "search" | "category" | "general" | "selling" | "how-to" | "global-homepage" | "global-category" | "global-city";
  data?: any; // Data for dynamic content generation
  
  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product' | 'event';
  ogSiteName?: string;
  
  // Twitter Card
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterSite?: string;
  twitterCreator?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // Structured Data
  structuredData?: any[];
  breadcrumbs?: BreadcrumbItem[];
  faqs?: Array<{ question: string; answer: string }>;
  
  // Internationalization
  lang?: string;
  isGlobal?: boolean;
  alternateLanguages?: Array<{
    lang: string;
    href: string;
  }>;
  
  // Additional meta tags
  robots?: string;
  canonical?: string;
  viewport?: string;
  themeColor?: string;
  noIndex?: boolean;
  
  // Custom meta tags
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  
  children?: React.ReactNode;
}

const DEFAULT_SEO: Partial<UnifiedSEOProps> = {
  author: 'TicketBazaar',
  ogType: 'website',
  ogSiteName: 'Ticket Bazaar',
  twitterCard: 'summary_large_image',
  twitterSite: '@ticketbazaar',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  themeColor: '#1976D2',
  lang: 'en'
};

export const UnifiedSEO: React.FC<UnifiedSEOProps> = (props) => {
  const [location] = useLocation();
  
  // Merge props with defaults
  const seo = { ...DEFAULT_SEO, ...props };
  
  // Determine if this is global or India-specific
  const isGlobal = seo.isGlobal || false;
  const baseUrl = isGlobal ? 'https://ticketbazaar.global' : 'https://ticketbazaar.co.in';
  
  // Generate dynamic content based on type and data
  const finalTitle = useMemo(() => {
    if (seo.title) return seo.title;
    if (seo.type) return generatePageTitle(seo.type, seo.data, isGlobal);
    return isGlobal 
      ? "TicketBazaar - Global Event Ticket Discovery Platform"
      : "TicketBazaar - India's Secure Ticket Resale Platform | Buy & Sell Second Hand Event Tickets";
  }, [seo.title, seo.type, seo.data, isGlobal]);

  const finalDescription = useMemo(() => {
    if (seo.description) return seo.description;
    if (seo.type) return generateMetaDescription(seo.type, seo.data, isGlobal);
    return isGlobal
      ? "Discover and connect with ticket buyers and sellers worldwide for concerts, sports, and entertainment. Global marketplace with verified sellers across 50+ countries."
      : "Buy and sell verified second hand and 2nd hand tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection.";
  }, [seo.description, seo.type, seo.data, isGlobal]);

  const finalKeywords = useMemo(() => {
    if (seo.keywords) return seo.keywords;
    if (seo.type) return generateKeywords(seo.type, seo.data, isGlobal);
    return isGlobal
      ? "global tickets, worldwide events, international marketplace, verified sellers, secure transactions"
      : "ticket resale, second hand tickets, concert tickets, sports tickets, event tickets, ticket marketplace, secure ticket transfer, verified tickets";
  }, [seo.keywords, seo.type, seo.data, isGlobal]);

  // Generate URLs
  const fullUrl = `${baseUrl}${location}`;
  const canonicalUrl = seo.canonical || generateCanonicalUrl(location, isGlobal);
  const ogImageUrl = useMemo(() => {
    const image = seo.ogImage || (isGlobal ? "/images/ticketbazaar-global-social.png" : "/images/ticket-bazaar-social.png");
    return image.startsWith('http') ? image : `${baseUrl}${image}`;
  }, [seo.ogImage, baseUrl, isGlobal]);
  
  // Ensure the title has the site name if not already included
  const fullTitle = useMemo(() => {
    return finalTitle.includes("Ticket Bazaar") || finalTitle.includes("TicketBazaar")
      ? finalTitle
      : `${finalTitle} | Ticket Bazaar`;
  }, [finalTitle]);

  // Generate structured data
  const allStructuredData = useMemo(() => {
    const data: any[] = [];
    
    // Add organization data
    data.push(generateOrganizationStructuredData(isGlobal));
    
    // Add website data
    data.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Ticket Bazaar",
      "url": baseUrl,
      "description": finalDescription,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    });
    
    // Add breadcrumb data if provided
    if (seo.breadcrumbs && seo.breadcrumbs.length > 0) {
      data.push(generateBreadcrumbStructuredData(seo.breadcrumbs, baseUrl));
    }
    
    // Add FAQ data if provided
    if (seo.faqs && seo.faqs.length > 0) {
      data.push(generateFAQStructuredData(seo.faqs));
    }
    
    // Add custom structured data
    if (seo.structuredData) {
      data.push(...seo.structuredData);
    }
    
    return data;
  }, [seo.breadcrumbs, seo.faqs, seo.structuredData, isGlobal, baseUrl, finalDescription]);

  // Generate hreflang links
  const hreflangLinks = useMemo(() => {
    if (isGlobal) {
      return generateHreflangLinks(location);
    }
    return {};
  }, [isGlobal, location]);

  return (
    <Helmet>
      {/* HTML lang attribute */}
      <html lang={seo.lang} />
      
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      {seo.author && <meta name="author" content={seo.author} />}
      {seo.viewport && <meta name="viewport" content={seo.viewport} />}
      {seo.themeColor && <meta name="theme-color" content={seo.themeColor} />}
      
      {/* Robots */}
      <meta name="robots" content={seo.noIndex ? "noindex, nofollow" : (seo.robots || "index, follow")} />
      <meta name="googlebot" content={seo.noIndex ? "noindex, nofollow" : "index, follow, max-snippet:160, max-image-preview:large"} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:url" content={seo.ogUrl || canonicalUrl} />
      <meta property="og:title" content={seo.ogTitle || fullTitle} />
      <meta property="og:description" content={seo.ogDescription || finalDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} - Ticket Bazaar`} />
      <meta property="og:site_name" content={seo.ogSiteName} />
      <meta property="og:locale" content={isGlobal ? "en_US" : "en_IN"} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={seo.twitterCard} />
      <meta name="twitter:url" content={seo.ogUrl || canonicalUrl} />
      <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || fullTitle} />
      <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || finalDescription} />
      <meta name="twitter:image" content={seo.twitterImage || ogImageUrl} />
      {seo.twitterSite && <meta name="twitter:site" content={seo.twitterSite} />}
      {seo.twitterCreator && <meta name="twitter:creator" content={seo.twitterCreator} />}
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content={isGlobal ? "en" : "en-in"} />
      <meta name="geo.region" content={isGlobal ? "GLOBAL" : "IN"} />
      <meta name="geo.placename" content={isGlobal ? "Global" : "India"} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="publisher" content="Ticket Bazaar" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="1 day" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      
      {/* Mobile App Meta Tags */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Hreflang Links (for global) */}
      {Object.entries(hreflangLinks).map(([lang, href]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
      
      {/* Alternative language versions for custom setup */}
      {seo.alternateLanguages?.map((alt, index) => (
        <link key={index} rel="alternate" hrefLang={alt.lang} href={alt.href} />
      ))}
      
      {/* Custom Meta Tags */}
      {seo.customMeta?.map((meta, index) => {
        if (meta.name) {
          return <meta key={index} name={meta.name} content={meta.content} />;
        }
        if (meta.property) {
          return <meta key={index} property={meta.property} content={meta.content} />;
        }
        return null;
      })}
      
      {/* Performance Optimization */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      <link rel="icon" type="image/png" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data, null, 0)}
        </script>
      ))}
      
      {/* Additional custom content */}
      {seo.children}
    </Helmet>
  );
};

// Specialized SEO components for common use cases
export const EventSEO: React.FC<{
  event: {
    title: string;
    description: string;
    date: string;
    venue: string;
    city: string;
    imageUrl?: string;
    price?: number;
    category?: string;
    country?: string;
  };
  ticketCount?: number;
  isGlobal?: boolean;
}> = ({ event, ticketCount = 0, isGlobal = false }) => {
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: event.title,
      description: event.description,
      startDate: event.date,
      location: {
        '@type': 'Place',
        name: event.venue,
        address: {
          '@type': 'PostalAddress',
          addressLocality: event.city,
          addressCountry: event.country || (isGlobal ? 'Global' : 'IN')
        }
      },
      offers: ticketCount > 0 ? {
        '@type': 'AggregateOffer',
        priceCurrency: event.country === 'IN' ? 'INR' : 'USD',
        availability: 'https://schema.org/InStock',
        offerCount: ticketCount.toString()
      } : {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock'
      },
      image: event.imageUrl,
      eventStatus: 'https://schema.org/EventScheduled'
    }
  ];

  return (
    <UnifiedSEO
      type="event"
      data={event}
      structuredData={structuredData}
      isGlobal={isGlobal}
      ogImage={event.imageUrl}
      ogType="event"
    />
  );
};

export const SearchSEO: React.FC<{
  query: string;
  resultCount: number;
  isGlobal?: boolean;
}> = ({ query, resultCount, isGlobal = false }) => {
  return (
    <UnifiedSEO
      type="search"
      data={{ query, resultCount }}
      isGlobal={isGlobal}
    />
  );
};

export const CategorySEO: React.FC<{
  category: string;
  isGlobal?: boolean;
}> = ({ category, isGlobal = false }) => {
  return (
    <UnifiedSEO
      type="category"
      data={{ category }}
      isGlobal={isGlobal}
    />
  );
};

export const LandingPageSEO: React.FC<{
  keyword: string;
  isGlobal?: boolean;
  customData?: any;
}> = ({ keyword, isGlobal = false, customData }) => {
  return (
    <UnifiedSEO
      type="general"
      data={{ keyword, ...customData }}
      isGlobal={isGlobal}
    />
  );
};

export default UnifiedSEO;
