import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

// Declare the gtag function
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetOrAction: string | Date,
      fieldsObject?: Record<string, any>,
    ) => void;
    dataLayer: any[];
    GA4_MEASUREMENT_ID?: string;
  }
}

// Analytics context type
type AnalyticsContextType = {
  trackEvent: (
    action: string,
    category: string,
    label?: string,
    value?: number,
  ) => void;
  trackUserAction: (
    action:
      | "search"
      | "filter"
      | "view_item"
      | "add_to_cart"
      | "purchase"
      | "login"
      | "sign_up"
      | "share",
    params: Record<string, any>,
  ) => void;
};

// Create context
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

// Function to get the measurement ID
const getMeasurementId = () => {
  // Use the environment variable first
  const envId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (envId) {
    return envId;
  }
  
  // Fallback to window global if set
  if (typeof window !== "undefined" && window.GA4_MEASUREMENT_ID) {
    return window.GA4_MEASUREMENT_ID;
  }
  
  // No measurement ID available
  console.warn('Google Analytics measurement ID not found. Please set VITE_GA_MEASUREMENT_ID.');
  return null;
};

// Analytics Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // Initialize Google Analytics on mount
  useEffect(() => {
    const measurementId = getMeasurementId();
    if (!measurementId) return;

    // Initialize Google Analytics
    const initGA = () => {
      // Add Google Analytics script to the head
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      // Initialize gtag
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}');
      `;
      document.head.appendChild(script2);
    };

    // Only initialize if not already done
    if (!window.gtag) {
      initGA();
    }
  }, []);

  // Track page views when location changes
  useEffect(() => {
    const measurementId = getMeasurementId();
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("config", measurementId, {
        page_path: location,
      });
    }
  }, [location]);

  // Function to track custom events
  const trackEvent = (
    action: string,
    category: string,
    label?: string,
    value?: number,
  ) => {
    const measurementId = getMeasurementId();
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  };

  // Function to track user interactions
  const trackUserAction = (
    action:
      | "search"
      | "filter"
      | "view_item"
      | "add_to_cart"
      | "purchase"
      | "login"
      | "sign_up"
      | "share",
    params: Record<string, any>,
  ) => {
    const measurementId = getMeasurementId();
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("event", action, params);
    }
  };

  return (
    <AnalyticsContext.Provider value={{ trackEvent, trackUserAction }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Hook for using analytics
export function useAnalytics() {
  const [location] = useLocation();
  const context = useContext(AnalyticsContext);

  // Track page views when not in context
  useEffect(() => {
    const measurementId = getMeasurementId();
    if (
      context === undefined &&
      typeof window !== "undefined" &&
      typeof window.gtag !== "undefined" &&
      measurementId
    ) {
      window.gtag("config", measurementId, {
        page_path: location,
      });
    }
  }, [location, context]);

  // If used outside provider, return local implementation
  if (context === undefined) {
    const trackEvent = (
      action: string,
      category: string,
      label?: string,
      value?: number,
    ) => {
      const measurementId = getMeasurementId();
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
    };

    const trackUserAction = (
      action:
        | "search"
        | "filter"
        | "view_item"
        | "add_to_cart"
        | "purchase"
        | "login"
        | "sign_up"
        | "share",
      params: Record<string, any>,
    ) => {
      const measurementId = getMeasurementId();
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
        window.gtag("event", action, params);
      }
    };

    return { trackEvent, trackUserAction };
  }

  return context;
}
