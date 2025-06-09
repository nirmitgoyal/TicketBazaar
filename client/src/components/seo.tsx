import React from "react";
import { Helmet } from "react-helmet";
// Simple canonical URL generation
const useCanonicalUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
};

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  children?: React.ReactNode;
}

export default function SEO({
  title = "Ticket Bazaar: India's Secure Ticket Resale Platform | Buy & Sell Second Hand Event Tickets",
  description = "Buy and sell verified second hand and 2nd hand tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection. Find events in Delhi, Mumbai, Bangalore & more.",
  canonicalUrl,
  ogImage = "/images/ticket-bazaar-social.png",
  ogType = "website",
  keywords = "ticket resale, second hand tickets, 2nd hand tickets, concert tickets, sports tickets, event tickets, ticket marketplace, secure ticket transfer, verified tickets, ticket escrow, India tickets, Delhi events, Mumbai events, Bangalore events, cheap tickets, ticket exchange, resell tickets, buy tickets, sell tickets, ticket verification, ticket QR code",
  children,
}: SEOProps) {
  // Automatically generate canonical URL if not provided
  const autoCanonicalUrl = useCanonicalUrl();
  const finalCanonicalUrl = canonicalUrl || autoCanonicalUrl;

  // Ensure the title has the site name
  const fullTitle = !title.includes("Ticket Bazaar")
    ? `${title} | Ticket Bazaar`
    : title;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en-in" />
      <meta name="geo.region" content="IN" />

      {/* Mobile Optimization */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
      />
      <meta name="theme-color" content="#1976D2" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Ticket Bazaar" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Ticket Bazaar" />
      <meta name="publisher" content="Ticket Bazaar" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Additional Schema Markup or Custom Tags */}
      {children}
    </Helmet>
  );
}
