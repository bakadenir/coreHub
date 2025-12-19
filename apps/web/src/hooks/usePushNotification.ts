import { useState, useEffect, useCallback } from 'react';
import { pushApi } from '../lib/notifications.api';

export function usePushNotification() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const supported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const subscribe = useCallback(async () => {
        if (!isSupported) return false;

        setIsLoading(true);
        try {
            // Request permission
            const perm = await Notification.requestPermission();
            setPermission(perm);

            if (perm !== 'granted') {
                return false;
            }

            // Get VAPID public key from server
            const vapidResult = await pushApi.getVapidPublicKey();
            if (!vapidResult.success || !vapidResult.data?.publicKey) {
                console.error('Push notifications not configured on server');
                return false;
            }

            // Register service worker if not already registered
            let registration = await navigator.serviceWorker.getRegistration();
            if (!registration) {
                registration = await navigator.serviceWorker.register('/sw.js');
            }

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;

            // Convert VAPID public key to Uint8Array
            const applicationServerKey = urlBase64ToUint8Array(vapidResult.data.publicKey);

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey as BufferSource,
            });

            // Send subscription to server
            await pushApi.subscribe(subscription);
            setIsSubscribed(true);
            return true;
        } catch (error) {
            console.error('Error subscribing to push:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported]);

    const unsubscribe = useCallback(async () => {
        setIsLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await pushApi.unsubscribe(subscription.endpoint);
                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
            return true;
        } catch (error) {
            console.error('Error unsubscribing from push:', error);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isSupported,
        permission,
        isSubscribed,
        isLoading,
        subscribe,
        unsubscribe,
    };
}

// Helper to convert URL-safe base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
