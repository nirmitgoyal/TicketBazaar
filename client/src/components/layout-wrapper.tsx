import { ReactNode } from 'react';
import ScrollNavigation from '@/components/scroll-navigation';

interface LayoutWrapperProps {
  children: ReactNode;
  /**
   * Whether to show scroll navigation on this page
   */
  enableScrollNavigation?: boolean;
  /**
   * Position of the scroll navigation buttons
   */
  scrollNavigationPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /**
   * Custom scroll thresholds
   */
  scrollThresholds?: {
    top?: number;
    bottom?: number;
  };
}

export function LayoutWrapper({ 
  children, 
  enableScrollNavigation = true,
  scrollNavigationPosition = 'bottom-right',
  scrollThresholds = {}
}: LayoutWrapperProps) {
  return (
    <>
      {children}
      {enableScrollNavigation && (
        <ScrollNavigation
          position={scrollNavigationPosition}
          topThreshold={scrollThresholds.top}
          bottomThreshold={scrollThresholds.bottom}
          showTooltipsByDefault={true}
          persistPreference={true}
        />
      )}
    </>
  );
}

export default LayoutWrapper;