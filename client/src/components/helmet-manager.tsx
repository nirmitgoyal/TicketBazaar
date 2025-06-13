import React, { createContext, useContext, useState, useEffect } from "react";
import { Helmet } from "react-helmet";

interface HelmetData {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  children?: React.ReactNode;
}

interface HelmetContextType {
  setHelmetData: (data: HelmetData) => void;
}

const HelmetContext = createContext<HelmetContextType | null>(null);

export const HelmetProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [helmetData, setHelmetData] = useState<HelmetData>({});

  const defaultTitle =
    "Ticket Bazaar: Global Ticket Discovery & Contact Platform | Connect Buyers & Sellers Worldwide";
  const defaultDescription =
    "Discover and connect with ticket buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals. Global marketplace connecting verified users across multiple countries and currencies.";
  const defaultKeywords =
    "ticket discovery, global ticket marketplace, concert tickets, comedy show tickets, sports tickets, travel tickets, movie tickets, event tickets worldwide, ticket buyers sellers, international events, multi-currency tickets, global entertainment, worldwide events, ticket connection platform, verified ticket sellers, international marketplace, cross-border tickets, global event discovery";

  const fullTitle =
    helmetData.title && !helmetData.title.includes("Ticket Bazaar")
      ? `${helmetData.title} | Ticket Bazaar`
      : helmetData.title || defaultTitle;

  return (
    <HelmetContext.Provider value={{ setHelmetData }}>
      <Helmet>
        <title>{fullTitle}</title>
        <meta
          name="description"
          content={helmetData.description || defaultDescription}
        />
        <meta
          name="keywords"
          content={helmetData.keywords || defaultKeywords}
        />
        <link
          rel="canonical"
          href={helmetData.canonicalUrl || "https://ticketbazaar.global"}
        />

        <meta httpEquiv="content-language" content="en" />
        <meta name="geo.region" content="GLOBAL" />
        <meta name="geo.placename" content="Global" />
        <meta name="geo.position" content="global" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0"
        />
        <meta name="theme-color" content="#1976D2" />

        <meta property="og:title" content={fullTitle} />
        <meta
          property="og:description"
          content={helmetData.description || defaultDescription}
        />
        <meta
          property="og:url"
          content={helmetData.canonicalUrl || "https://ticketbazaar.global"}
        />
        <meta property="og:type" content={helmetData.ogType || "website"} />
        <meta
          property="og:image"
          content={helmetData.ogImage || "/images/ticketbazaar-global-social.png"}
        />
        <meta property="og:site_name" content="Ticket Bazaar" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="en_AU" />
        <meta property="og:locale:alternate" content="en_CA" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="fr_FR" />
        <meta property="og:locale:alternate" content="de_DE" />
        <meta property="og:locale:alternate" content="it_IT" />
        <meta property="og:locale:alternate" content="pt_BR" />
        <meta property="og:locale:alternate" content="ja_JP" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta
          name="twitter:description"
          content={helmetData.description || defaultDescription}
        />
        <meta
          name="twitter:image"
          content={helmetData.ogImage || "/images/ticketbazaar-global-social.png"}
        />

        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="author" content="Ticket Bazaar" />
        <meta name="publisher" content="Ticket Bazaar" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="1 day" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Enhanced Open Graph tags */}
        <meta property="og:rich_attachment" content="true" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Additional Twitter tags */}
        <meta name="twitter:site" content="@ticketbazaar" />
        <meta name="twitter:creator" content="@ticketbazaar" />
        
        {/* App-specific meta tags */}
        <meta name="application-name" content="Ticket Bazaar" />
        <meta name="msapplication-TileColor" content="#1976D2" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Hreflang for international SEO */}
        <link rel="alternate" hrefLang="en" href={helmetData.canonicalUrl || "https://ticketbazaar.global"} />
        <link rel="alternate" hrefLang="en-US" href={helmetData.canonicalUrl || "https://ticketbazaar.global"} />
        <link rel="alternate" hrefLang="en-GB" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'uk.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="en-AU" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'au.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="en-CA" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'ca.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="es" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'es.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="fr" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'fr.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="de" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'de.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="it" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'it.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="pt" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'pt.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="ja" href={(helmetData.canonicalUrl || "https://ticketbazaar.global").replace('ticketbazaar.global', 'ja.ticketbazaar.global')} />
        <link rel="alternate" hrefLang="x-default" href={helmetData.canonicalUrl || "https://ticketbazaar.global"} />
        
        {/* GEO-specific meta tags for discovery */}
        <meta name="geo.country" content="GLOBAL" />
        <meta name="ICBM" content="0.0,0.0" />
        <meta name="geo.placename" content="Global Event Discovery Platform" />
        <meta name="geo.region" content="GLOBAL" />
        
        {/* Enhanced discovery and AI optimization */}
        <meta name="subject" content="Global Event Ticket Discovery and Connection Platform" />
        <meta name="topic" content="Event Tickets, Concert Tickets, Sports Tickets, Comedy Shows, Travel Experiences, Movie Tickets" />
        <meta name="summary" content="Connect with verified ticket buyers and sellers worldwide for all types of events and entertainment experiences" />
        <meta name="classification" content="Marketplace, Entertainment, Events, Tickets, Discovery Platform" />
        <meta name="owner" content="Ticket Bazaar Global" />
        <meta name="url" content={helmetData.canonicalUrl || "https://ticketbazaar.global"} />
        <meta name="identifier-URL" content={helmetData.canonicalUrl || "https://ticketbazaar.global"} />
        <meta name="directory" content="submission" />
        <meta name="category" content="Entertainment, Events, Marketplace, Discovery" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="1 days" />
        <meta name="subtitle" content="Global Event Ticket Discovery Platform" />
        <meta name="abstract" content="Discover and connect with ticket buyers and sellers worldwide for concerts, comedy shows, sports events, travel experiences, movies, and festivals across multiple countries and currencies." />
      </Helmet>
      {helmetData.children}
      {children}
    </HelmetContext.Provider>
  );
};

export const useHelmet = () => {
  const context = useContext(HelmetContext);
  if (!context) {
    throw new Error("useHelmet must be used within a HelmetProvider");
  }
  return context;
};

export const SEOManager: React.FC<HelmetData> = (props) => {
  const { setHelmetData } = useHelmet();

  useEffect(() => {
    setHelmetData(props);

    // Cleanup when component unmounts
    return () => {
      setHelmetData({});
    };
  }, [setHelmetData, props]);

  return null;
};
