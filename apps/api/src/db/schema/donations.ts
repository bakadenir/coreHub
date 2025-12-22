import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

// Donations table for storing donation records
export const donations = pgTable('donations', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
    orderId: text('order_id').notNull().unique(),
    amount: integer('amount').notNull(), // Amount in smallest unit (cents/rupiah)
    currency: text('currency').notNull().default('IDR'),
    paymentType: text('payment_type').notNull().default('midtrans'), // midtrans, stripe
    status: text('status').notNull().default('pending'), // pending, success, failed, expired
    transactionId: text('transaction_id'),
    name: text('name').notNull(),
    email: text('email'),
    message: text('message'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    paidAt: timestamp('paid_at'),
});

// Relations
export const donationsRelations = relations(donations, ({ one }) => ({
    user: one(user, {
        fields: [donations.userId],
        references: [user.id],
    }),
}));
