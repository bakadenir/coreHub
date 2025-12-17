import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false),
    username: varchar('username', { length: 100 }).unique(),
    name: varchar('name', { length: 255 }).notNull(),
    bio: text('bio'),
    avatar: text('avatar'),
    role: varchar('role', { length: 20 }).default('user'), // 'user' | 'pro' | 'admin'
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});
