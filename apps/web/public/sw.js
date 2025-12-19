// Service Worker for Push Notifications

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body || '',
            icon: '/icon-192.png',
            badge: '/badge-72.png',
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

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Navigate to app
    const urlToOpen = '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle service worker installation
self.addEventListener('install', function (event) {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});
