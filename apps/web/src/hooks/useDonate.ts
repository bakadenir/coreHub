import useSWR from 'swr';
import { donationsApi, feedbackApi, usersApi } from '../lib';

interface Donation {
    id: string;
    orderId: string;
    amount: number;
    currency: string;
    name: string;
    message?: string;
    paidAt?: string;
}

interface Review {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
}

interface DonateData {
    donations: Donation[];
    reviews: Review[];
    userAvatar: string | null;
}

const fetcher = async (): Promise<DonateData> => {
    const [donationsResult, reviewsResult, userResult] = await Promise.all([
        donationsApi.getPublic(20),
        feedbackApi.getReviews(100),
        usersApi.getMe()
    ]);

    const donations = donationsResult.success && donationsResult.data
        ? donationsResult.data
        : [];

    const reviews = reviewsResult.success && reviewsResult.data
        ? reviewsResult.data as Review[]
        : [];

    // Helper to construct full URL for uploaded files
    const getFullAvatarUrl = (imageUrl: string | null | undefined): string | null => {
        if (!imageUrl || imageUrl.trim() === '') return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            return `${apiUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    const userAvatar = userResult.success && userResult.data
        ? getFullAvatarUrl(userResult.data.image)
        : null;

    return { donations, reviews, userAvatar };
};

export function useDonate() {
    const { data, error, isLoading, mutate } = useSWR<DonateData>('donate', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        donations: data?.donations || [],
        reviews: data?.reviews || [],
        userAvatar: data?.userAvatar || null,
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
