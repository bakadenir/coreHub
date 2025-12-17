import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';  // Better Auth user table

export const notes = pgTable('notes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content'),
    tag: varchar('tag', { length: 100 }), // 'Work', 'Personal', 'Learning', 'Health', 'Ideas'
    isPinned: boolean('is_pinned').default(false),
    pinnedUntil: timestamp('pinned_until'),
    reminderAt: timestamp('reminder_at'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

// Relations
export const notesRelations = relations(notes, ({ one }) => ({
    user: one(user, {
        fields: [notes.userId],
        references: [user.id],
    }),
}));
