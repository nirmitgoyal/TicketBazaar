/**
 * Enhanced Meta Tag Optimization for SEO
 * Dynamically generates optimized meta tags based on page content
 */

import React from 'react';

export interface MetaOptimizationConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  type?: 'website' | 'article' | 'product' | 'event';
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  aiOptimized?: boolean;
}

export interface LocalSEOConfig {
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
}

export interface StructuredDataConfig {
  organization?: boolean;
  website?: boolean;
  breadcrumbs?: Array<{name: string, url: string}>;
  faq?: Array<{question: string, answer: string}>;
  article?: boolean;
  event?: {
    name: string;
    startDate: string;
    location: string;
    description: string;
    offers?: {
      price: string;
      currency: string;
    };
  };
}

class MetaOptimizer {
  private baseUrl = 'https://ticketbazaar.co.in';
  private defaultSiteName = 'Ticket Bazaar';
  private defaultTwitterHandle = '@ticketbazaar';
  private defaultImage = 'https://ticketbazaar.co.in/images/ticket-bazaar-social.png';

  /**
   * Generate optimized meta tags HTML
   */
  generateMetaTags(config: MetaOptimizationConfig): string {
    const {
      title,
      description,
      keywords,
      canonical,
      type = 'website',
      image = this.defaultImage,
      publishedTime,
      modifiedTime,
      author,
      locale = 'en_IN',
      siteName = this.defaultSiteName,
      twitterHandle = this.defaultTwitterHandle,
      noIndex = false,
      noFollow = false,
      aiOptimized = true
    } = config;

    const robotsContent = this.generateRobotsContent(noIndex, noFollow, aiOptimized);
    
    return `
      <!-- Basic Meta Tags -->
      <title>${this.sanitizeText(title)}</title>
      <meta name="description" content="${this.sanitizeText(description)}" />
      ${keywords ? `<meta name="keywords" content="${this.sanitizeText(keywords)}" />` : ''}
      ${canonical ? `<link rel="canonical" href="${canonical}" />` : ''}
      
      <!-- Robots and AI Optimization -->
      <meta name="robots" content="${robotsContent}" />
      <meta name="googlebot" content="${robotsContent}" />
      ${aiOptimized ? '<meta name="AI-content-optimized" content="true" />' : ''}
      ${aiOptimized ? '<meta name="citation-ready" content="true" />' : ''}
      
      <!-- Open Graph Meta Tags -->
      <meta property="og:title" content="${this.sanitizeText(title)}" />
      <meta property="og:description" content="${this.sanitizeText(description)}" />
      <meta property="og:type" content="${type}" />
      <meta property="og:url" content="${canonical || this.baseUrl}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="${this.sanitizeText(title)} - ${siteName}" />
      <meta property="og:site_name" content="${siteName}" />
      <meta property="og:locale" content="${locale}" />
      ${publishedTime ? `<meta property="article:published_time" content="${publishedTime}" />` : ''}
      ${modifiedTime ? `<meta property="article:modified_time" content="${modifiedTime}" />` : ''}
      ${author ? `<meta property="article:author" content="${author}" />` : ''}
      
      <!-- Twitter Card Meta Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${this.sanitizeText(title)}" />
      <meta name="twitter:description" content="${this.sanitizeText(description)}" />
      <meta name="twitter:image" content="${image}" />
      <meta name="twitter:image:alt" content="${this.sanitizeText(title)} - ${siteName}" />
      <meta name="twitter:site" content="${twitterHandle}" />
      <meta name="twitter:creator" content="${twitterHandle}" />
      
      <!-- Additional SEO Meta Tags -->
      <meta name="author" content="${author || siteName}" />
      <meta name="publisher" content="${siteName}" />
      <meta name="copyright" content="${siteName}" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      <!-- Mobile and Performance -->
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1976D2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />
    `.trim();
  }

  /**
   * Generate local SEO meta tags
   */
  generateLocalSEO(config: LocalSEOConfig): string {
    const {
      businessName = 'Ticket Bazaar',
      address,
      city,
      state,
      country = 'India',
      postalCode,
      phone,
      geo
    } = config;

    return `
      <!-- Geographic Meta Tags -->
      <meta name="geo.region" content="${country.toUpperCase()}" />
      <meta name="geo.country" content="${country}" />
      ${city ? `<meta name="geo.placename" content="${city}" />` : ''}
      ${geo ? `<meta name="geo.position" content="${geo.latitude};${geo.longitude}" />` : ''}
      ${geo ? `<meta name="ICBM" content="${geo.latitude}, ${geo.longitude}" />` : ''}
      
      <!-- Business Information -->
      ${phone ? `<meta name="telephone" content="${phone}" />` : ''}
      ${address ? `<meta name="address" content="${address}" />` : ''}
      
      <!-- Location-based Keywords -->
      ${city ? `<meta name="DC.coverage" content="${city}, ${state || country}" />` : ''}
      ${city ? `<meta name="DC.identifier" content="${city.toLowerCase().replace(' ', '-')}-tickets" />` : ''}
    `.trim();
  }

