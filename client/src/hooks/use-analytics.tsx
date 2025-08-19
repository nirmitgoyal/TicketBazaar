import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import mixpanel from "mixpanel-browser";

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

// Function to initialize Mixpanel
const initializeMixpanel = () => {
  try {
    mixpanel.init("391cd655ee59e9d5d21f3811c7cc7bab", {
      debug: true,
      track_pageview: true,
      persistence: "localStorage",
    });
    console.log('Mixpanel initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Mixpanel:', error);
  }
};

// Analytics Provider component
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  // Initialize Google Analytics and Mixpanel on mount
  useEffect(() => {
    const measurementId = getMeasurementId();
    
    // Initialize Google Analytics
    if (measurementId) {
      const initGA = () => {
        // Add Google Analytics script to the head
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script1);

        // Initialize gtag
        const script2 = document.createElement('script');
        script2.text = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        `;
        document.head.appendChild(script2);

        // Safely configure gtag with the measurement ID
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag('config', measurementId);
        }
      };

      // Only initialize if not already done
      if (!window.gtag) {
        initGA();
      }
    }

    // Initialize Mixpanel
    initializeMixpanel();
  }, []);

  // Track page views when location changes
  useEffect(() => {
    const measurementId = getMeasurementId();
    
    // Track page view in Google Analytics
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("config", measurementId, {
        page_path: location,
      });
    }
    
    // Track page view in Mixpanel
    try {
      mixpanel.track_pageview({
        page: location,
        url: window.location.href,
      });
    } catch (error) {
      console.warn('Failed to track page view in Mixpanel:', error);
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
    
    // Track in Google Analytics
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    
    // Track in Mixpanel
    try {
      mixpanel.track(action, {
        category,
        label,
        value,
      });
    } catch (error) {
      console.warn('Failed to track event in Mixpanel:', error);
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
    
    // Track in Google Analytics
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
      window.gtag("event", action, params);
    }
    
    // Track in Mixpanel
    try {
      mixpanel.track(action, params);
    } catch (error) {
      console.warn('Failed to track user action in Mixpanel:', error);
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
    
    if (context === undefined) {
      // Track page view in Google Analytics
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
        window.gtag("config", measurementId, {
          page_path: location,
        });
      }
      
      // Track page view in Mixpanel
      try {
        mixpanel.track_pageview({
          page: location,
          url: window.location.href,
        });
      } catch (error) {
        console.warn('Failed to track page view in Mixpanel:', error);
      }
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
      
      // Track in Google Analytics
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
        window.gtag("event", action, {
          event_category: category,
          event_label: label,
          value: value,
        });
      }
      
      // Track in Mixpanel
      try {
        mixpanel.track(action, {
          category,
          label,
          value,
        });
      } catch (error) {
        console.warn('Failed to track event in Mixpanel:', error);
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
      
      // Track in Google Analytics
      if (typeof window !== "undefined" && typeof window.gtag !== "undefined" && measurementId) {
        window.gtag("event", action, params);
      }
      
      // Track in Mixpanel
      try {
        mixpanel.track(action, params);
      } catch (error) {
        console.warn('Failed to track user action in Mixpanel:', error);
      }
    };

    return { trackEvent, trackUserAction };
  }

  return context;
}
