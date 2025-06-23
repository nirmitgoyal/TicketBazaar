import { useState, useEffect, useCallback } from 'react';

interface ScrollNavigationOptions {
  /**
   * Minimum scroll distance from top to show scroll-to-top button
   */
  topThreshold?: number;
  /**
   * Minimum scroll distance from bottom to show scroll-to-bottom button
   */
  bottomThreshold?: number;
  /**
   * Whether to show tooltips by default
   */
  showTooltipsByDefault?: boolean;
  /**
   * Whether to persist tooltip visibility preference in localStorage
   */
  persistPreference?: boolean;
  /**
   * Smooth scroll behavior
   */
  smoothScroll?: boolean;
}

export function useScrollNavigation(options: ScrollNavigationOptions = {}) {
  const {
    topThreshold = 300,
    bottomThreshold = 300,
    showTooltipsByDefault = true,
    persistPreference = true,
    smoothScroll = true,
  } = options;

  const [showScrollToTop, setShowScrollToTop] = useState<boolean>(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState<boolean>(false);
  const [showScrollTooltips, setShowScrollTooltips] = useState<boolean>(() => {
    if (!persistPreference) return showTooltipsByDefault;
    
    try {
      const saved = localStorage.getItem('scroll-tooltips-visible');
      return saved ? JSON.parse(saved) : showTooltipsByDefault;
    } catch {
      return showTooltipsByDefault;
    }
  });

  // Save tooltip preference to localStorage
  useEffect(() => {
    if (persistPreference) {
      localStorage.setItem('scroll-tooltips-visible', JSON.stringify(showScrollTooltips));
    }
  }, [showScrollTooltips, persistPreference]);

  // Scroll event handler
  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Show scroll to top if scrolled down enough
    setShowScrollToTop(scrollTop > topThreshold);
    
    // Show scroll to bottom if not near bottom and content is scrollable
    setShowScrollToBottom(
      distanceFromBottom > bottomThreshold && 
      scrollHeight > clientHeight
    );
  }, [topThreshold, bottomThreshold]);

  // Set up scroll event listener
  useEffect(() => {
    handleScroll(); // Initial check
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (smoothScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [smoothScroll]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight;
    if (smoothScroll) {
      window.scrollTo({ top: scrollHeight, behavior: 'smooth' });
    } else {
      window.scrollTo(0, scrollHeight);
    }
  }, [smoothScroll]);

  // Dismiss tooltips function
  const dismissScrollTooltips = useCallback(() => {
    setShowScrollTooltips(false);
  }, []);

  // Show tooltips function
  const enableScrollTooltips = useCallback(() => {
    setShowScrollTooltips(true);
  }, []);

  return {
    showScrollToTop,
    showScrollToBottom,
    showScrollTooltips,
    scrollToTop,
    scrollToBottom,
    dismissScrollTooltips,
    enableScrollTooltips,
  };
}