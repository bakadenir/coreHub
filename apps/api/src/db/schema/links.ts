import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';  // Better Auth user table

export const links = pgTable('links', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    image: text('image'), // og:image or favicon
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

export const linkTags = pgTable('link_tags', {
    id: uuid('id').primaryKey().defaultRandom(),
    linkId: uuid('link_id').notNull().references(() => links.id, { onDelete: 'cascade' }),
    tag: varchar('tag', { length: 100 }).notNull(),
});

// Relations
export const linksRelations = relations(links, ({ one, many }) => ({
    user: one(user, {
        fields: [links.userId],
        references: [user.id],
    }),
    tags: many(linkTags),
}));

export const linkTagsRelations = relations(linkTags, ({ one }) => ({
    link: one(links, {
        fields: [linkTags.linkId],
        references: [links.id],
    }),
}));
