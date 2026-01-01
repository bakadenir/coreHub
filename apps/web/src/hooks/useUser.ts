import useSWR from 'swr';
import { usersApi } from '../lib';
import type { UserProfile } from '../types';

const fetcher = async (): Promise<UserProfile | null> => {
    const result = await usersApi.getMe();
    if (result.success && result.data) {
        return result.data;
    }
    return null;
};

export function useUser() {
    // Uses global SWRConfig settings (60s dedupe, no auto-revalidate)
    const { data, error, isLoading, mutate } = useSWR<UserProfile | null>(
        'user-profile',
        fetcher
    );

    return {
        user: data,
        isLoading,
        isError: !!error,
        refresh: mutate,
    };
}
