/**
 * GEO-optimized SEO Manager Component
 * Specifically designed for Generative Engine Optimization and AI search systems
 */

import React from "react";
import { Helmet } from "react-helmet";
import { 
  generateCitationSummary,
  generateQuestionBasedHeadings,
  generateGEOOptimizedFAQs,
  generateEnhancedOrganizationSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateAITrackingSchema,
  GEOOptimizedContent
} from "@/utils/geo-optimization-utils";
import { generateBreadcrumbStructuredData, generateFAQStructuredData } from "@/utils/unified-seo-utils";

export interface GEOSEOProps {
  // Core page info
  pageType: "how-to-sell" | "faq" | "ticket-verification" | "general" | "event" | "category";
  title?: string;
  description?: string;
  canonicalUrl?: string;
  
  // GEO-specific optimizations
  includeAIOptimizations?: boolean;
  citationOptimized?: boolean;
  questionBasedContent?: boolean;
  
  // Structured data options
  includeHowTo?: boolean;
  includeArticle?: boolean;
  includeFAQPage?: boolean;
  includeOrganization?: boolean;
  
  // Content data
  breadcrumbs?: Array<{name: string, url: string}>;
  faqs?: Array<{question: string, answer: string}>;
  publishDate?: string;
  modifiedDate?: string;
  
  // Performance hints
  preconnectDomains?: string[];
  dnsPrefetchDomains?: string[];
  preloadResources?: Array<{href: string, as: string, type?: string}>;
  
  children?: React.ReactNode;
}

