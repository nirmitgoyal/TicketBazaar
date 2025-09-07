/**
 * DOM safety utilities to prevent null reference errors
 */

/**
 * Safely query DOM element with null checks
 */
export function safeQuerySelector<T extends Element>(selector: string): T | null {
  try {
    return document.querySelector<T>(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely query multiple DOM elements with null checks
 */
export function safeQuerySelectorAll<T extends Element>(selector: string): NodeListOf<T> | null {
  try {
    return document.querySelectorAll<T>(selector);
  } catch (error) {
    console.error(`Error querying selector "${selector}":`, error);
    return null;
  }
}

/**
 * Safely get element property with null checks
 */
export function safeGetElementProperty<T>(element: Element | null, property: keyof Element): T | null {
  try {
    if (!element) return null;
    return (element as any)[property] as T;
  } catch (error) {
    console.error(`Error getting property "${String(property)}" from element:`, error);
    return null;
  }
}

/**
 * Safely check if element has children
 */
export function safeGetChildElementCount(element: Element | null): number {
  try {
    if (!element) return 0;
    return element.childElementCount || 0;
  } catch (error) {
    console.error('Error getting child element count:', error);
    return 0;
  }
}

/**
 * Safely add event listener with cleanup
 */
export function safeAddEventListener<K extends keyof HTMLElementEventMap>(
  element: Element | null,
  type: K,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): (() => void) | null {
  try {
    if (!element) return null;
    
    element.addEventListener(type, listener as any, options);
    
    // Return cleanup function
    return () => {
      try {
        element.removeEventListener(type, listener as any, options);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    };
  } catch (error) {
    console.error('Error adding event listener:', error);
    return null;
  }
}

/**
 * Safely manipulate DOM element style
 */
export function safeSetElementStyle(element: Element | null, styles: Partial<CSSStyleDeclaration>): void {
  try {
    if (!element || !('style' in element)) return;
    
    const htmlElement = element as HTMLElement;
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        (htmlElement.style as any)[property] = value;
      }
    });
  } catch (error) {
    console.error('Error setting element style:', error);
  }
}

/**
 * Safely get element dimensions
 */
export function safeGetElementDimensions(element: Element | null): { width: number; height: number } {
  try {
    if (!element) return { width: 0, height: 0 };
    
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width || 0,
      height: rect.height || 0
    };
  } catch (error) {
    console.error('Error getting element dimensions:', error);
    return { width: 0, height: 0 };
  }
}

/**
 * Safely wait for DOM to be ready
 */
export function waitForDOMReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve(), { once: true });
    } else {
      resolve();
    }
  });
}
