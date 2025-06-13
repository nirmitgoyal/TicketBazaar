import React from "react";
import { Helmet } from "react-helmet";
import { generateHreflangLinks } from "@/utils/global-seo-utils";

interface InternationalSEOProps {
  currentPath?: string;
  currentCountry?: string;
  supportedLanguages?: string[];
  canonicalUrl?: string;
  children?: React.ReactNode;
}

export const InternationalSEO: React.FC<InternationalSEOProps> = ({
  currentPath = "",
  currentCountry = "GLOBAL",
  supportedLanguages = ["en", "es", "fr", "de", "it", "pt", "ja"],
  canonicalUrl,
  children
}) => {
  const hreflangLinks = generateHreflangLinks(currentPath);
  
  // Generate Open Graph locales
  const ogLocales = [
    "en_US", "en_GB", "en_AU", "en_CA",
    "es_ES", "fr_FR", "de_DE", "it_IT", "pt_BR", "ja_JP"
  ];

  return (
    <Helmet>
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Hreflang links for international SEO */}
      {hreflangLinks.map((link, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={link.lang}
          href={link.url}
        />
      ))}
      
      {/* Geographic targeting */}
      <meta name="geo.region" content={currentCountry} />
      <meta name="geo.placename" content="Global" />
      <meta name="geo.position" content="global" />
      <meta name="ICBM" content="0.0,0.0" />
      
      {/* Open Graph locales */}
      <meta property="og:locale" content="en_US" />
      {ogLocales.slice(1).map((locale, index) => (
        <meta key={index} property="og:locale:alternate" content={locale} />
      ))}
      
      {/* Language and content targeting */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="English" />
      
      {/* Global content indicators */}
      <meta name="distribution" content="global" />
      <meta name="coverage" content="worldwide" />
      <meta name="target" content="all" />
      <meta name="audience" content="all" />
      
      {/* Search engine specific */}
      <meta name="robots" content="index,follow,max-snippet:160,max-image-preview:large,max-video-preview:30" />
      <meta name="googlebot" content="index,follow,max-snippet:160,max-image-preview:large,max-video-preview:30" />
      <meta name="bingbot" content="index,follow,max-snippet:160,max-image-preview:large,max-video-preview:30" />
      
      {/* International commerce indicators */}
      <meta name="currency" content="multi-currency" />
      <meta name="price-range" content="variable" />
      <meta name="payment-methods" content="varies-by-region" />
      
      {/* DNS prefetch for international domains */}
      <link rel="dns-prefetch" href="//uk.ticketbazaar.global" />
      <link rel="dns-prefetch" href="//au.ticketbazaar.global" />
      <link rel="dns-prefetch" href="//ca.ticketbazaar.global" />
      <link rel="dns-prefetch" href="//es.ticketbazaar.global" />
      <link rel="dns-prefetch" href="//fr.ticketbazaar.global" />
      <link rel="dns-prefetch" href="//de.ticketbazaar.global" />
      
      {children}
    </Helmet>
  );
};

export default InternationalSEO;