  /**
   * Generate structured data JSON-LD
   */
  generateStructuredData(config: StructuredDataConfig): Array<object> {
    const structuredData: Array<object> = [];

    // Organization Schema
    if (config.organization) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Ticket Bazaar",
        "alternateName": ["TicketBazaar", "Ticket Bazar", "Bazaar Ticket"],
        "url": this.baseUrl,
        "logo": `${this.baseUrl}/logo.svg`,
        "description": "India's most trusted peer-to-peer ticket marketplace for concerts, sports events, and festivals",
        "sameAs": [
          `${this.baseUrl}`,
          "https://www.facebook.com/ticketbazaar",
          "https://www.twitter.com/ticketbazaar"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "areaServed": "IN",
          "availableLanguage": ["English", "Hindi"]
        },
        "areaServed": {
          "@type": "Country",
          "name": "India"
        },
        "knowsAbout": [
          "ticket reselling",
          "concert tickets",
          "sports tickets",
          "event tickets",
          "ticket verification",
          "safe ticket transactions"
        ]
      });
    }

    // Website Schema
    if (config.website) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Ticket Bazaar",
        "url": this.baseUrl,
        "description": "India's trusted ticket marketplace for buying and selling event tickets safely",
        "publisher": {
          "@type": "Organization",
          "name": "Ticket Bazaar"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${this.baseUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      });
    }

    // Breadcrumbs Schema
    if (config.breadcrumbs && config.breadcrumbs.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": config.breadcrumbs.map((breadcrumb, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": breadcrumb.name,
          "item": breadcrumb.url.startsWith('http') ? breadcrumb.url : `${this.baseUrl}${breadcrumb.url}`
        }))
      });
    }

    // FAQ Schema
    if (config.faq && config.faq.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": config.faq.map(item => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      });
    }

    // Event Schema
    if (config.event) {
      const event = config.event;
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "Event",
        "name": event.name,
        "description": event.description,
        "startDate": event.startDate,
        "location": {
          "@type": "Place",
          "name": event.location,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "IN"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": "Ticket Bazaar"
        },
        "offers": event.offers ? {
          "@type": "Offer",
          "price": event.offers.price,
          "priceCurrency": event.offers.currency,
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Ticket Bazaar"
          }
        } : undefined
      });
    }

    return structuredData;
  }

  /**
   * Generate complete SEO HTML
   */
  generateCompleteSEO(
    metaConfig: MetaOptimizationConfig,
    localConfig?: LocalSEOConfig,
    structuredConfig?: StructuredDataConfig
  ): string {
    let html = this.generateMetaTags(metaConfig);
    
    if (localConfig) {
      html += '\n\n' + this.generateLocalSEO(localConfig);
    }
    
    if (structuredConfig) {
      const structuredData = this.generateStructuredData(structuredConfig);
      structuredData.forEach(data => {
        html += `\n\n<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>`;
      });
    }
    
    return html;
  }

  /**
   * Generate robots content based on settings
   */
  private generateRobotsContent(noIndex: boolean, noFollow: boolean, aiOptimized: boolean): string {
    const directives = [];
    
    if (noIndex) directives.push('noindex');
    else directives.push('index');
    
    if (noFollow) directives.push('nofollow');
    else directives.push('follow');
    
    if (aiOptimized && !noIndex) {
      directives.push('max-snippet:-1', 'max-image-preview:large', 'max-video-preview:-1');
    }
    
    return directives.join(', ');
  }

  /**
   * Sanitize text for HTML attributes
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&/g, '&amp;');
  }

  /**
   * Generate AI-optimized keywords based on content
   */
  generateAIKeywords(pageType: string, content?: string): string {
    const baseKeywords = [
      'ticket bazaar', 'sell tickets online', 'buy tickets India', 
      'concert tickets', 'sports tickets', 'event tickets',
      'ticket resale', 'second hand tickets', 'ticket marketplace'
    ];

    const typeSpecificKeywords: Record<string, string[]> = {
      'how-to-sell': [
        'how to sell tickets', 'sell concert tickets', 'ticket selling guide',
        'resell tickets safely', 'where to sell tickets', 'ticket pricing guide'
      ],
      'faq': [
        'ticket selling FAQ', 'buy tickets safely', 'ticket verification',
        'resale tickets legal', 'concert ticket resale', 'sports ticket resale'
      ],
      'event': [
        'event tickets', 'live event tickets', 'entertainment tickets',
        'festival tickets', 'show tickets', 'performance tickets'
      ],
      'verification': [
        'ticket verification', 'authentic tickets', 'ticket fraud prevention',
        'verify ticket authenticity', 'fake ticket detection'
      ]
    };

    const keywords = [
      ...baseKeywords,
      ...(typeSpecificKeywords[pageType] || [])
    ];

    return keywords.join(', ');
  }

  /**
   * Generate performance optimization headers
   */
  generatePerformanceHeaders(): Record<string, string> {
    return {
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:;",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
    };
  }
}

// Export singleton instance
export const metaOptimizer = new MetaOptimizer();

/**
 * React hook for dynamic meta tag management
 */
export function useMetaOptimization(config: MetaOptimizationConfig) {
  React.useEffect(() => {
    // Update document title
    document.title = config.title;
    
    // Update meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', config.description);
    }
    
    // Update canonical URL
    if (config.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = config.canonical;
    }
    
    // Update Open Graph tags
    const updateMetaProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMetaProperty('og:title', config.title);
    updateMetaProperty('og:description', config.description);
    updateMetaProperty('og:url', config.canonical || window.location.href);
    
  }, [config]);
}