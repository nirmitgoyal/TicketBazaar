import React, { useEffect, useRef, useState } from 'react';
import { useAdSenseLayout } from '@/hooks/use-adsense-layout';

/**
 * Props for the MobileAdSenseAnchor component
 */
export interface MobileAdSenseAnchorProps {
  /** AdSense publisher ID (default: from env or config) */
  adClient?: string;
  /** AdSense ad slot ID for anchor ads */
  adSlot?: string;
  /** Custom CSS class for styling wrapper */
  className?: string;
  /** Whether to show debug information (development only) */
  debug?: boolean;
  /** Callback when ad loads successfully */
  onAdLoad?: () => void;
  /** Callback when ad fails to load */
  onAdError?: (error: Error) => void;
  /** Custom background color for visual blending */
  backgroundColor?: string;
  /** Whether to add shadow/blur effects */
  addVisualEffects?: boolean;
}

/**
 * Mobile-optimized Google AdSense Anchor Ad Component
 * Implements anchor ads with full policy compliance and mobile optimization
 * 
 * @author AdSense Integration Team
 * @param props Component configuration props
 * @returns JSX element with anchor ad integration
 */
export const MobileAdSenseAnchor: React.FC<MobileAdSenseAnchorProps> = ({
  adClient = 'ca-pub-8712426072706283', // Default from ads.txt
  adSlot,
  className = '',
  debug = false,
  onAdLoad,
  onAdError,
  backgroundColor,
  addVisualEffects = true,
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    shouldShowAnchorAds,
    mobile,
    layoutAdjustment,
    cssVariables,
  } = useAdSenseLayout({
    basePadding: 16,
    handleSafeAreas: true,
    navigationOffset: 0,
    minViewportWidth: 320,
    maxAdHeight: 200,
  });

  /**
   * Initialize AdSense script if not already loaded
   */
  const initializeAdSense = async (): Promise<void> => {
    try {
      // Check if AdSense is already loaded
      if (window.adsbygoogle) {
        return;
      }

      // Load AdSense script dynamically if not present
      const existingScript = document.querySelector(
        `script[src*="pagead2.googlesyndication.com"]`
      );

      if (!existingScript) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        script.crossOrigin = 'anonymous';
        
        // Add error handling for script loading
        script.onerror = () => {
          const error = new Error('Failed to load AdSense script');
          setAdError(error);
          onAdError?.(error);
        };

        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          
          // Timeout after 10 seconds
          setTimeout(() => reject(new Error('AdSense script load timeout')), 10000);
        });
      }

      // Initialize adsbygoogle array if not exists
      window.adsbygoogle = window.adsbygoogle || [];
      
    } catch (error) {
      const adSenseError = error instanceof Error ? error : new Error('Unknown AdSense initialization error');
      setAdError(adSenseError);
      onAdError?.(adSenseError);
      throw adSenseError;
    }
  };

  /**
   * Push ad to AdSense queue for rendering
   */
  const pushAd = () => {
    try {
      if (!window.adsbygoogle) {
        throw new Error('AdSense not initialized');
      }

      // AdSense auto-ads will now be controlled by portal settings only
      // Removed manual enable_page_level_ads to prevent override of portal configuration

      // If specific slot provided, also push slot-based ad
      if (adSlot && adRef.current) {
        const adElement = adRef.current.querySelector('.adsbygoogle') as HTMLElement;
        if (adElement) {
          window.adsbygoogle.push({});
        }
      }

      setAdLoaded(true);
      onAdLoad?.();
      
      if (debug) {
        console.log('AdSense anchor ad pushed successfully', {
          client: adClient,
          slot: adSlot,
          mobile: mobile.isMobile,
          viewport: mobile.viewportWidth,
        });
      }
      
    } catch (error) {
      const pushError = error instanceof Error ? error : new Error('Failed to push ad');
      setAdError(pushError);
      onAdError?.(pushError);
      
      if (debug) {
        console.error('AdSense anchor ad push failed:', pushError);
      }
    }
  };

  /**
   * Initialize and load the anchor ad
   */
  useEffect(() => {
    // Only initialize on mobile devices
    if (!shouldShowAnchorAds || isInitialized) {
      return;
    }

    const loadAd = async () => {
      try {
        await initializeAdSense();
        
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          pushAd();
          setIsInitialized(true);
        }, 500);
        
      } catch (error) {
        if (debug) {
          console.error('Failed to initialize AdSense anchor ad:', error);
        }
      }
    };

    loadAd();
  }, [shouldShowAnchorAds, isInitialized, adClient, adSlot]);

  // Don't render on desktop or if ads shouldn't be shown
  if (!shouldShowAnchorAds) {
    return null;
  }

  // Generate wrapper styles for visual integration
  const wrapperStyles: React.CSSProperties = {
    ...cssVariables,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Below navigation but above content
    pointerEvents: 'none', // Allow clicks to pass through wrapper
    
    // Visual effects for blending
    ...(addVisualEffects && {
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '-20px',
        left: 0,
        right: 0,
        height: '20px',
        background: `linear-gradient(to bottom, transparent, ${backgroundColor || 'rgba(255, 255, 255, 0.95)'})`,
        pointerEvents: 'none',
      },
    }),
  };

  // AdSense element styles
  const adStyles: React.CSSProperties = {
    pointerEvents: 'auto', // Re-enable clicks for the actual ad
    width: '100%',
    display: 'block',
    
    // Safe area handling for iOS
    ...(mobile.isIOS && {
      paddingBottom: `env(safe-area-inset-bottom, ${layoutAdjustment.safeAreaBottom}px)`,
    }),
  };

  return (
    <div
      ref={adRef}
      className={`mobile-adsense-anchor-wrapper ${className}`}
      style={wrapperStyles}
      role="complementary"
      aria-label="Advertisement"
    >
      {/* Visual background for blending */}
      {addVisualEffects && (
        <div
          className="adsense-anchor-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: backgroundColor || 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* AdSense Ad Container */}
      {adSlot ? (
        // Slot-based anchor ad
        <ins
          className="adsbygoogle"
          style={adStyles}
          data-ad-client={adClient}
          data-ad-slot={adSlot}
          data-ad-format="anchor"
          data-full-width-responsive="true"
        />
      ) : (
        // Auto anchor ads (recommended for mobile)
        <div
          style={adStyles}
          data-ad-client={adClient}
          data-ad-format="anchor"
        />
      )}

      {/* Debug information (development only) */}
      {debug && process.env.NODE_ENV === 'development' && (
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '4px',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          <div><strong>AdSense Anchor Debug:</strong></div>
          <div>Client: {adClient}</div>
          <div>Slot: {adSlot || 'Auto'}</div>
          <div>Mobile: {mobile.isMobile ? 'Yes' : 'No'}</div>
          <div>Viewport: {mobile.viewportWidth}px</div>
          <div>iOS: {mobile.isIOS ? 'Yes' : 'No'}</div>
          <div>Loaded: {adLoaded ? 'Yes' : 'No'}</div>
          <div>Error: {adError?.message || 'None'}</div>
          <div>Layout Offset: {layoutAdjustment.totalOffset}px</div>
        </div>
      )}
    </div>
  );
};

// Extend Window interface for AdSense
declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export default MobileAdSenseAnchor;