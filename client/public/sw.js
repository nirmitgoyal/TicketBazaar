/**
 * Advanced Service Worker for SEO Performance Enhancement
 * Optimizes caching, offline support, and Core Web Vitals
 */

declare const self: ServiceWorkerGlobalScope;

// Cache names
const CACHE_NAME = 'ticketbazaar-v1.2.0';
const STATIC_CACHE = 'static-assets-v1.2.0';
const DYNAMIC_CACHE = 'dynamic-content-v1.2.0';
const IMAGE_CACHE = 'images-v1.2.0';

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
} as const;

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/favicon.ico',
  '/images/placeholder.webp',
  '/offline.html'
];

// Route patterns and their caching strategies
const ROUTE_STRATEGIES = new Map([
  // Static assets - Cache first
  [/\.(js|css|woff2?|ttf|eot)$/, CACHE_STRATEGIES.CACHE_FIRST],
  
  // Images - Stale while revalidate
  [/\.(png|jpg|jpeg|webp|avif|svg|gif)$/, CACHE_STRATEGIES.STALE_WHILE_REVALIDATE],
  
  // API calls - Network first
  [/\/api\//, CACHE_STRATEGIES.NETWORK_FIRST],
  
  // HTML pages - Stale while revalidate
  [/\.html$/, CACHE_STRATEGIES.STALE_WHILE_REVALIDATE],
  
  // Root and navigation - Network first
  [/^\/(?:events|search|sell|faq|how-to-sell-tickets)?$/, CACHE_STRATEGIES.NETWORK_FIRST]
]);

/**
 * Install event - Precache essential assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    (async () => {
      try {
        // Open cache and add precache assets
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_ASSETS);
        
        console.log('Service Worker: Precache completed');
        
        // Skip waiting to activate immediately
        await self.skipWaiting();
      } catch (error) {
        console.error('Service Worker: Precache failed', error);
      }
    })()
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Get all cache names
        const cacheNames = await caches.keys();
        
        // Delete old caches
        const deletePromises = cacheNames
          .filter(name => 
            name !== CACHE_NAME && 
            name !== STATIC_CACHE && 
            name !== DYNAMIC_CACHE && 
            name !== IMAGE_CACHE
          )
          .map(name => caches.delete(name));
        
        await Promise.all(deletePromises);
        
        // Take control of all clients
        await self.clients.claim();
        
        console.log('Service Worker: Activated and ready');
        
        // Notify clients of activation
        notifyClients('SW_ACTIVATED');
      } catch (error) {
        console.error('Service Worker: Activation failed', error);
      }
    })()
  );
});

/**
 * Fetch event - Handle all network requests
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) return;
  
  // Skip requests with no-cache header
  if (request.headers.get('cache-control') === 'no-cache') return;
  
  // Determine caching strategy
  const strategy = getCachingStrategy(request);
  
  event.respondWith(handleRequest(request, strategy));
});

/**
 * Determine caching strategy for a request
 */
function getCachingStrategy(request: Request): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Check route patterns
  for (const [pattern, strategy] of ROUTE_STRATEGIES) {
    if (pattern.test(pathname)) {
      return strategy;
    }
  }
  
  // Default strategy
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request: Request, strategy: string): Promise<Response> {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request);
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return cacheOnly(request);
    
    default:
      return networkFirst(request);
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request: Request): Promise<Response> {
  try {
    const cache = await getCacheForRequest(request);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return getOfflineResponse(request);
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.status === 200) {
      const cache = await getCacheForRequest(request);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cache = await getCacheForRequest(request);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineResponse(request);
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await getCacheForRequest(request);
  const cachedResponse = await cache.match(request);
  
  // Start network request in background
  const networkResponsePromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(error => {
    console.log('Background revalidation failed:', error);
  });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network response
  try {
    return await networkResponsePromise;
  } catch (error) {
    return getOfflineResponse(request);
  }
}

/**
 * Cache Only strategy
 */
async function cacheOnly(request: Request): Promise<Response> {
  const cache = await getCacheForRequest(request);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  return getOfflineResponse(request);
}

/**
 * Get appropriate cache for request type
 */
async function getCacheForRequest(request: Request): Promise<Cache> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  if (/\.(png|jpg|jpeg|webp|avif|svg|gif)$/.test(pathname)) {
    return caches.open(IMAGE_CACHE);
  }
  
  if (/\.(js|css|woff2?|ttf|eot)$/.test(pathname)) {
    return caches.open(STATIC_CACHE);
  }
  
  return caches.open(DYNAMIC_CACHE);
}

/**
 * Get offline response for failed requests
 */
function getOfflineResponse(request: Request): Response {
  const url = new URL(request.url);
  
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    return caches.match('/offline.html').then(response => {
      return response || new Response('Offline', { status: 503 });
    });
  }
  
  // Return placeholder for images
  if (request.destination === 'image') {
    return caches.match('/images/placeholder.webp').then(response => {
      return response || new Response('', { status: 503 });
    });
  }
  
  // Return empty response for other requests
  return new Response('', { 
    status: 503,
    statusText: 'Service Unavailable' 
  });
}

/**
 * Notify all clients of service worker events
 */
async function notifyClients(message: string, data?: any): Promise<void> {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: message, data });
    });
  } catch (error) {
    console.error('Failed to notify clients:', error);
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * Handle background sync
 */
async function handleBackgroundSync(): Promise<void> {
  try {
    // Sync offline actions when back online
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    // Process pending requests
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.log('Background sync failed for:', request.url);
        }
      }
    }
    
    notifyClients('SYNC_COMPLETED');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event: any) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/logo.svg',
    badge: '/favicon.ico',
    tag: data.tag || 'notification',
    requireInteraction: false,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      // Check if app is already open
      const client = clients.find(c => c.url.includes(url));
      
      if (client) {
        return client.focus();
      } else {
        return self.clients.openWindow(url);
      }
    })
  );
});

/**
 * Message handling from main thread
 */
self.addEventListener('message', (event: any) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      cacheUrls(data.urls);
      break;
      
    case 'CLEAR_CACHE':
      clearCache(data.cacheName);
      break;
      
    case 'GET_CACHE_SIZE':
      getCacheSize().then(size => {
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size });
      });
      break;
  }
});

/**
 * Cache specific URLs
 */
async function cacheUrls(urls: string[]): Promise<void> {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    notifyClients('URLS_CACHED', { count: urls.length });
  } catch (error) {
    console.error('Failed to cache URLs:', error);
  }
}

/**
 * Clear specific cache
 */
async function clearCache(cacheName?: string): Promise<void> {
  try {
    if (cacheName) {
      await caches.delete(cacheName);
    } else {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
    notifyClients('CACHE_CLEARED');
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get total cache size
 */
async function getCacheSize(): Promise<number> {
  try {
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      for (const key of keys) {
        const response = await cache.match(key);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Failed to calculate cache size:', error);
    return 0;
  }
}

// Performance monitoring
self.addEventListener('fetch', (event: FetchEvent) => {
  // Track fetch performance for analytics
  const startTime = performance.now();
  
  event.respondWith(
    handleRequest(event.request, getCachingStrategy(event.request))
      .then(response => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Log performance metrics
        console.log(`SW: ${event.request.url} - ${duration.toFixed(2)}ms`);
        
        return response;
      })
  );
});

console.log('Service Worker: Script loaded and ready');