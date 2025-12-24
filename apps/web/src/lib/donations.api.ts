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
        api.post('/api/donations', data),

    // Get public donations list
    getPublic: (limit = 20): Promise<ApiResponse<Donation[]>> =>
        api.get(`/api/donations?limit=${limit}`),

    // Get user's donation history
    getMy: (): Promise<ApiResponse<Donation[]>> =>
        api.get('/api/donations/my'),

    // Get pending donation for current user
    getPending: (): Promise<ApiResponse<Donation | null>> =>
        api.get('/api/donations/pending'),

    // Get donation by order ID
    getByOrderId: (orderId: string): Promise<ApiResponse<Donation>> =>
        api.get(`/api/donations/${orderId}`),

    // Verify transaction status with Midtrans (for localhost testing)
    verify: (orderId: string): Promise<ApiResponse<Donation>> =>
        api.post(`/api/donations/${orderId}/verify`),

    // Cancel pending donation
    cancel: (orderId: string): Promise<ApiResponse<{ cancelled: boolean }>> =>
        api.post(`/api/donations/${orderId}/cancel`),
};
