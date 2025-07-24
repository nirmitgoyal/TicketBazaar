import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, X } from "lucide-react";
import { useScrollNavigation } from "@/hooks/use-scroll-navigation";
import { useAdSenseLayout } from "@/hooks/use-adsense-layout";
import { CSSProperties } from "react";

interface ScrollNavigationProps {
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
   * Position of the navigation buttons
   */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /**
   * Custom className for the container
   */
  className?: string;
}

export function ScrollNavigation({
  topThreshold = 300,
  bottomThreshold = 300,
  showTooltipsByDefault = true,
  persistPreference = true,
  position = 'bottom-right',
  className = '',
}: ScrollNavigationProps) {
  const {
    showScrollToTop,
    showScrollToBottom,
    showScrollTooltips,
    scrollToTop,
    scrollToBottom,
    dismissScrollTooltips,
  } = useScrollNavigation({
    topThreshold,
    bottomThreshold,
    showTooltipsByDefault,
    persistPreference,
  });

  // Get ad-aware positioning from AdSense layout hook
  const { getNavigationOffset } = useAdSenseLayout({
    navigationOffset: 0, // No additional offset needed for scroll navigation
    basePadding: 16,
  });
  
  const adAwareOffset = getNavigationOffset();

  // Position classes mapping with dynamic bottom offset
  const positionClasses = {
    'bottom-right': `fixed right-4 z-50`,
    'bottom-left': `fixed left-4 z-50`,
    'top-right': 'fixed top-4 right-4 z-50',
    'top-left': 'fixed top-4 left-4 z-50',
  };

  // Calculate dynamic bottom positioning for bottom positions
  const getBottomStyle = (pos: string): CSSProperties => {
    if (pos.indexOf('bottom') !== -1) {
      return { bottom: `${adAwareOffset}px` };
    }
    return {};
  };

  // Tooltip position classes based on navigation position
  const tooltipPositionClasses = {
    'bottom-right': 'absolute right-full mr-2 top-1/2 transform -translate-y-1/2',
    'bottom-left': 'absolute left-full ml-2 top-1/2 transform -translate-y-1/2',
    'top-right': 'absolute right-full mr-2 top-1/2 transform -translate-y-1/2',
    'top-left': 'absolute left-full ml-2 top-1/2 transform -translate-y-1/2',
  };

  if (!showScrollTooltips) return null;

  return (
    <div 
      className={`${positionClasses[position]} flex flex-col space-y-2 scroll-navigation-adsense-aware ${className}`}
      style={getBottomStyle(position)}
    >
      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <div className="relative group">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
            onClick={scrollToTop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToTop();
              }
            }}
            aria-label="Scroll to top of page"
            tabIndex={0}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <div className={`${tooltipPositionClasses[position]} bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10`}>
            Back to Top
          </div>
        </div>
      )}

      {/* Scroll to Bottom Button */}
      {showScrollToBottom && (
        <div className="relative group">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
            onClick={scrollToBottom}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToBottom();
              }
            }}
            aria-label="Scroll to bottom of page"
            tabIndex={0}
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <div className={`${tooltipPositionClasses[position]} bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10`}>
            Go to Bottom
          </div>
        </div>
      )}

      {/* Dismiss Button */}
      {(showScrollToTop || showScrollToBottom) && (
        <div className="relative group">
          <Button
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border-gray-300 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-105"
            onClick={dismissScrollTooltips}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dismissScrollTooltips();
              }
            }}
            aria-label="Hide scroll navigation buttons"
            tabIndex={0}
          >
            <X className="h-3 w-3" />
          </Button>
          <div className={`${tooltipPositionClasses[position]} bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10`}>
            Hide
          </div>
        </div>
      )}
    </div>
  );
}

export default ScrollNavigation;