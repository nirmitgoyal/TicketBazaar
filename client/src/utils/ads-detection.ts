import { useState, useEffect } from 'react';

/**
 * Utility functions to detect Google AdSense ads and calculate positioning adjustments
 */

export interface AdInfo {
  height: number;
  width: number;
  isVisible: boolean;
  isSticky: boolean;
  bottom: number;
  right: number;
}

/**
 * Detects Google AdSense ads in the DOM
 * @returns Array of detected ad information
 */
export function detectAdSenseAds(): AdInfo[] {
  const ads: AdInfo[] = [];
  
  // Common AdSense selectors
  const adSelectors = [
    'ins[class*="adsbygoogle"]',
    '[data-ad-client]',
    '[data-ad-slot]',
    '.adsbygoogle',
    'ins.adsbygoogle',
    '[id*="google_ads"]',
    '[class*="google-ads"]',
    '[class*="google_ad"]'
  ];
  
  adSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element instanceof HTMLElement) {
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        // Only consider ads that are actually visible and have dimensions
        if (rect.width > 0 && rect.height > 0 && computedStyle.display !== 'none') {
          ads.push({
            height: rect.height,
            width: rect.width,
            isVisible: rect.top < window.innerHeight && rect.bottom > 0,
            isSticky: computedStyle.position === 'fixed' || computedStyle.position === 'sticky',
            bottom: window.innerHeight - rect.bottom,
            right: window.innerWidth - rect.right
          });
        }
      }
    });
  });
  
  return ads;
}

/**
 * Calculates the bottom offset needed to position navigation arrows above ads
 * @param position - The position of the navigation arrows ('bottom-right', 'bottom-left', etc.)
 * @returns The bottom offset in pixels
 */
export function calculateNavigationOffset(position: string): number {
  const ads = detectAdSenseAds();
  
  // Filter ads that are at the bottom of the screen and sticky/fixed
  const bottomAds = ads.filter(ad => {
    const isAtBottom = ad.bottom < 100; // Within 100px of bottom
    const isRelevantPosition = position.indexOf('bottom') !== -1;
    
    return isAtBottom && ad.isSticky && isRelevantPosition;
  });
  
  if (bottomAds.length === 0) {
    return 16; // Default 1rem (16px) offset
  }
  
  // Find the highest ad (furthest from bottom)
  const highestAd = bottomAds.reduce((highest, current) => {
    return current.bottom > highest.bottom ? current : highest;
  });
  
  // Add padding above the ad
  return highestAd.bottom + highestAd.height + 16; // ad height + bottom position + padding
}

/**
 * Monitors for dynamically added AdSense ads and calls a callback when detected
 * @param callback - Function to call when ads are detected or change
 * @returns Function to stop monitoring
 */
export function monitorAdSenseChanges(callback: (offset: number) => void): () => void {
  let timeoutId: number;
  
  const checkAds = () => {
    const offset = calculateNavigationOffset('bottom-right');
    callback(offset);
    
    // Check again after a delay to catch dynamically loaded ads
    timeoutId = window.setTimeout(checkAds, 1000);
  };
  
  // Initial check
  checkAds();
  
  // Also listen for DOM changes that might indicate new ads
  const observer = new MutationObserver(() => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(checkAds, 500);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style']
  });
  
  // Cleanup function
  return () => {
    window.clearTimeout(timeoutId);
    observer.disconnect();
  };
}

/**
 * Hook to get real-time ad-aware positioning
 * @param position - Navigation position
 * @returns Current bottom offset
 */
export function useAdAwarePositioning(position: string): number {
  const [offset, setOffset] = useState(16);
  
  useEffect(() => {
    const stopMonitoring = monitorAdSenseChanges((newOffset) => {
      setOffset(newOffset);
    });
    
    return stopMonitoring;
  }, [position]);
  
  return offset;
}