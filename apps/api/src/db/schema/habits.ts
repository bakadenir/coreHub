import { pgTable, uuid, varchar, text, integer, boolean, timestamp, time, date, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';  // Better Auth user table

export const habits = pgTable('habits', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }).default('check_circle'),
    category: varchar('category', { length: 100 }), // 'Wellness', 'Learning', 'Health', 'Career'
    frequency: varchar('frequency', { length: 50 }).notNull(), // 'Daily', 'Weekly', 'Specific Days'
    specificDays: jsonb('specific_days').$type<number[]>(), // [0,1,2,3,4,5,6] for days
    reminderTime: time('reminder_time'),
    startDate: date('start_date'),
    streak: integer('streak').default(0),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    deletedAt: timestamp('deleted_at'),
});

export const habitCompletions = pgTable('habit_completions', {
    id: uuid('id').primaryKey().defaultRandom(),
    habitId: uuid('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    completedAt: timestamp('completed_at').notNull().defaultNow(),
});

// Relations
export const habitsRelations = relations(habits, ({ one, many }) => ({
    user: one(user, {
        fields: [habits.userId],
        references: [user.id],
    }),
    completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
    habit: one(habits, {
        fields: [habitCompletions.habitId],
        references: [habits.id],
    }),
}));
