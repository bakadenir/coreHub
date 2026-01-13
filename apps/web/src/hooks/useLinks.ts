import useSWR from 'swr';
import { linksApi } from '../lib';
import type { LinkItem } from '../types';

const fetcher = async (key: string): Promise<LinkItem[]> => {
    // Parse search term from key (format: "links" or "links?search=term")
    const searchMatch = key.match(/\?search=(.+)$/);
    const searchTerm = searchMatch ? decodeURIComponent(searchMatch[1]) : undefined;

    const result = await linksApi.getAll(searchTerm ? { search: searchTerm } : {});
    if (result.success && result.data) {
        return result.data;
    }
    throw new Error(result.error || 'Failed to fetch links');
};

export function useLinks(searchTerm?: string) {
    const key = searchTerm ? `links?search=${encodeURIComponent(searchTerm)}` : 'links';

    const { data, error, isLoading, mutate } = useSWR<LinkItem[]>(key, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        links: data || [],
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
