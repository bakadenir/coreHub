import webpush from 'web-push';
import { getPushSubscriptions, createNotification, getNotificationSettings } from './notifications.service';

// Initialize VAPID keys - these should be in environment variables
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@corehub.app';

// Set up VAPID keys if available
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: Record<string, unknown>;
}

// Send push notification to a user
export async function sendPushNotification(
    userId: string,
    payload: PushPayload,
    createInAppNotification = true,
    type: 'habit_reminder' | 'schedule_reminder' | 'system' = 'system',
    referenceId?: string,
    referenceType?: 'habit' | 'schedule'
) {
    // Check if user has push enabled
    const settings = await getNotificationSettings(userId);

    // Create in-app notification first
    if (createInAppNotification) {
        await createNotification(
            userId,
            type,
            payload.title,
            payload.body,
            referenceId,
            referenceType
        );
    }

    // If push not enabled, just return
    if (!settings.pushEnabled) {
        return { sent: 0, failed: 0 };
    }

    // Get all push subscriptions for user
    const subscriptions = await getPushSubscriptions(userId);

    if (subscriptions.length === 0) {
        return { sent: 0, failed: 0 };
    }

    const results = await Promise.allSettled(
        subscriptions.map((sub: { endpoint: string; p256dh: string; auth: string }) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                },
                JSON.stringify(payload)
            )
        )
    );

    const sent = results.filter((r: PromiseSettledResult<unknown>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<unknown>) => r.status === 'rejected').length;

    return { sent, failed };
}

// Get VAPID public key for client
export function getVapidPublicKey() {
    return VAPID_PUBLIC_KEY;
}

// Check if push notifications are configured
export function isPushConfigured() {
    return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}
