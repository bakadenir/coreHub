import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

// Notifications table - stores all user notifications
export const notifications = pgTable('notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(), // 'habit_reminder', 'schedule_reminder', 'system'
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message'),
    referenceId: uuid('reference_id'), // links to habit/schedule id
    referenceType: varchar('reference_type', { length: 50 }), // 'habit', 'schedule'
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

// Push subscriptions table - stores Web Push subscription info
export const pushSubscriptions = pgTable('push_subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(), // public key
    auth: text('auth').notNull(), // auth secret
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Notification settings table - user preferences
export const notificationSettings = pgTable('notification_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
    habitReminders: boolean('habit_reminders').default(true),
    scheduleReminders: boolean('schedule_reminders').default(true),
    scheduleReminderMinutes: integer('schedule_reminder_minutes').default(15),
    pushEnabled: boolean('push_enabled').default(false),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(user, {
        fields: [notifications.userId],
        references: [user.id],
    }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
    user: one(user, {
        fields: [pushSubscriptions.userId],
        references: [user.id],
    }),
}));

export const notificationSettingsRelations = relations(notificationSettings, ({ one }) => ({
    user: one(user, {
        fields: [notificationSettings.userId],
        references: [user.id],
    }),
}));
