import { api } from './api';

export interface SearchResult {
    type: 'habit' | 'note' | 'link' | 'schedule';
    id: string;
    title: string;
    subtitle?: string;
    icon: string;
    url?: string;
}

export const searchApi = {
    search: (query: string) => api.get<SearchResult[]>(`/search?q=${encodeURIComponent(query)}`),
};
