import useSWR from 'swr';
import { usersApi, habitsApi, notesApi, linksApi } from '../lib';

interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    image?: string;
    bio?: string;
    username?: string;
    location?: string;
}

interface ProfileStats {
    habits: number;
    notes: number;
    links: number;
}

interface ProfileData {
    user: UserProfile | null;
    stats: ProfileStats;
}

const fetcher = async (): Promise<ProfileData> => {
    const [userResult, habitsResult, notesResult, linksResult] = await Promise.all([
        usersApi.getMe(),
        habitsApi.getAll({}),
        notesApi.getAll(),
        linksApi.getAll()
    ]);

    const user = userResult.success && userResult.data
        ? userResult.data as unknown as UserProfile
        : null;

    const stats = {
        habits: habitsResult.success && habitsResult.data ? habitsResult.data.length : 0,
        notes: notesResult.success && notesResult.data ? notesResult.data.length : 0,
        links: linksResult.success && linksResult.data ? linksResult.data.length : 0,
    };

    return { user, stats };
};

export function useProfile() {
    const { data, error, isLoading, mutate } = useSWR<ProfileData>('profile', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        user: data?.user || null,
        stats: data?.stats || { habits: 0, notes: 0, links: 0 },
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
