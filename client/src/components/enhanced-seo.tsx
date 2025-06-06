import React from "react";
import { Helmet } from "react-helmet";
import { 
  generateCanonicalUrl,
  generateMetaDescription,
  generatePageTitle,
  generateKeywords,
  type BreadcrumbItem
} from "@/utils/seo-utils";

interface EnhancedSEOProps {
  type?: "event" | "search" | "category" | "general";
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  data?: any;
  structuredData?: object[];
  breadcrumbs?: BreadcrumbItem[];
  noIndex?: boolean;
  children?: React.ReactNode;
}

export default function EnhancedSEO({
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
  children,
}: EnhancedSEOProps) {
  // Generate dynamic content based on type and data
  const finalTitle = title || generatePageTitle(type, data);
  const finalDescription = description || generateMetaDescription(type, data);
  const finalKeywords = keywords || generateKeywords(type, data);
  const finalCanonicalUrl = canonicalUrl || generateCanonicalUrl(window.location.pathname);

  // Ensure the title has the site name
  const fullTitle = !finalTitle.includes("Ticket Bazaar")
    ? `${finalTitle} | Ticket Bazaar`
    : finalTitle;

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

  // Combine all structured data
  const allStructuredData = [
    ...structuredData,
    ...(breadcrumbStructuredData ? [breadcrumbStructuredData] : [])
  ];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Robots directives */}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:160, max-image-preview:large"} />
      <meta name="googlebot" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:160, max-image-preview:large"} />

      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en-in" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Mobile and Performance */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1976D2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `https://ticketbazaar.co.in${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${finalTitle} - Ticket Bazaar`} />
      <meta property="og:site_name" content="Ticket Bazaar" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `https://ticketbazaar.co.in${ogImage}`} />
      <meta name="twitter:image:alt" content={`${finalTitle} - Ticket Bazaar`} />
      <meta name="twitter:site" content="@ticketbazaar" />
      <meta name="twitter:creator" content="@ticketbazaar" />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Ticket Bazaar" />
      <meta name="publisher" content="Ticket Bazaar" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="1 day" />
      <meta name="coverage" content="Worldwide" />
      <meta name="target" content="all" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://maps.googleapis.com" />

      {/* Alternative language versions */}
      <link rel="alternate" hrefLang="en-in" href={finalCanonicalUrl} />
      <link rel="alternate" hrefLang="hi-in" href={finalCanonicalUrl.replace('ticketbazaar.co.in', 'hi.ticketbazaar.co.in')} />

      {/* Structured Data */}
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