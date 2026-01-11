import useSWR from 'swr';
import { habitsApi } from '../lib';
import type { Habit } from '../types';

interface HabitFilters {
    frequency?: string;
    archived?: boolean;
}

// Fetcher for habits
const habitsFetcher = async (filters: HabitFilters): Promise<Habit[]> => {
    const result = await habitsApi.getAll(filters);
    if (result.success && result.data) {
        return result.data;
    }
    throw new Error(result.error || 'Failed to fetch habits');
};

export function useHabits(filters: HabitFilters = {}) {
    // Create a stable key from filters
    const key = ['habits', JSON.stringify(filters)];

    const { data, error, isLoading, mutate } = useSWR<Habit[]>(
        key,
        () => habitsFetcher(filters),
        {
            // Keep previous data while revalidating (no loading flash)
            keepPreviousData: true,
        }
    );

    return {
        habits: data || [],
        isLoading: isLoading && !data, // Only show loading on first load
        isError: !!error,
        error: error?.message,
        refresh: mutate,
        // Optimistic update helper
        setHabits: (updater: (prev: Habit[]) => Habit[]) => {
            mutate(prev => updater(prev || []), { revalidate: false });
        },
    };
}