export function GEOSEOManager({
  pageType,
  title,
  description,
  canonicalUrl,
  includeAIOptimizations = true,
  citationOptimized = true,
  questionBasedContent = true,
  includeHowTo = false,
  includeArticle = false,
  includeFAQPage = false,
  includeOrganization = true,
  breadcrumbs = [],
  faqs = [],
  publishDate,
  modifiedDate,
  preconnectDomains = [],
  dnsPrefetchDomains = [],
  preloadResources = [],
  children
}: GEOSEOProps) {
  
  // Generate citation-optimized content
  const citationSummary = citationOptimized ? generateCitationSummary(pageType) : "";
  
  // Generate AI-optimized FAQs
  const geoFAQs = faqs.length > 0 ? faqs : generateGEOOptimizedFAQs(pageType);
  
  // Build structured data array
  const structuredDataItems = [];
  
  // Always include Organization schema for brand authority
  if (includeOrganization) {
    structuredDataItems.push(generateEnhancedOrganizationSchema());
  }
  
  // Add AI tracking schema
  if (includeAIOptimizations) {
    structuredDataItems.push(generateAITrackingSchema());
  }
  
  // Add FAQ structured data
  if (includeFAQPage && geoFAQs.length > 0) {
    structuredDataItems.push(generateFAQStructuredData(geoFAQs));
  }
  
  // Add HowTo schema for instructional content
  if (includeHowTo && pageType === "how-to-sell") {
    const howToSchema = generateHowToSchema("sell-tickets");
    if (howToSchema) {
      structuredDataItems.push(howToSchema);
    }
  }
  
  // Add Article schema for content pages
  if (includeArticle && title && description && canonicalUrl) {
    structuredDataItems.push(generateArticleSchema(
      title,
      description,
      canonicalUrl,
      publishDate,
      modifiedDate
    ));
  }
  
  // Add Breadcrumb schema
  if (breadcrumbs.length > 0) {
    structuredDataItems.push(generateBreadcrumbStructuredData(breadcrumbs));
  }
  
  // Generate enhanced meta description with citation-optimized summary
  const enhancedDescription = citationOptimized && citationSummary 
    ? `${description || ""} ${citationSummary}`.trim()
    : description;
  
  // Default preconnect domains for performance
  const defaultPreconnects = [
    "https://fonts.googleapis.com",
    "https://www.google-analytics.com",
    "https://connect.facebook.net",
    "https://www.googletagmanager.com",
    ...preconnectDomains
  ];
  
  const defaultDnsPrefetch = [
    "https://fonts.gstatic.com",
    "https://www.gstatic.com",
    "https://ssl.gstatic.com",
    ...dnsPrefetchDomains
  ];

  return (
    <Helmet>
      {/* Enhanced title for AI systems */}
      <title>{title}</title>
      <meta name="title" content={title} />
      
      {/* Citation-optimized description */}
      <meta name="description" content={enhancedDescription} />
      
      {/* AI-specific meta tags */}
      {includeAIOptimizations && (
        <>
          <meta name="robots" content="index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow, max-snippet:160, max-image-preview:large, max-video-preview:-1" />
          <meta name="AI-content-optimized" content="true" />
          <meta name="citation-ready" content="true" />
        </>
      )}
      
      {/* Enhanced keywords for AI understanding */}
      <meta name="keywords" content="ticket bazaar, sell tickets online India, resell tickets, concert tickets, sports tickets, IPL tickets, second hand tickets, ticket marketplace India, buy tickets online, event tickets India" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Performance optimizations */}
      {defaultPreconnects.map(domain => (
        <link key={domain} rel="preconnect" href={domain} />
      ))}
      
      {defaultDnsPrefetch.map(domain => (
        <link key={domain} rel="dns-prefetch" href={domain} />
      ))}
      
      {preloadResources.map((resource, index) => (
        <link 
          key={index} 
          rel="preload" 
          href={resource.href} 
          as={resource.as}
          type={resource.type}
        />
      ))}
      
      {/* Enhanced Open Graph for social sharing and AI crawlers */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={enhancedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Ticket Bazaar" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content="https://ticketbazaar.co.in/images/ticket-bazaar-social.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Ticket Bazaar - India's Trusted Ticket Marketplace" />
      
      {/* Twitter Card optimizations */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={enhancedDescription} />
      <meta name="twitter:image" content="https://ticketbazaar.co.in/images/ticket-bazaar-social.png" />
      <meta name="twitter:site" content="@ticketbazaar" />
      
      {/* Additional semantic markup for AI */}
      <meta name="article:section" content="Ticket Marketplace" />
      <meta name="article:tag" content="tickets,resale,india,concerts,sports" />
      
      {/* Geographic targeting */}
      <meta name="geo.region" content="IN" />
      <meta name="geo.country" content="India" />
      <meta name="geo.placename" content="India" />
      
      {/* Mobile optimizations */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="MobileOptimized" content="320" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Theme and branding */}
      <meta name="theme-color" content="#1976D2" />
      <meta name="msapplication-TileColor" content="#1976D2" />
      
      {/* Language and content hints */}
      <meta httpEquiv="Content-Language" content="en-in" />
      <meta name="language" content="English" />
      
      {/* Structured Data */}
      {structuredDataItems.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
      
      {/* Additional performance hints */}
      <link rel="prefetch" href="/api/events" />
      <link rel="prefetch" href="/api/tickets" />
      
      {children}
    </Helmet>
  );
}

/**
 * Specialized GEO-optimized SEO components for different page types
 */

export function HowToSellSEO({ 
  canonicalUrl = "https://ticketbazaar.co.in/how-to-sell-tickets",
  ...props 
}: Partial<GEOSEOProps>) {
  return (
    <GEOSEOManager
      pageType="how-to-sell"
      title="How to Sell Tickets Online Safely in India | Complete Guide | Ticket Bazaar"
      description="Complete guide to selling concert tickets, sports tickets & event tickets online safely in India. Learn how to resell tickets, price them right & transfer securely on Ticket Bazaar."
      canonicalUrl={canonicalUrl}
      includeHowTo={true}
      includeArticle={true}
      includeFAQPage={true}
      citationOptimized={true}
      preloadResources={[
        { href: "/images/how-to-sell-hero.webp", as: "image", type: "image/webp" }
      ]}
      {...props}
    />
  );
}

export function FAQSEO({ 
  canonicalUrl = "https://ticketbazaar.co.in/faq",
  ...props 
}: Partial<GEOSEOProps>) {
  return (
    <GEOSEOManager
      pageType="faq"
      title="Frequently Asked Questions | Ticket Bazaar Help Center"
      description="Get answers about buying and selling tickets safely on Ticket Bazaar. Learn about our verification process, payment methods, and safety guidelines for ticket transactions in India."
      canonicalUrl={canonicalUrl}
      includeFAQPage={true}
      includeArticle={true}
      citationOptimized={true}
      {...props}
    />
  );
}

export function TicketVerificationSEO({ 
  canonicalUrl = "https://ticketbazaar.co.in/ticket-verification",
  ...props 
}: Partial<GEOSEOProps>) {
  return (
    <GEOSEOManager
      pageType="ticket-verification"
      title="Ticket Verification | Prevent Fraud | Ticket Bazaar"
      description="Advanced ticket verification system to prevent fraud and ensure authentic ticket transfers. QR code scanning, digital verification, and seller checks for safe ticket buying in India."
      canonicalUrl={canonicalUrl}
      includeArticle={true}
      includeFAQPage={true}
      citationOptimized={true}
      {...props}
    />
  );
}
