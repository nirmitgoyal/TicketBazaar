/**
 * Unified SEO Component
 * Consolidates all SEO functionality into a single, comprehensive component
 * Replaces: enhanced-seo.tsx, international-seo.tsx, seo-consolidated.tsx, seo.tsx
 */

import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';

export interface SEOProps {
  // Basic meta tags
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  
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
  structuredData?: any;
  
  // Internationalization
  lang?: string;
  alternateLanguages?: Array<{
    lang: string;
    href: string;
  }>;
  
  // Additional meta tags
  robots?: string;
  canonical?: string;
  viewport?: string;
  themeColor?: string;
  
  // Custom meta tags
  customMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

const DEFAULT_SEO: SEOProps = {
  title: 'TicketBazaar - India\'s Most Trusted P2P Ticket Marketplace',
  description: 'Buy and sell event tickets directly with verified users. No platform fees. Secure transactions. Find tickets for concerts, sports, theater, and more across India.',
  keywords: 'tickets, events, concerts, sports, theater, buy tickets, sell tickets, India, marketplace, P2P',
  author: 'TicketBazaar',
  ogType: 'website',
  ogSiteName: 'TicketBazaar',
  twitterCard: 'summary_large_image',
  twitterSite: '@ticketbazaar',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#4CAF50',
  lang: 'en'
};

export const UnifiedSEO: React.FC<SEOProps> = (props) => {
  const [location] = useLocation();
  const baseUrl = 'https://ticketbazaar.co.in';
  
  // Merge props with defaults
  const seo = { ...DEFAULT_SEO, ...props };
  
  // Generate full URLs
  const fullUrl = `${baseUrl}${location}`;
  const canonicalUrl = seo.canonical || fullUrl;
  const ogImageUrl = seo.ogImage ? `${baseUrl}${seo.ogImage}` : `${baseUrl}/og-image.jpg`;
  
  // Generate structured data
  const generateStructuredData = () => {
    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: seo.ogSiteName,
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      }
    };
    
    // Merge with custom structured data
    return seo.structuredData 
      ? { ...baseStructuredData, ...seo.structuredData }
      : baseStructuredData;
  };
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={seo.lang} />
      <title>{seo.title}</title>
      <meta name="title" content={seo.title} />
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      {seo.author && <meta name="author" content={seo.author} />}
      {seo.viewport && <meta name="viewport" content={seo.viewport} />}
      {seo.themeColor && <meta name="theme-color" content={seo.themeColor} />}
      {seo.robots && <meta name="robots" content={seo.robots} />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Alternate Languages */}
      {seo.alternateLanguages?.map((alt) => (
        <link 
          key={alt.lang} 
          rel="alternate" 
          hrefLang={alt.lang} 
          href={alt.href} 
        />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content={seo.ogType} />
      <meta property="og:url" content={seo.ogUrl || canonicalUrl} />
      <meta property="og:title" content={seo.ogTitle || seo.title} />
      <meta property="og:description" content={seo.ogDescription || seo.description} />
      <meta property="og:image" content={ogImageUrl} />
      {seo.ogSiteName && <meta property="og:site_name" content={seo.ogSiteName} />}
      <meta property="og:locale" content={seo.lang?.replace('-', '_') || 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitterCard} />
      <meta name="twitter:url" content={seo.ogUrl || canonicalUrl} />
      <meta name="twitter:title" content={seo.twitterTitle || seo.ogTitle || seo.title} />
      <meta name="twitter:description" content={seo.twitterDescription || seo.ogDescription || seo.description} />
      <meta name="twitter:image" content={seo.twitterImage || ogImageUrl} />
      {seo.twitterSite && <meta name="twitter:site" content={seo.twitterSite} />}
      {seo.twitterCreator && <meta name="twitter:creator" content={seo.twitterCreator} />}
      
      {/* Additional SEO Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
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
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(generateStructuredData())}
      </script>
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
  };
}> = ({ event }) => {
  const structuredData = {
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
        addressCountry: 'IN'
      }
    },
    image: event.imageUrl,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    organizer: {
      '@type': 'Organization',
      name: 'TicketBazaar',
      url: 'https://ticketbazaar.co.in'
    }
  };
  
  return (
    <UnifiedSEO
      title={`${event.title} Tickets - ${event.venue}, ${event.city} | TicketBazaar`}
      description={`Buy verified tickets for ${event.title} at ${event.venue}, ${event.city} on ${new Date(event.date).toLocaleDateString()}. Secure P2P transactions with no platform fees.`}
      ogType="event"
      ogImage={event.imageUrl}
      structuredData={structuredData}
    />
  );
};

export const TicketSEO: React.FC<{
  ticket: {
    id: number;
    title: string;
    eventTitle: string;
    eventDescription?: string;
    venue: string;
    city: string;
    eventDate: string;
    category: string;
    eventImageUrl?: string;
  };
}> = ({ ticket }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ticket.title,
    description: `${ticket.eventTitle} ticket at ${ticket.venue}`,
    category: ticket.category,
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'TicketBazaar'
      }
    }
  };
  
  return (
    <UnifiedSEO
      title={`${ticket.title} - ${ticket.eventTitle} at ${ticket.venue} | TicketBazaar`}
      description={`${ticket.eventDescription || `Get tickets for ${ticket.eventTitle}`} at ${ticket.venue}, ${ticket.city} on ${new Date(ticket.eventDate).toLocaleDateString()}.`}
      ogType="product"
      ogImage={ticket.eventImageUrl}
      structuredData={structuredData}
    />
  );
};

export const CitySEO: React.FC<{
  city: string;
  country?: string;
}> = ({ city, country = 'India' }) => {
  return (
    <UnifiedSEO
      title={`Event Tickets in ${city}, ${country} | TicketBazaar`}
      description={`Find and buy verified event tickets in ${city}. Concerts, sports, theater, and more. Direct P2P transactions with trusted sellers. No platform fees.`}
      keywords={`${city} tickets, events in ${city}, concerts ${city}, sports ${city}, theater ${city}`}
    />
  );
};

export const CategorySEO: React.FC<{
  category: string;
}> = ({ category }) => {
  return (
    <UnifiedSEO
      title={`${category} Tickets - Buy & Sell ${category} Event Tickets | TicketBazaar`}
      description={`Find verified ${category.toLowerCase()} tickets from trusted sellers. Direct P2P transactions, no platform fees. Secure and guaranteed authentic tickets.`}
      keywords={`${category} tickets, ${category} events, buy ${category} tickets, sell ${category} tickets`}
    />
  );
};

// Hook for dynamic SEO updates
export const useDynamicSEO = (props: SEOProps) => {
  React.useEffect(() => {
    // This ensures SEO updates when props change
  }, [props]);
  
  return <UnifiedSEO {...props} />;
};