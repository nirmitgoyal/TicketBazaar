import { useState, useEffect } from 'react';

/**
 * Interface for mobile detection results
 */
export interface MobileDetectionResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  viewportWidth: number;
  userAgent: string;
  isIOS: boolean;
  isAndroid: boolean;
  isTouchDevice: boolean;
}

/**
 * Custom hook for comprehensive mobile device detection
 * Optimized for AdSense anchor ad integration
 * 
 * @author AdSense Integration Team
 * @returns MobileDetectionResult object with device characteristics
 */
export function useMobileDetection(): MobileDetectionResult {
  const [detection, setDetection] = useState<MobileDetectionResult>(() => {
    // Initialize with server-safe defaults
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        viewportWidth: 1024,
        userAgent: '',
        isIOS: false,
        isAndroid: false,
        isTouchDevice: false,
      };
    }

    // Client-side initialization
    return detectMobileDevice();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update detection on resize for dynamic viewport changes
    const handleResize = () => {
      setDetection(detectMobileDevice());
    };

    // Initial detection
    setDetection(detectMobileDevice());
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return detection;
}

/**
 * Core mobile detection logic
 * Uses multiple detection methods for accuracy
 */
function detectMobileDevice(): MobileDetectionResult {
  const userAgent = navigator.userAgent || '';
  const viewportWidth = window.innerWidth;
  
  // Primary mobile detection: viewport width (mobile-first approach)
  const isMobileViewport = viewportWidth <= 768;
  const isTabletViewport = viewportWidth > 768 && viewportWidth <= 1024;
  
  // Secondary detection: User Agent analysis
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);
  
  // Device-specific detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  
  // Touch capability detection
  const isTouchDevice = 'ontouchstart' in window || 
                       navigator.maxTouchPoints > 0 || 
                       // @ts-expect-error - Legacy IE support
                       navigator.msMaxTouchPoints > 0;
  
  // Combined mobile detection (viewport OR user agent)
  const isMobile = isMobileViewport || isMobileUA;
  const isTablet = isTabletViewport && !isMobile;
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    viewportWidth,
    userAgent,
    isIOS,
    isAndroid,
    isTouchDevice,
  };
}

/**
 * Hook for AdSense-specific mobile optimization
 * Determines if anchor ads should be enabled
 */
export function useAdSenseMobileOptimization() {
  const detection = useMobileDetection();
  
  // AdSense anchor ads work best on mobile devices
  // Enable for mobile viewports (320-768px)
  const shouldShowAnchorAds = detection.isMobile && detection.viewportWidth >= 320;
  
  // Calculate optimal ad positioning
  const anchorAdPosition = detection.isIOS ? 'bottom-with-safe-area' : 'bottom';
  
  return {
    ...detection,
    shouldShowAnchorAds,
    anchorAdPosition,
    // Safe area consideration for iOS devices
    needsSafeAreaHandling: detection.isIOS,
  };
}