import { api } from './api';
import type { LinkItem } from '../types';

interface LinkFilters {
    tags?: string[];
    search?: string;
}

interface CreateLinkData {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    tags?: string[];
}

interface LinkMetadata {
    title: string;
    description: string;
    image: string;
}

export const linksApi = {
    getAll: (filters?: LinkFilters) => {
        const params = new URLSearchParams();
        if (filters?.tags?.length) params.set('tags', filters.tags.join(','));
        if (filters?.search) params.set('search', filters.search);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<LinkItem[]>(`/links${query}`);
    },

    getById: (id: string) => api.get<LinkItem>(`/links/${id}`),

    preview: (url: string) => {
        const params = new URLSearchParams({ url });
        return api.get<LinkMetadata>(`/links/preview?${params.toString()}`);
    },

    create: (data: CreateLinkData) => api.post<LinkItem>('/links', data),

    update: (id: string, data: Partial<CreateLinkData>) =>
        api.patch<LinkItem>(`/links/${id}`, data),

    delete: (id: string) => api.delete(`/links/${id}`),
};
