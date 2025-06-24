/**
 * Safe Link Component - Wraps wouter Link to prevent Chrome extension errors
 */
import { Link as WouterLink, LinkProps } from "wouter";
import { useCallback, MouseEvent } from "react";

interface SafeLinkProps extends LinkProps {
  children: React.ReactNode;
}

export function SafeLink({ href, onClick, children, ...props }: SafeLinkProps) {
  const handleClick = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    // Suppress Chrome extension messaging during navigation
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        const originalSendMessage = chrome.runtime.sendMessage;
        chrome.runtime.sendMessage = () => undefined;
        
        // Restore after navigation
        setTimeout(() => {
          try {
            chrome.runtime.sendMessage = originalSendMessage;
          } catch (e) {
            // Ignore restore errors
          }
        }, 200);
      } catch (e) {
        // Ignore Chrome API errors
      }
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(event);
    }
  }, [onClick]);

  return (
    <WouterLink href={href} onClick={handleClick} {...props}>
      {children}
    </WouterLink>
  );
}

// Also export as Link for easy replacement
export { SafeLink as Link };