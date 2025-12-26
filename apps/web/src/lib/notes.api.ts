import { api } from './api';
import type { Note } from '../types';

interface NoteFilters {
    tag?: string;
    search?: string;
    sort?: 'created' | 'updated' | 'title';
}

interface CreateNoteData {
    title: string;
    content?: string;
    tag?: string;
    reminderAt?: string;
}

interface PublicNote {
    id: string;
    title: string;
    content: string;
    authorName: string;
    authorImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

export const notesApi = {
    getAll: (filters?: NoteFilters) => {
        const params = new URLSearchParams();
        if (filters?.tag) params.set('tag', filters.tag);
        if (filters?.search) params.set('search', filters.search);
        if (filters?.sort) params.set('sort', filters.sort);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<Note[]>(`/api/notes${query}`);
    },

    getById: (id: string) => api.get<Note>(`/api/notes/${id}`),

    create: (data: CreateNoteData) => api.post<Note>('/api/notes', data),

    update: (id: string, data: Partial<CreateNoteData>) =>
        api.patch<Note>(`/api/notes/${id}`, data),

    delete: (id: string) => api.delete(`/api/notes/${id}`),

    pin: (id: string, isPinned: boolean, pinnedUntil?: string) =>
        api.patch(`/api/notes/${id}/pin`, { isPinned, pinnedUntil }),

    publish: (id: string) => api.post<Note>(`/api/notes/${id}/publish`),

    unpublish: (id: string) => api.post<Note>(`/api/notes/${id}/unpublish`),

    getPublic: (slug: string) => api.get<PublicNote>(`/api/public/notes/${slug}`),
};

