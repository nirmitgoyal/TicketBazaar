/**
 * Service Worker Registration and Management
 * Optimized for SEO performance and offline functionality
 */

import React from 'react';

interface ServiceWorkerConfig {
  swUrl?: string;
  enableNotifications?: boolean;
  enableBackgroundSync?: boolean;
  updateCheckInterval?: number;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private config: ServiceWorkerConfig;
  private updateCheckTimer: number | null = null;

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = {
      swUrl: '/sw.js',
      enableNotifications: false,
      enableBackgroundSync: true,
      updateCheckInterval: 60000, // 1 minute
      ...config
    };
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      console.log('Service Worker: Registering...');
      
      this.registration = await navigator.serviceWorker.register(
        this.config.swUrl!,
        {
          scope: '/',
          updateViaCache: 'none'
        }
      );

      console.log('Service Worker: Registered successfully', this.registration);

      // Set up event listeners
      this.setupEventListeners();

      // Check for updates periodically
      if (this.config.updateCheckInterval) {
        this.startUpdateChecker();
      }

      // Handle initial state
      if (this.registration.installing) {
        this.handleInstalling(this.registration.installing);
      } else if (this.registration.waiting) {
        this.handleWaiting(this.registration.waiting);
      } else if (this.registration.active) {
        this.handleActive(this.registration.active);
      }

      // Set up message channel
      this.setupMessageChannel();

      return this.registration;
    } catch (error) {
      console.error('Service Worker: Registration failed', error);
      return null;
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.registration) return;

    // Update found
    this.registration.addEventListener('updatefound', () => {
      console.log('Service Worker: Update found');
      const newWorker = this.registration!.installing;
      if (newWorker) {
        this.handleInstalling(newWorker);
      }
    });

    // Connection status monitoring
    window.addEventListener('online', () => {
      console.log('Network: Back online');
      this.config.onOnline?.();
      this.notifyServiceWorker('NETWORK_ONLINE');
    });

    window.addEventListener('offline', () => {
      console.log('Network: Gone offline');
      this.config.onOffline?.();
      this.notifyServiceWorker('NETWORK_OFFLINE');
    });

    // Page visibility for background sync
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && navigator.onLine) {
        this.checkForUpdates();
      }
    });
  }

  /**
   * Handle installing service worker
   */
  private handleInstalling(worker: ServiceWorker): void {
    console.log('Service Worker: Installing...');
    
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          console.log('Service Worker: Update available');
          this.config.onUpdate?.(this.registration!);
        } else {
          // First time install
          console.log('Service Worker: First install complete');
        }
      }
    });
  }

  /**
   * Handle waiting service worker
   */
  private handleWaiting(worker: ServiceWorker): void {
    console.log('Service Worker: Waiting to activate');
    this.config.onUpdate?.(this.registration!);
  }

  /**
   * Handle active service worker
   */
  private handleActive(worker: ServiceWorker): void {
    console.log('Service Worker: Active and ready');
    
    // Send initial message
    this.notifyServiceWorker('CLIENT_READY');
  }

  /**
   * Set up message channel with service worker
   */
  private setupMessageChannel(): void {
    if (!navigator.serviceWorker.controller) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      switch (type) {
        case 'SW_ACTIVATED':
          console.log('Service Worker: Activated');
          break;
          
        case 'CACHE_UPDATED':
          console.log('Service Worker: Cache updated');
          break;
          
        case 'SYNC_COMPLETED':
          console.log('Service Worker: Background sync completed');
          break;
          
        case 'OFFLINE_READY':
          console.log('Service Worker: Offline functionality ready');
          break;
          
        default:
          console.log('Service Worker message:', type, data);
      }
    });
  }

  /**
   * Send message to service worker
   */
  private notifyServiceWorker(type: string, data?: any): void {
    if (!navigator.serviceWorker.controller) return;
    
    navigator.serviceWorker.controller.postMessage({ type, data });
  }

  /**
   * Start periodic update checker
   */
  private startUpdateChecker(): void {
    this.updateCheckTimer = window.setInterval(() => {
      this.checkForUpdates();
    }, this.config.updateCheckInterval!);
  }

  /**
   * Check for service worker updates
   */
  async checkForUpdates(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Service Worker: Update check failed', error);
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  skipWaiting(): void {
    if (!this.registration?.waiting) return;
    
    this.notifyServiceWorker('SKIP_WAITING');
  }

  /**
   * Get cache information
   */
  async getCacheInfo(): Promise<{ size: number; entries: number }> {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_SIZE') {
          resolve({
            size: event.data.size,
            entries: event.data.entries || 0
          });
        }
      };

      this.notifyServiceWorker('GET_CACHE_SIZE');
    });
  }

  /**
   * Clear service worker cache
   */
  async clearCache(): Promise<void> {
    this.notifyServiceWorker('CLEAR_CACHE');
  }

  /**
   * Cache specific URLs
   */
  cacheUrls(urls: string[]): void {
    this.notifyServiceWorker('CACHE_URLS', { urls });
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    return Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || !this.config.enableNotifications) {
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        return null;
      }

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VAPID_PUBLIC_KEY || ''
        )
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      // Clear update checker
      if (this.updateCheckTimer) {
        clearInterval(this.updateCheckTimer);
        this.updateCheckTimer = null;
      }

      const result = await this.registration.unregister();
      console.log('Service Worker: Unregistered', result);
      return result;
    } catch (error) {
      console.error('Service Worker: Unregistration failed', error);
      return false;
    }
  }

  /**
   * Get service worker status
   */
  getStatus(): {
    registered: boolean;
    active: boolean;
    waiting: boolean;
    installing: boolean;
  } {
    if (!this.registration) {
      return {
        registered: false,
        active: false,
        waiting: false,
        installing: false
      };
    }

    return {
      registered: true,
      active: !!this.registration.active,
      waiting: !!this.registration.waiting,
      installing: !!this.registration.installing
    };
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager({
  enableNotifications: true,
  enableBackgroundSync: true,
  updateCheckInterval: 300000, // 5 minutes
  onUpdate: (registration) => {
    // Show update notification
    console.log('App update available');
    
    // You can implement a user-friendly update notification here
    if (window.confirm('New version available! Reload to update?')) {
      serviceWorkerManager.skipWaiting();
      window.location.reload();
    }
  },
  onOffline: () => {
    // Show offline indicator
    console.log('App is offline');
  },
  onOnline: () => {
    // Hide offline indicator
    console.log('App is online');
  }
});

/**
 * Initialize service worker
 */
export function initializeServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  return serviceWorkerManager.register();
}

/**
 * React hook for service worker status
 */
export function useServiceWorker() {
  const [status, setStatus] = React.useState(serviceWorkerManager.getStatus());
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(serviceWorkerManager.getStatus());
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for service worker events
    navigator.serviceWorker?.addEventListener('controllerchange', updateStatus);
    
    // Listen for network events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial registration
    if (!status.registered) {
      serviceWorkerManager.register().then(updateStatus);
    }

    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', updateStatus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...status,
    isOnline,
    checkForUpdates: () => serviceWorkerManager.checkForUpdates(),
    skipWaiting: () => serviceWorkerManager.skipWaiting(),
    clearCache: () => serviceWorkerManager.clearCache()
  };
}

// Auto-initialize in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  initializeServiceWorker();
}