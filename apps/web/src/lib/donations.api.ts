import { api, type ApiResponse } from './api';

export interface CreateDonationDto {
    amount: number;
    name: string;
    email?: string;
    message?: string;
}

export interface Donation {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    message?: string;
    status?: string;
    paidAt?: string;
    createdAt?: string;
}

export interface DonationResult {
    donation: Donation;
    snapToken: string;
    redirectUrl: string;
}

export const donationsApi = {
    // Create donation and get Midtrans Snap token
    create: (data: CreateDonationDto): Promise<ApiResponse<DonationResult>> =>
        api.post('/donations', data),

    // Get public donations list
    getPublic: (limit = 20): Promise<ApiResponse<Donation[]>> =>
        api.get(`/donations?limit=${limit}`),

    // Get user's donation history
    getMy: (): Promise<ApiResponse<Donation[]>> =>
        api.get('/donations/my'),

    // Get pending donation for current user
    getPending: (): Promise<ApiResponse<Donation | null>> =>
        api.get('/donations/pending'),

    // Get donation by order ID
    getByOrderId: (orderId: string): Promise<ApiResponse<Donation>> =>
        api.get(`/donations/${orderId}`),

    // Verify transaction status with Midtrans (for localhost testing)
    verify: (orderId: string): Promise<ApiResponse<Donation>> =>
        api.post(`/donations/${orderId}/verify`),

    // Cancel pending donation
    cancel: (orderId: string): Promise<ApiResponse<{ cancelled: boolean }>> =>
        api.post(`/donations/${orderId}/cancel`),
};
