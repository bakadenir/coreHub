import { pgTable, uuid, varchar, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';  // Better Auth user table

export const activityLogs = pgTable('activity_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 255 }).notNull(),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const contentReports = pgTable('content_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    reporterId: text('reporter_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    contentType: varchar('content_type', { length: 50 }).notNull(), // 'note', 'link', 'habit'
    contentId: uuid('content_id').notNull(),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'reviewed', 'resolved'
    reviewedBy: text('reviewed_by').references(() => user.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    user: one(user, {
        fields: [activityLogs.userId],
        references: [user.id],
    }),
}));

export const contentReportsRelations = relations(contentReports, ({ one }) => ({
    reporter: one(user, {
        fields: [contentReports.reporterId],
        references: [user.id],
    }),
    reviewer: one(user, {
        fields: [contentReports.reviewedBy],
        references: [user.id],
    }),
}));
