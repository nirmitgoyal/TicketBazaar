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
    "Ticket Bazaar: India's Secure Ticket Resale Platform | Buy & Sell Second Hand Event Tickets";
  const defaultDescription =
    "Buy and sell verified second hand and 2nd hand tickets for concerts, sports events, and festivals across India at fair prices. Secure transactions with escrow protection. Find events in Delhi, Mumbai, Bangalore & more.";
  const defaultKeywords =
    "ticket resale, second hand tickets, 2nd hand tickets, concert tickets, sports tickets, event tickets, ticket marketplace, secure ticket transfer, verified tickets, ticket escrow, India tickets, Delhi events, Mumbai events, Bangalore events, cheap tickets, ticket exchange, resell tickets, buy tickets, sell tickets, ticket verification, ticket QR code";

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
          href={helmetData.canonicalUrl || "https://ticketbazaar.co.in"}
        />

        <meta httpEquiv="content-language" content="en-in" />
        <meta name="geo.region" content="IN" />
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
          content={helmetData.canonicalUrl || "https://ticketbazaar.co.in"}
        />
        <meta property="og:type" content={helmetData.ogType || "website"} />
        <meta
          property="og:image"
          content={helmetData.ogImage || "/images/ticket-bazaar-social.png"}
        />
        <meta property="og:site_name" content="Ticket Bazaar" />
        <meta property="og:locale" content="en_IN" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta
          name="twitter:description"
          content={helmetData.description || defaultDescription}
        />
        <meta
          name="twitter:image"
          content={helmetData.ogImage || "/images/ticket-bazaar-social.png"}
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
