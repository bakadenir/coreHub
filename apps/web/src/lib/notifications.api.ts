import { api } from './api';

export interface Notification {
    id: string;
    userId: string;
    type: 'habit_reminder' | 'schedule_reminder' | 'system';
    title: string;
    message?: string;
    referenceId?: string;
    referenceType?: 'habit' | 'schedule';
    isRead: boolean;
    createdAt: string;
}

export interface NotificationSettings {
    id: string;
    userId: string;
    habitReminders: boolean;
    scheduleReminders: boolean;
    scheduleReminderMinutes: number;
    pushEnabled: boolean;
    updatedAt: string;
}

export const notificationsApi = {
    // Get notifications
    getAll: (limit = 20, unreadOnly = false) =>
        api.get<Notification[]>(`/notifications?limit=${limit}&unreadOnly=${unreadOnly}`),

    // Get unread count
    getUnreadCount: () =>
        api.get<{ count: number }>('/notifications/unread-count'),

    // Mark as read
    markAsRead: (id: string) =>
        api.patch<Notification>(`/notifications/${id}/read`, {}),

    // Mark all as read
    markAllAsRead: () =>
        api.post<void>('/notifications/mark-all-read', {}),

    // Delete notification
    delete: (id: string) =>
        api.delete<void>(`/notifications/${id}`),

    // Get settings
    getSettings: () =>
        api.get<NotificationSettings>('/notification-settings'),

    // Update settings
    updateSettings: (updates: Partial<Pick<NotificationSettings, 'habitReminders' | 'scheduleReminders' | 'scheduleReminderMinutes' | 'pushEnabled'>>) =>
        api.patch<NotificationSettings>('/notification-settings', updates),
};

export const pushApi = {
    // Get VAPID public key
    getVapidPublicKey: async () => {
        const result = await api.get<{ publicKey: string }>('/push/vapid-public-key');
        return result;
    },

    // Subscribe to push notifications
    subscribe: (subscription: PushSubscription) =>
        api.post('/push/subscribe', {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth')),
            },
            userAgent: navigator.userAgent,
        }),

    // Unsubscribe - using POST since endpoint in body
    unsubscribe: (endpoint: string) =>
        api.post('/push/unsubscribe', { endpoint }),
};

// Helper to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
