import { supabase } from '../config/supabase';
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
    async create(data: CreateDonationDto) {
        // Cancel any existing pending donations for this user/email to prevent duplicates
        if (data.userId || data.email) {
            const query = supabase
                .from('donations')
                .update({ status: 'cancelled' })
                .eq('status', 'pending');

            if (data.userId) {
                await query.eq('user_id', data.userId);
            } else if (data.email) {
                await query.eq('email', data.email);
            }
        }

        const orderId = `DONATE-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const { data: donation, error } = await supabase
            .from('donations')
            .insert({
                order_id: orderId,
                amount: data.amount,
                name: data.name,
                email: data.email || null,
                message: data.message || null,
                user_id: data.userId || null,
                status: 'pending',
                payment_type: 'midtrans',
            })
            .select()
            .single();

        if (error) throw error;

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
        } catch (err) {
            await supabase
                .from('donations')
                .update({ status: 'failed' })
                .eq('id', donation.id);
            throw err;
        }
    }

    async handleWebhook(notification: MidtransNotification) {
        const { order_id, transaction_status, transaction_id, fraud_status } = notification;

        try {
            const statusResponse = await coreApi.transaction.notification(notification);
            console.log('Midtrans notification verified:', statusResponse);
        } catch (err) {
            console.error('Midtrans notification verification failed:', err);
        }

        let status: string;
        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            status = (fraud_status === 'accept' || !fraud_status) ? 'success' : 'failed';
        } else if (transaction_status === 'pending') {
            status = 'pending';
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
            status = transaction_status === 'expire' ? 'expired' : 'failed';
        } else {
            status = 'pending';
        }

        const { data: updated, error } = await supabase
            .from('donations')
            .update({
                status,
                transaction_id,
                paid_at: status === 'success' ? new Date().toISOString() : null,
            })
            .eq('order_id', order_id)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }

    async verifyTransaction(orderId: string) {
        try {
            const statusResponse = await coreApi.transaction.status(orderId);
            console.log('Midtrans status check:', statusResponse);

            const { transaction_status, fraud_status, transaction_id } = statusResponse;

            let status: string;
            if (transaction_status === 'capture' || transaction_status === 'settlement') {
                status = (fraud_status === 'accept' || !fraud_status) ? 'success' : 'failed';
            } else if (transaction_status === 'pending') {
                status = 'pending';
            } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
                status = transaction_status === 'expire' ? 'expired' : 'failed';
            } else {
                status = 'pending';
            }

            const { data: updated, error } = await supabase
                .from('donations')
                .update({
                    status,
                    transaction_id,
                    paid_at: status === 'success' ? new Date().toISOString() : null,
                })
                .eq('order_id', orderId)
                .select()
                .single();

            if (error) throw error;

            // Only send notification if status is success, user exists, and notification hasn't been sent yet
            if (status === 'success' && updated?.user_id && !updated?.notification_sent) {
                const { createNotification } = await import('./notifications.service');
                await createNotification(
                    updated.user_id,
                    'system',
                    'Thank you for your donation! 🎉',
                    `Your donation of Rp ${updated.amount.toLocaleString('id-ID')} has been received.`
                );
                // Mark notification as sent to prevent duplicates
                await supabase
                    .from('donations')
                    .update({ notification_sent: true })
                    .eq('id', updated.id);
            }

            return updated;
        } catch (err) {
            console.error('Error verifying transaction:', err);
            throw err;
        }
    }

    async markAsSuccess(orderId: string) {
        const { data: updated, error } = await supabase
            .from('donations')
            .update({ status: 'success', paid_at: new Date().toISOString() })
            .eq('order_id', orderId)
            .select()
            .single();

        if (error) throw error;
        if (!updated) return null;

        // Only send notification if user exists and notification hasn't been sent yet
        if (updated.user_id && !updated.notification_sent) {
            try {
                const { createNotification } = await import('./notifications.service');
                await createNotification(
                    updated.user_id,
                    'system',
                    'Thank you for your donation! 🎉',
                    `Your donation of Rp ${updated.amount.toLocaleString('id-ID')} has been received.`
                );
                // Mark notification as sent to prevent duplicates
                await supabase
                    .from('donations')
                    .update({ notification_sent: true })
                    .eq('id', updated.id);
            } catch (e) {
                console.error('Error creating notification:', e);
            }
        }

        return updated;
    }

    async findAllPublic(limit = 20) {
        const { data, error } = await supabase
            .from('donations')
            .select('id, amount, currency, name, message, paid_at')
            .eq('status', 'success')
            .order('paid_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    }

    async findByUser(userId: string) {
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findByOrderId(orderId: string) {
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .eq('order_id', orderId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async findAll() {
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async findPendingByUser(userId: string) {
        const { data, error } = await supabase
            .from('donations')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async cancelByOrderId(orderId: string, userId: string) {
        const { data, error } = await supabase
            .from('donations')
            .update({ status: 'cancelled' })
            .eq('order_id', orderId)
            .eq('user_id', userId)
            .eq('status', 'pending')
            .select()
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async verifyAllPending() {
        const { data: pendingDonations } = await supabase
            .from('donations')
            .select('*')
            .eq('status', 'pending');

        const results = [];
        for (const donation of pendingDonations || []) {
            try {
                const updated = await this.verifyTransaction(donation.order_id);
                results.push({
                    orderId: donation.order_id,
                    previousStatus: 'pending',
                    newStatus: updated?.status || 'unknown',
                    success: true,
                });
            } catch (err) {
                results.push({
                    orderId: donation.order_id,
                    previousStatus: 'pending',
                    newStatus: 'error',
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }

        return { total: (pendingDonations || []).length, results };
    }
}
