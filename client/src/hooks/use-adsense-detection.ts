import { useState, useEffect, useCallback } from 'react';

/**
 * AdSense ad detection and monitoring hook
 * Scans for Google AdSense ads on the page and monitors their state
 * 
 * @author AdSense Integration Team
 * @returns Object with ad detection state and utility functions
 */
export interface AdSenseAdInfo {
  id: string;
  element: HTMLElement;
  rect: DOMRect;
  isVisible: boolean;
  isSticky: boolean;
  adType: 'anchor' | 'banner' | 'auto' | 'unknown';
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface AdSenseDetectionState {
  ads: AdSenseAdInfo[];
  anchorAds: AdSenseAdInfo[];
  isLoading: boolean;
  hasAnchorAd: boolean;
  anchorAdHeight: number;
  lastDetection: number;
}

export function useAdSenseDetection() {
  const [state, setState] = useState<AdSenseDetectionState>({
    ads: [],
    anchorAds: [],
    isLoading: true,
    hasAnchorAd: false,
    anchorAdHeight: 0,
    lastDetection: 0,
  });

  /**
   * Scan the DOM for AdSense ads using multiple selectors
   * Covers various AdSense ad formats and loading states
   */
  const detectAds = useCallback((): AdSenseAdInfo[] => {
    // Common AdSense selectors
    const adSelectors = [
      'ins.adsbygoogle',
      '[data-ad-client]',
      '[data-ad-slot]',
      '.google-auto-placed',
      'iframe[src*="googlesyndication.com"]',
      'iframe[src*="googleadservices.com"]',
      'div[id*="google_ads_iframe"]',
      // Anchor-specific selectors
      '.google-anchor-ad',
      '[data-anchor-status]',
      'ins[data-ad-format="anchor"]',
    ];

    const foundAds: AdSenseAdInfo[] = [];

    adSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const htmlElement = element as HTMLElement;
        
        // Skip if already processed
        if (foundAds.some(ad => ad.element === htmlElement)) {
          return;
        }

        const rect = htmlElement.getBoundingClientRect();
        
        // Only include visible or positioned elements
        if (rect.width === 0 && rect.height === 0 && !isFixedOrSticky(htmlElement)) {
          return;
        }

        const adInfo: AdSenseAdInfo = {
          id: `adsense-${selector.replace(/[^a-zA-Z0-9]/g, '')}-${index}`,
          element: htmlElement,
          rect,
          isVisible: isElementVisible(htmlElement),
          isSticky: isFixedOrSticky(htmlElement),
          adType: determineAdType(htmlElement),
          position: determinePosition(htmlElement, rect),
        };

        foundAds.push(adInfo);
      });
    });

    return foundAds;
  }, []);

  /**
   * Check if element is fixed or sticky positioned
   */
  const isFixedOrSticky = (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element);
    return style.position === 'fixed' || style.position === 'sticky';
  };

  /**
   * Check if element is visible in viewport
   */
  const isElementVisible = (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;

    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= windowHeight &&
      rect.left <= windowWidth &&
      rect.width > 0 &&
      rect.height > 0
    );
  };

  /**
   * Determine the type of AdSense ad
   */
  const determineAdType = (element: HTMLElement): AdSenseAdInfo['adType'] => {
    const classes = element.className.toLowerCase();
    const dataFormat = element.getAttribute('data-ad-format');
    
    // Check for anchor ad indicators
    if (
      classes.includes('anchor') ||
      dataFormat === 'anchor' ||
      element.getAttribute('data-anchor-status') ||
      isFixedOrSticky(element)
    ) {
      return 'anchor';
    }
    
    // Check for auto ads
    if (classes.includes('auto') || dataFormat === 'auto') {
      return 'auto';
    }
    
    // Check for banner ads
    if (dataFormat === 'rectangle' || dataFormat === 'banner') {
      return 'banner';
    }
    
    return 'unknown';
  };

  /**
   * Determine ad position on screen
   */
  const determinePosition = (element: HTMLElement, rect: DOMRect): AdSenseAdInfo['position'] => {
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Check if it's at the bottom (common for anchor ads)
    if (rect.bottom >= windowHeight - 10) {
      return 'bottom';
    }
    
    // Check if it's at the top
    if (rect.top <= 10) {
      return 'top';
    }
    
    // Check left/right sides
    if (rect.left <= 10) {
      return 'left';
    }
    
    if (rect.right >= windowWidth - 10) {
      return 'right';
    }
    
    return 'center';
  };

  /**
   * Update detection state
   */
  const updateDetection = useCallback(() => {
    const ads = detectAds();
    const anchorAds = ads.filter(ad => ad.adType === 'anchor');
    const hasAnchorAd = anchorAds.length > 0;
    
    // Calculate max anchor ad height for layout adjustments
    const anchorAdHeight = anchorAds.reduce((maxHeight, ad) => {
      return Math.max(maxHeight, ad.rect.height);
    }, 0);

    setState({
      ads,
      anchorAds,
      isLoading: false,
      hasAnchorAd,
      anchorAdHeight,
      lastDetection: Date.now(),
    });
  }, [detectAds]);

  /**
   * Force a manual detection scan
   */
  const refreshDetection = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    // Small delay to allow for DOM updates
    setTimeout(updateDetection, 100);
  }, [updateDetection]);

  useEffect(() => {
    // Initial detection
    updateDetection();

    // Set up periodic monitoring for dynamically loaded ads
    const detectionInterval = setInterval(updateDetection, 2000);

    // Monitor DOM changes for new ads
    const observer = new MutationObserver(() => {
      // Debounce detection calls
      clearTimeout(window.adDetectionTimeout);
      window.adDetectionTimeout = setTimeout(updateDetection, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-ad-client', 'data-ad-slot'],
    });

    // Monitor scroll and resize for position updates
    const handleScrollResize = () => {
      clearTimeout(window.adScrollTimeout);
      window.adScrollTimeout = setTimeout(updateDetection, 250);
    };

    window.addEventListener('scroll', handleScrollResize, { passive: true });
    window.addEventListener('resize', handleScrollResize);

    return () => {
      clearInterval(detectionInterval);
      observer.disconnect();
      window.removeEventListener('scroll', handleScrollResize);
      window.removeEventListener('resize', handleScrollResize);
      clearTimeout(window.adDetectionTimeout);
      clearTimeout(window.adScrollTimeout);
    };
  }, [updateDetection]);

  return {
    ...state,
    refreshDetection,
    detectAds,
  };
}

declare global {
  interface Window {
    adDetectionTimeout: NodeJS.Timeout;
    adScrollTimeout: NodeJS.Timeout;
  }
}