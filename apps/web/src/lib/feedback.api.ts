import { api } from './api';

export interface Feedback {
    id: string;
    userId?: string;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    isPublic: boolean;
    isApproved: boolean;
    createdAt: string;
}

export interface CreateFeedbackDto {
    name?: string;
    avatar?: string;
    rating: number;
    comment: string;
}

export const feedbackApi = {
    // Get public reviews (no auth required)
    getReviews: (limit?: number) =>
        api.get<Feedback[]>(`/api/feedback/reviews${limit ? `?limit=${limit}` : ''}`),

    // Submit feedback
    submit: (data: CreateFeedbackDto) =>
        api.post<Feedback>('/api/feedback', data),

    // Get current user's feedback
    getMyFeedback: () =>
        api.get<Feedback[]>('/api/feedback/my'),
};
