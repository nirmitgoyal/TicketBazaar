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
  if (typeof window !== "undefined" && window.GA4_MEASUREMENT_ID) {
    return window.GA4_MEASUREMENT_ID;
  }
  // Fallback to hardcoded ID
  return "G-EJP09PV05W";
};

// Analytics Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // Track page views when location changes
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
      const measurementId = getMeasurementId();
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
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
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
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
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
    if (
      context === undefined &&
      typeof window !== "undefined" &&
      typeof window.gtag !== "undefined"
    ) {
      const measurementId = getMeasurementId();
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
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
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
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
        window.gtag("event", action, params);
      }
    };

    return { trackEvent, trackUserAction };
  }

  return context;
}
