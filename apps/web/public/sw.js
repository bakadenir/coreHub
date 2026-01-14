// Service Worker for PWA + Push Notifications
const CACHE_NAME = 'corehub-v1';
const STATIC_ASSETS = [
    '/',
    '/icon-192.png',
    '/icon-512.png',
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', function (event) {
    console.log('Service Worker activated');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cache) {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(function () {
            return clients.claim();
        })
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', function (event) {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // Skip API requests and external resources
    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/api') || url.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                // Clone the response
                const responseClone = response.clone();

                // Cache the fetched response
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return response;
            })
            .catch(function () {
                // Fallback to cache
                return caches.match(event.request).then(function (cachedResponse) {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return offline page for navigation requests
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});

// Push notification handling
self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body || '',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: data.tag || 'corehub-notification',
            data: data.data || {},
            vibrate: [200, 100, 200],
            actions: [
                { action: 'view', title: 'View' },
                { action: 'dismiss', title: 'Dismiss' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'coreHub', options)
        );
    } catch (e) {
        console.error('Error showing notification:', e);
    }
});

// Notification click handling
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    const urlToOpen = '/home';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
