import { db } from '../config/database';
import { notifications, notificationSettings, pushSubscriptions } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Create a new notification
export async function createNotification(
    userId: string,
    type: 'habit_reminder' | 'schedule_reminder' | 'system',
    title: string,
    message?: string,
    referenceId?: string,
    referenceType?: 'habit' | 'schedule'
) {
    const [notification] = await db.insert(notifications).values({
        userId,
        type,
        title,
        message,
        referenceId,
        referenceType,
    }).returning();
    return notification;
}

// Get notifications for a user
export async function getNotifications(userId: string, limit = 20, unreadOnly = false) {
    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
    }

    return db.select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
    const result = await db.select()
        .from(notifications)
        .where(and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false)
        ));
    return result.length;
}

// Mark a notification as read
export async function markAsRead(notificationId: string, userId: string) {
    const [updated] = await db.update(notifications)
        .set({ isRead: true })
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
        ))
        .returning();
    return updated;
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
    await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));
}

// Delete a notification
export async function deleteNotification(notificationId: string, userId: string) {
    const [deleted] = await db.delete(notifications)
        .where(and(
            eq(notifications.id, notificationId),
            eq(notifications.userId, userId)
        ))
        .returning();
    return deleted;
}

// Get or create notification settings
export async function getNotificationSettings(userId: string) {
    const [existing] = await db.select()
        .from(notificationSettings)
        .where(eq(notificationSettings.userId, userId));

    if (existing) return existing;

    // Create default settings
    const [created] = await db.insert(notificationSettings).values({
        userId,
    }).returning();
    return created;
}

// Update notification settings
export async function updateNotificationSettings(userId: string, updates: {
    habitReminders?: boolean;
    scheduleReminders?: boolean;
    scheduleReminderMinutes?: number;
    pushEnabled?: boolean;
}) {
    // Ensure settings exist first
    await getNotificationSettings(userId);

    const [updated] = await db.update(notificationSettings)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(notificationSettings.userId, userId))
        .returning();
    return updated;
}

// Save a push subscription
export async function savePushSubscription(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    userAgent?: string
) {
    // Remove existing subscription for this endpoint if exists
    await db.delete(pushSubscriptions)
        .where(eq(pushSubscriptions.endpoint, endpoint));

    const [subscription] = await db.insert(pushSubscriptions).values({
        userId,
        endpoint,
        p256dh,
        auth,
        userAgent,
    }).returning();
    return subscription;
}

// Get push subscriptions for a user
export async function getPushSubscriptions(userId: string) {
    return db.select()
        .from(pushSubscriptions)
        .where(eq(pushSubscriptions.userId, userId));
}

// Remove a push subscription
export async function removePushSubscription(userId: string, endpoint: string) {
    const [removed] = await db.delete(pushSubscriptions)
        .where(and(
            eq(pushSubscriptions.userId, userId),
            eq(pushSubscriptions.endpoint, endpoint)
        ))
        .returning();
    return removed;
}
