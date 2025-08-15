// TVET Platform Service Worker

const CACHE_NAME = 'tvet-platform-v1.0.0';
const STATIC_CACHE = 'tvet-static-v1.0.0';
const DYNAMIC_CACHE = 'tvet-dynamic-v1.0.0';
const API_CACHE = 'tvet-api-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    
    // CSS Files
    '/css/main.css',
    '/css/components.css',
    '/css/themes.css',
    '/css/animations.css',
    '/css/responsive.css',
    
    // JavaScript Files
    '/js/app.js',
    '/js/modules/navigation.js',
    '/js/modules/theme-switcher.js',
    '/js/modules/progress-tracker.js',
    '/js/modules/search-filter.js',
    '/js/modules/notification-system.js',
    '/js/modules/quiz-engine.js',
    '/js/data/courses-data.js',
    '/js/data/trainers-data.js',
    
    // Essential Images
    '/assets/images/logo.png',
    '/assets/images/favicon.ico',
    '/assets/images/apple-touch-icon.png',
    
    // Fonts (Google Fonts will be cached dynamically)
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/courses',
    '/api/trainers',
    '/api/progress',
    '/api/quizzes'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(request)
    );
});

async function handleFetchRequest(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First for static assets
        if (isStaticAsset(request)) {
            return await cacheFirst(request, STATIC_CACHE);
        }
        
        // Strategy 2: Stale While Revalidate for API calls
        if (isApiRequest(request)) {
            return await staleWhileRevalidate(request, API_CACHE);
        }
        
        // Strategy 3: Network First for HTML pages
        if (isHtmlRequest(request)) {
            return await networkFirst(request, DYNAMIC_CACHE);
        }
        
        // Strategy 4: Cache First for images and media
        if (isMediaRequest(request)) {
            return await cacheFirst(request, DYNAMIC_CACHE);
        }
        
        // Strategy 5: Network First for everything else
        return await networkFirst(request, DYNAMIC_CACHE);
        
    } catch (error) {
        console.error('Service Worker: Fetch failed', error);
        return await handleFetchError(request);
    }
}

// Caching Strategies

async function cacheFirst(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return await handleFetchError(request);
    }
}

async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return await handleFetchError(request);
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// Request Type Checkers

function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname.endsWith(asset)) ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.js') ||
           url.pathname.includes('/fonts/');
}

function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') ||
           API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint));
}

function isHtmlRequest(request) {
    const url = new URL(request.url);
    return request.headers.get('Accept')?.includes('text/html') ||
           url.pathname.endsWith('.html') ||
           url.pathname === '/';
}

function isMediaRequest(request) {
    const url = new URL(request.url);
    return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|mp4|webm|mp3|wav)$/i);
}

// Error Handling

async function handleFetchError(request) {
    const url = new URL(request.url);
    
    // Return offline page for HTML requests
    if (isHtmlRequest(request)) {
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Fallback offline response
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>TVET Platform - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f5f5f5; 
                    }
                    .offline-container {
                        max-width: 500px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .offline-icon { font-size: 64px; margin-bottom: 20px; }
                    h1 { color: #333; margin-bottom: 20px; }
                    p { color: #666; line-height: 1.6; }
                    .retry-btn {
                        background: #2563eb;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="offline-container">
                    <div class="offline-icon">📡</div>
                    <h1>You're Offline</h1>
                    <p>It looks like you're not connected to the internet. Some features may not be available, but you can still access cached content.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    // Return empty response for other requests
    return new Response('Network error', {
        status: 408,
        statusText: 'Request Timeout'
    });
}

// Background Sync
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'progress-sync') {
        event.waitUntil(syncProgress());
    } else if (event.tag === 'quiz-results-sync') {
        event.waitUntil(syncQuizResults());
    }
});

async function syncProgress() {
    try {
        // Get stored progress data
        const progressData = await getStoredData('tvet-progress');
        
        if (progressData) {
            // Attempt to sync with server
            const response = await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(progressData)
            });
            
            if (response.ok) {
                console.log('Service Worker: Progress synced successfully');
                // Clear local storage after successful sync
                await clearStoredData('tvet-progress-pending');
            }
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync progress', error);
    }
}

async function syncQuizResults() {
    try {
        // Get stored quiz results
        const quizResults = await getStoredData('tvet-quiz-results-pending');
        
        if (quizResults && quizResults.length > 0) {
            for (const result of quizResults) {
                try {
                    const response = await fetch('/api/quiz-results', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(result)
                    });
                    
                    if (response.ok) {
                        console.log('Service Worker: Quiz result synced', result.id);
                    }
                } catch (error) {
                    console.error('Service Worker: Failed to sync quiz result', error);
                }
            }
            
            // Clear pending results after sync attempt
            await clearStoredData('tvet-quiz-results-pending');
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync quiz results', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: 'You have new content available!',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/assets/images/icons/explore-action.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/images/icons/close-action.png'
            }
        ]
    };
    
    if (event.data) {
        const payload = event.data.json();
        options.body = payload.body || options.body;
        options.title = payload.title || 'TVET Platform';
        options.data = { ...options.data, ...payload.data };
    }
    
    event.waitUntil(
        self.registration.showNotification('TVET Platform', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        return;
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.matchAll().then((clientList) => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Utility Functions

async function getStoredData(key) {
    try {
        const data = await self.indexedDB?.open('tvet-sw-storage', 1);
        // Simplified - in real implementation, use IndexedDB properly
        return null;
    } catch (error) {
        console.error('Service Worker: Failed to get stored data', error);
        return null;
    }
}

async function clearStoredData(key) {
    try {
        // Clear data from IndexedDB
        console.log('Service Worker: Clearing stored data', key);
    } catch (error) {
        console.error('Service Worker: Failed to clear stored data', error);
    }
}

// Cache Management
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    } else if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    } else if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            })
        );
    }
});

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'content-sync') {
        event.waitUntil(syncContent());
    }
});

async function syncContent() {
    try {
        console.log('Service Worker: Syncing content in background');
        
        // Fetch latest course data
        const coursesResponse = await fetch('/api/courses');
        if (coursesResponse.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put('/api/courses', coursesResponse.clone());
        }
        
        // Fetch latest trainer data
        const trainersResponse = await fetch('/api/trainers');
        if (trainersResponse.ok) {
            const cache = await caches.open(API_CACHE);
            cache.put('/api/trainers', trainersResponse.clone());
        }
        
    } catch (error) {
        console.error('Service Worker: Failed to sync content', error);
    }
}

console.log('Service Worker: Loaded successfully');

