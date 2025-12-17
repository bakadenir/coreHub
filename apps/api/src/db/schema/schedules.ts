import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';  // Better Auth user table

export const scheduleEvents = pgTable('schedule_events', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    startTime: timestamp('start_time').notNull(),
    endTime: timestamp('end_time'),
    location: varchar('location', { length: 255 }),
    platform: varchar('platform', { length: 100 }), // 'Google Meet', 'Zoom', etc
    color: varchar('color', { length: 50 }).default('border-gray-600'),
    isAllDay: boolean('is_all_day').default(false),
    recurrence: varchar('recurrence', { length: 50 }), // 'none', 'daily', 'weekly', 'monthly'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

export const eventAttendees = pgTable('event_attendees', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => scheduleEvents.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    email: varchar('email', { length: 255 }),
    status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'accepted', 'declined'
});

// Relations
export const scheduleEventsRelations = relations(scheduleEvents, ({ one, many }) => ({
    user: one(user, {
        fields: [scheduleEvents.userId],
        references: [user.id],
    }),
    attendees: many(eventAttendees),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
    event: one(scheduleEvents, {
        fields: [eventAttendees.eventId],
        references: [scheduleEvents.id],
    }),
    user: one(user, {
        fields: [eventAttendees.userId],
        references: [user.id],
    }),
}));
