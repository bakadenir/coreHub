import { supabase } from '../config/supabase';

// Create a new notification
export async function createNotification(
    userId: string,
    type: 'habit_reminder' | 'schedule_reminder' | 'system',
    title: string,
    message?: string,
    referenceId?: string,
    referenceType?: 'habit' | 'schedule'
) {
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type,
            title,
            message,
            reference_id: referenceId,
            reference_type: referenceType,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Create welcome notification for new users (idempotent - only creates if not exists)
export async function createWelcomeNotificationIfNeeded(userId: string, userName?: string) {
    // Check if user already has a welcome notification
    const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'system')
        .ilike('title', '%Welcome to coreHub%')
        .limit(1);

    if (existing && existing.length > 0) {
        return null; // Already has welcome notification
    }

    // Create welcome notification
    const displayName = userName || 'there';
    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            type: 'system',
            title: `Welcome to coreHub, ${displayName}! 🎉`,
            message: 'Your productivity journey starts here. Let\'s make it count!',
            is_read: false,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating welcome notification:', error);
        return null;
    }
    return data;
}

// Get notifications for a user
export async function getNotifications(userId: string, limit = 20, unreadOnly = false) {
    let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId);

    if (unreadOnly) {
        query = query.eq('is_read', false);
    }

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data || [];
}

// Get unread notification count
export async function getUnreadCount(userId: string) {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (error) throw error;
    return count || 0;
}

// Mark a notification as read
export async function markAsRead(notificationId: string, userId: string) {
    const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Mark all notifications as read
export async function markAllAsRead(userId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);

    if (error) throw error;
}

// Delete a notification
export async function deleteNotification(notificationId: string, userId: string) {
    const { data, error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Get or create notification settings
export async function getNotificationSettings(userId: string) {
    const { data: existing } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (existing) return existing;

    const { data: created, error } = await supabase
        .from('notification_settings')
        .insert({ user_id: userId })
        .select()
        .single();

    if (error) throw error;
    return created;
}

// Update notification settings
export async function updateNotificationSettings(userId: string, updates: {
    habitReminders?: boolean;
    scheduleReminders?: boolean;
    scheduleReminderMinutes?: number;
    pushEnabled?: boolean;
}) {
    await getNotificationSettings(userId);

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updates.habitReminders !== undefined) updateData.habit_reminders = updates.habitReminders;
    if (updates.scheduleReminders !== undefined) updateData.schedule_reminders = updates.scheduleReminders;
    if (updates.scheduleReminderMinutes !== undefined) updateData.schedule_reminder_minutes = updates.scheduleReminderMinutes;
    if (updates.pushEnabled !== undefined) updateData.push_enabled = updates.pushEnabled;

    const { data, error } = await supabase
        .from('notification_settings')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Save a push subscription
export async function savePushSubscription(
    userId: string,
    endpoint: string,
    p256dh: string,
    auth: string,
    userAgent?: string
) {
    await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', endpoint);

    const { data, error } = await supabase
        .from('push_subscriptions')
        .insert({
            user_id: userId,
            endpoint,
            p256dh,
            auth,
            user_agent: userAgent,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// Get push subscriptions for a user
export async function getPushSubscriptions(userId: string) {
    const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

    if (error) throw error;
    return data || [];
}

// Remove a push subscription
export async function removePushSubscription(userId: string, endpoint: string) {
    const { data, error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint)
        .select()
        .single();

    if (error) throw error;
    return data;
}
