/**
 * Instagram WebView compatibility utilities
 * Provides special handling for Instagram's built-in browser
 */

/**
 * Detect if running in Instagram's WebView
 */
export function isInstagramWebView(): boolean {
  if (typeof window === 'undefined') return false;
  return /Instagram/i.test(navigator.userAgent);
}

/**
 * Enhanced Instagram link handling with error logging
 */
export function handleInstagramLink(instagramHandle: string, options: {
  ticket?: any;
  fallbackUrl?: string;
  onError?: (error: Error) => void;
} = {}): void {
  try {
    const cleanHandle = instagramHandle.replace("@", "");
    const sanitizedUsername = encodeURIComponent(cleanHandle);
    
    // Detect device type
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
    
    const isInstagramBrowser = isInstagramWebView();
    
    console.log('Instagram link handling:', {
      handle: cleanHandle,
      isMobile,
      isInstagramBrowser,
      userAgent: navigator.userAgent
    });
    
    if (isMobile || isInstagramBrowser) {
      const instagramAppUrl = `instagram://user?username=${sanitizedUsername}`;
      const instagramWebUrl = `https://www.instagram.com/${cleanHandle}/`;
      
      if (isInstagramBrowser) {
        // Instagram's built-in browser: Use web profile directly
        console.log('Opening Instagram web profile for WebView');
        window.open(instagramWebUrl, '_blank');
      } else {
        // Mobile browsers: Use improved app detection with window blur
        let appOpened = false;
        
        const handleBlur = () => {
          appOpened = true;
          console.log('Window blur detected - Instagram app likely opened');
          window.removeEventListener('blur', handleBlur);
        };
        
        window.addEventListener('blur', handleBlur);
        
        console.log('Attempting to open Instagram app');
        // Try to open the Instagram app
        window.location.href = instagramAppUrl;
        
        // Check if app opened after a short delay
        setTimeout(() => {
          window.removeEventListener('blur', handleBlur);
          if (!appOpened) {
            console.log('App did not open, falling back to web');
            // App didn't open, fallback to web version
            window.open(instagramWebUrl, '_blank');
          }
        }, 600);
      }
    } else {
      // Desktop: Create pre-filled DM message if ticket info available
      const fallback = options.fallbackUrl || `https://www.instagram.com/${cleanHandle}/`;
      
      if (options.ticket) {
        const ticketUrl = `${window.location.origin}/tickets/${options.ticket.id}`;
        const message = encodeURIComponent(
          `Hi! I'm interested in your ticket for "${options.ticket.eventTitle}" on ${new Date(options.ticket.eventDate).toLocaleDateString()}. Could you please share more details? ${ticketUrl}`
        );
        window.open(`https://ig.me/m/${cleanHandle}?text=${message}`, '_blank');
      } else {
        window.open(fallback, '_blank', 'noopener');
      }
    }
    
  } catch (error) {
    console.error('Error handling Instagram link:', error);
    if (options.onError) {
      options.onError(error instanceof Error ? error : new Error(String(error)));
    }
    
    // Fallback to basic web link
    const basicUrl = `https://www.instagram.com/${instagramHandle.replace("@", "")}/`;
    window.open(basicUrl, '_blank');
  }
}

/**
 * Log Instagram WebView specific information for debugging
 */
export function logInstagramWebViewInfo(): void {
  if (typeof window === 'undefined') return;
  
  const info = {
    isInstagramWebView: isInstagramWebView(),
    userAgent: navigator.userAgent,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    hasWindowOpen: typeof window.open !== 'undefined',
    hasLocationHref: typeof window.location?.href !== 'undefined',
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  };
  
  console.log('Instagram WebView Debug Info:', info);
  
  // Also send to server for debugging if in development
  if (process.env.NODE_ENV === 'development') {
    fetch('/api/debug/instagram-webview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(info),
    }).catch(err => console.warn('Failed to log debug info:', err));
  }
}