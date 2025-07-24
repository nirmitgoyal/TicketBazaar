import { useEffect, useState } from 'react';
import { useMobileDetection } from './use-mobile-detection';
import { useAdSenseDetection } from './use-adsense-detection';

/**
 * Interface for layout adjustment calculations
 */
export interface LayoutAdjustment {
  paddingBottom: number;
  marginBottom: number;
  safeAreaBottom: number;
  totalOffset: number;
  shouldAdjust: boolean;
}

/**
 * Comprehensive hook for mobile AdSense anchor ad layout management
 * Handles dynamic padding, safe areas, and navigation conflicts
 * 
 * @author AdSense Integration Team
 * @param options Configuration options for layout adjustments
 * @returns Layout adjustment data and utility functions
 */
export interface AdSenseLayoutOptions {
  /** Base padding to maintain around ads (default: 16px) */
  basePadding?: number;
  /** Whether to handle iOS safe areas (default: true) */
  handleSafeAreas?: boolean;
  /** Additional offset for floating navigation elements (default: 0px) */
  navigationOffset?: number;
  /** Minimum viewport width to apply adjustments (default: 320px) */
  minViewportWidth?: number;
  /** Maximum anchor ad height to handle (default: 200px) */
  maxAdHeight?: number;
}

export function useAdSenseLayout(options: AdSenseLayoutOptions = {}) {
  const {
    basePadding = 16,
    handleSafeAreas = true,
    navigationOffset = 0,
    minViewportWidth = 320,
    maxAdHeight = 200,
  } = options;

  const mobile = useMobileDetection();
  const adSense = useAdSenseDetection();
  
  const [layoutAdjustment, setLayoutAdjustment] = useState<LayoutAdjustment>({
    paddingBottom: 0,
    marginBottom: 0,
    safeAreaBottom: 0,
    totalOffset: 0,
    shouldAdjust: false,
  });

  const [bodyPaddingApplied, setBodyPaddingApplied] = useState(false);

  /**
   * Calculate safe area inset for iOS devices
   */
  const calculateSafeAreaInset = (): number => {
    if (!handleSafeAreas || !mobile.isIOS) {
      return 0;
    }

    // Try to get CSS environment variable for safe area
    try {
      const testElement = document.createElement('div');
      testElement.style.paddingBottom = 'env(safe-area-inset-bottom)';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const paddingBottom = computedStyle.paddingBottom;
      
      document.body.removeChild(testElement);
      
      // Parse the pixel value
      const pixels = parseInt(paddingBottom.replace('px', ''), 10);
      return isNaN(pixels) ? 0 : pixels;
    } catch {
      // Fallback for older iOS devices
      return mobile.isIOS ? 34 : 0; // Standard iPhone home indicator height
    }
  };

  /**
   * Calculate total layout adjustment needed
   */
  const calculateLayoutAdjustment = (): LayoutAdjustment => {
    // Only adjust on mobile devices with adequate viewport width
    if (!mobile.isMobile || mobile.viewportWidth < minViewportWidth) {
      return {
        paddingBottom: 0,
        marginBottom: 0,
        safeAreaBottom: 0,
        totalOffset: 0,
        shouldAdjust: false,
      };
    }

    // Get anchor ad height (cap at maxAdHeight for safety)
    const anchorAdHeight = Math.min(adSense.anchorAdHeight, maxAdHeight);
    
    // Only adjust if there's an anchor ad
    if (!adSense.hasAnchorAd || anchorAdHeight === 0) {
      return {
        paddingBottom: 0,
        marginBottom: 0,
        safeAreaBottom: 0,
        totalOffset: 0,
        shouldAdjust: false,
      };
    }

    const safeAreaBottom = calculateSafeAreaInset();
    
    // Calculate total offset needed
    // Ad height + base padding + navigation offset + safe area
    const totalOffset = anchorAdHeight + basePadding + navigationOffset + safeAreaBottom;
    
    return {
      paddingBottom: anchorAdHeight + basePadding,
      marginBottom: navigationOffset,
      safeAreaBottom,
      totalOffset,
      shouldAdjust: true,
    };
  };

  /**
   * Apply dynamic padding to document body
   * This prevents content from being hidden behind anchor ads
   */
  const applyBodyPadding = (adjustment: LayoutAdjustment) => {
    if (!adjustment.shouldAdjust) {
      // Remove padding if no adjustment needed
      if (bodyPaddingApplied) {
        document.body.style.paddingBottom = '';
        setBodyPaddingApplied(false);
      }
      return;
    }

    // Apply dynamic padding with smooth transition
    const currentPadding = document.body.style.paddingBottom;
    const newPadding = `${adjustment.paddingBottom}px`;
    
    if (currentPadding !== newPadding) {
      // Add transition for smooth layout changes
      document.body.style.transition = 'padding-bottom 0.3s ease-in-out';
      document.body.style.paddingBottom = newPadding;
      
      setBodyPaddingApplied(true);
      
      // Remove transition after animation completes
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    }
  };

  /**
   * Get CSS variables for safe area handling
   */
  const getCSSVariables = () => {
    const adjustment = layoutAdjustment;
    
    return {
      '--adsense-anchor-height': `${adSense.anchorAdHeight}px`,
      '--adsense-safe-area-bottom': `${adjustment.safeAreaBottom}px`,
      '--adsense-total-offset': `${adjustment.totalOffset}px`,
      '--adsense-base-padding': `${basePadding}px`,
      '--adsense-navigation-offset': `${navigationOffset}px`,
    };
  };

  /**
   * Recalculate layout adjustments
   */
  useEffect(() => {
    const adjustment = calculateLayoutAdjustment();
    setLayoutAdjustment(adjustment);
    applyBodyPadding(adjustment);
  }, [
    mobile.isMobile,
    mobile.viewportWidth,
    mobile.isIOS,
    adSense.hasAnchorAd,
    adSense.anchorAdHeight,
    adSense.lastDetection,
    basePadding,
    navigationOffset,
  ]);

  /**
   * Clean up body padding on unmount
   */
  useEffect(() => {
    return () => {
      if (bodyPaddingApplied) {
        document.body.style.paddingBottom = '';
        document.body.style.transition = '';
      }
    };
  }, [bodyPaddingApplied]);

  return {
    layoutAdjustment,
    mobile,
    adSense,
    cssVariables: getCSSVariables(),
    
    // Utility functions
    applyBodyPadding: () => applyBodyPadding(layoutAdjustment),
    recalculate: () => {
      const adjustment = calculateLayoutAdjustment();
      setLayoutAdjustment(adjustment);
      applyBodyPadding(adjustment);
    },
    
    // Helper methods for components
    getNavigationOffset: () => layoutAdjustment.totalOffset,
    shouldShowAnchorAds: mobile.isMobile && mobile.viewportWidth >= minViewportWidth,
  };
}