import useSWR from 'swr';
import { notesApi } from '../lib';
import type { Note } from '../types';

const fetcher = async (key: string): Promise<Note[]> => {
    // Parse search term from key (format: "notes" or "notes?search=term")
    const searchMatch = key.match(/\?search=(.+)$/);
    const searchTerm = searchMatch ? decodeURIComponent(searchMatch[1]) : undefined;

    const result = await notesApi.getAll(searchTerm ? { search: searchTerm } : {});
    if (result.success && result.data) {
        return result.data;
    }
    throw new Error(result.error || 'Failed to fetch notes');
};

export function useNotes(searchTerm?: string) {
    const key = searchTerm ? `notes?search=${encodeURIComponent(searchTerm)}` : 'notes';

    const { data, error, isLoading, mutate } = useSWR<Note[]>(key, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        notes: data || [],
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
