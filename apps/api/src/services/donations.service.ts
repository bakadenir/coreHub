import { db } from '../config/database';
import { donations } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
/// <reference path="../types/midtrans-client.d.ts" />
import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

// Initialize Midtrans Core API for notification handling
const coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});

export interface CreateDonationDto {
    amount: number;
    name: string;
    email?: string;
    message?: string;
    userId?: string;
}

export interface MidtransNotification {
    transaction_status: string;
    order_id: string;
    transaction_id: string;
    payment_type: string;
    fraud_status?: string;
}

export class DonationsService {
    // Create a new donation and get Midtrans Snap token
    async create(data: CreateDonationDto) {
        const orderId = `DONATE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Create donation record in database
        const [donation] = await db.insert(donations).values({
            orderId,
            amount: data.amount,
            name: data.name,
            email: data.email || null,
            message: data.message || null,
            userId: data.userId || null,
            status: 'pending',
            paymentType: 'midtrans',
        }).returning();

        // Create Midtrans transaction
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: data.amount,
            },
            customer_details: {
                first_name: data.name,
                email: data.email || 'anonymous@corehub.app',
            },
            item_details: [{
                id: 'DONATION',
                price: data.amount,
                quantity: 1,
                name: `Donation to coreHub${data.message ? ` - ${data.message.substring(0, 50)}` : ''}`,
            }],
            callbacks: {
                finish: `${frontendUrl}/donate?status=success&order_id=${orderId}`,
                error: `${frontendUrl}/donate?status=error&order_id=${orderId}`,
                pending: `${frontendUrl}/donate?status=pending&order_id=${orderId}`,
            },
        };

        try {
            const snapTransaction = await snap.createTransaction(parameter);
            return {
                donation,
                snapToken: snapTransaction.token,
                redirectUrl: snapTransaction.redirect_url,
            };
        } catch (error) {
            // If Midtrans fails, mark donation as failed
            await db.update(donations)
                .set({ status: 'failed' })
                .where(eq(donations.id, donation.id));
            throw error;
        }
    }

    // Handle Midtrans webhook notification
    async handleWebhook(notification: MidtransNotification) {
        const { order_id, transaction_status, transaction_id, fraud_status } = notification;

        // Verify notification signature (optional but recommended)
        try {
            const statusResponse = await coreApi.transaction.notification(notification);
            console.log('Midtrans notification verified:', statusResponse);
        } catch (error) {
            console.error('Midtrans notification verification failed:', error);
        }

        let status: string;

        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            if (fraud_status === 'accept' || !fraud_status) {
                status = 'success';
            } else {
                status = 'failed';
            }
        } else if (transaction_status === 'pending') {
            status = 'pending';
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
            status = transaction_status === 'expire' ? 'expired' : 'failed';
        } else {
            status = 'pending';
        }

        // Update donation record
        const [updated] = await db.update(donations)
            .set({
                status,
                transactionId: transaction_id,
                paidAt: status === 'success' ? new Date() : null,
            })
            .where(eq(donations.orderId, order_id))
            .returning();

        return updated;
    }

    // Verify transaction status directly with Midtrans (for localhost testing when webhook can't reach)
    async verifyTransaction(orderId: string) {
        try {
            // Get transaction status from Midtrans
            const statusResponse = await coreApi.transaction.status(orderId);
            console.log('Midtrans status check:', statusResponse);

            const { transaction_status, fraud_status, transaction_id } = statusResponse;

            let status: string;
            if (transaction_status === 'capture' || transaction_status === 'settlement') {
                if (fraud_status === 'accept' || !fraud_status) {
                    status = 'success';
                } else {
                    status = 'failed';
                }
            } else if (transaction_status === 'pending') {
                status = 'pending';
            } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
                status = transaction_status === 'expire' ? 'expired' : 'failed';
            } else {
                status = 'pending';
            }

            // Update donation record
            const [updated] = await db.update(donations)
                .set({
                    status,
                    transactionId: transaction_id,
                    paidAt: status === 'success' ? new Date() : null,
                })
                .where(eq(donations.orderId, orderId))
                .returning();

            // Create notification for user if payment was successful
            if (status === 'success' && updated?.userId) {
                const { createNotification } = await import('./notifications.service');
                await createNotification(
                    updated.userId,
                    'system',
                    'Thank you for your donation! 🎉',
                    `Your donation of Rp ${updated.amount.toLocaleString('id-ID')} has been received. Thank you for supporting coreHub!`
                );
            }

            return updated;
        } catch (error) {
            console.error('Error verifying transaction:', error);
            throw error;
        }
    }

    // Get all successful donations (public)
    async findAllPublic(limit = 20) {
        return db.query.donations.findMany({
            where: eq(donations.status, 'success'),
            orderBy: desc(donations.paidAt),
            limit,
            columns: {
                id: true,
                amount: true,
                currency: true,
                name: true,
                message: true,
                paidAt: true,
            },
        });
    }

    // Get user's donations
    async findByUser(userId: string) {
        return db.query.donations.findMany({
            where: eq(donations.userId, userId),
            orderBy: desc(donations.createdAt),
        });
    }

    // Get donation by order ID
    async findByOrderId(orderId: string) {
        return db.query.donations.findFirst({
            where: eq(donations.orderId, orderId),
        });
    }
}
