import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = React.useState({
    isTouchDevice: false,
    supportsVibration: false,
    isStandalone: false,
    hasNotificationSupport: false,
  });

  React.useEffect(() => {
    const checkCapabilities = () => {
      setCapabilities({
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        supportsVibration: 'vibrate' in navigator,
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        hasNotificationSupport: 'Notification' in window,
      });
    };

    checkCapabilities();
    
    // Listen for display mode changes (PWA installation)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    standaloneQuery.addEventListener('change', checkCapabilities);
    
    return () => standaloneQuery.removeEventListener('change', checkCapabilities);
  }, []);

  return capabilities;
}

export function useHapticFeedback() {
  const { supportsVibration } = useDeviceCapabilities();

  const vibrate = React.useCallback((pattern: number | number[] = 10) => {
    if (supportsVibration && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [supportsVibration]);

  const lightImpact = React.useCallback(() => vibrate(10), [vibrate]);
  const mediumImpact = React.useCallback(() => vibrate(20), [vibrate]);
  const heavyImpact = React.useCallback(() => vibrate([30, 10, 30]), [vibrate]);

  return { vibrate, lightImpact, mediumImpact, heavyImpact };
}
