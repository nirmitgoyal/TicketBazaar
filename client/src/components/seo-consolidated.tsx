import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useMemo } from "react";

interface SEOConsolidatedProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "event" | "marketplace";
  structuredData?: object[];
  canonicalUrl?: string;
  hreflang?: { [lang: string]: string };
}

/**
 * Consolidated SEO component that replaces multiple scattered SEO components
 * Handles meta tags, structured data, canonical URLs, and internationalization
 */
export function SEOConsolidated({
  title = "Ticket Bazaar - Global Second-Hand Ticket Marketplace",
  description = "Buy and sell authentic second-hand tickets worldwide. Concert, sports, theatre, comedy and festival tickets with verified sellers.",
  keywords = ["tickets", "resale", "concerts", "sports", "events", "marketplace"],
  image = "/logo.svg",
  url,
  type = "website",
  structuredData = [],
  canonicalUrl,
  hreflang = {}
}: SEOConsolidatedProps) {
  const [location] = useLocation();
  
  const fullUrl = useMemo(() => {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : "https://ticketbazaar.global";
    return url || `${baseUrl}${location}`;
  }, [url, location]);
  
  const fullImage = useMemo(() => {
    if (image.startsWith("http")) return image;
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : "https://ticketbazaar.global";
    return `${baseUrl}${image}`;
  }, [image]);
  
  const defaultStructuredData = useMemo(() => [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Ticket Bazaar",
      "url": fullUrl,
      "description": description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${fullUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ticket Bazaar",
      "url": fullUrl,
      "logo": fullImage,
      "description": "Global second-hand ticket marketplace for authentic resale tickets",
      "sameAs": [
        "https://twitter.com/ticketbazaar",
        "https://facebook.com/ticketbazaar",
        "https://instagram.com/ticketbazaar"
      ]
    }
  ], [fullUrl, description, fullImage]);
  
  const allStructuredData = useMemo(() => [
    ...defaultStructuredData,
    ...structuredData
  ], [defaultStructuredData, structuredData]);
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Ticket Bazaar" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:site" content="@ticketbazaar" />
      
      {/* Robots and Indexing */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      
      {/* Mobile and Accessibility */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      
      {/* Internationalization */}
      {Object.entries(hreflang).map(([lang, href]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={href} />
      ))}
      
      {/* Structured Data */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data, null, 0)}
        </script>
      ))}
      
      {/* Preconnect for Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/logo.svg" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      
      {/* Apple Touch Icon */}
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Manifest */}
      <link rel="manifest" href="/manifest.json" />
    </Helmet>
  );
}