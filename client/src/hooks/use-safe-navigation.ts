/**
 * Safe Navigation Hook - Prevents Chrome extension errors during routing
 */
import { useLocation } from "wouter";
import { useCallback } from "react";

export function useSafeNavigation() {
  const [, setLocation] = useLocation();

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    // Suppress Chrome extension messaging before navigation
    const suppressExtensionMessaging = () => {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          // Store original sendMessage
          const originalSendMessage = chrome.runtime.sendMessage;
          
          // Replace with no-op function
          chrome.runtime.sendMessage = function() {
            return undefined;
          };
          
          // Restore after navigation completes
          setTimeout(() => {
            try {
              chrome.runtime.sendMessage = originalSendMessage;
            } catch (e) {
              // Ignore restore errors
            }
          }, 150);
        } catch (e) {
          // Ignore Chrome API access errors
        }
      }
    };

    // Apply suppression
    suppressExtensionMessaging();

    // Perform navigation
    try {
      if (options?.replace) {
        window.history.replaceState(null, "", path);
      } else {
        window.history.pushState(null, "", path);
      }
      setLocation(path);
    } catch (error) {
      // If navigation fails, still try wouter's built-in navigation
      setLocation(path);
    }
  }, [setLocation]);

  return { navigate };
}