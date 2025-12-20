import { pgTable, uuid, varchar, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

// Feedback/Reviews table
export const feedback = pgTable('feedback', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // nullable for anonymous
    name: varchar('name', { length: 100 }), // display name (optional)
    avatar: text('avatar'), // user avatar URL
    rating: integer('rating').notNull(), // 1-5 stars
    comment: text('comment').notNull(),
    isPublic: boolean('is_public').default(false), // show as public review
    subscribeUpdates: boolean('subscribe_updates').default(false),
    isApproved: boolean('is_approved').default(false), // admin approval for public display
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const feedbackRelations = relations(feedback, ({ one }) => ({
    user: one(user, {
        fields: [feedback.userId],
        references: [user.id],
    }),
}));

// Type exports
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
