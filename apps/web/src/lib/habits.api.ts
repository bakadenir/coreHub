import { api } from './api';
import type { Habit } from '../types';

interface HabitFilters {
    frequency?: string;
    category?: string;
    archived?: boolean;
    date?: string;
}

interface HabitStats {
    totalHabits: number;
    completedToday: number;
    completionRate: number;
    longestStreak: number;
}

interface CreateHabitData {
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    frequency: string;
    specificDays?: number[];
    reminderTime?: string;
    startDate?: string;
}

export const habitsApi = {
    getAll: (filters?: HabitFilters) => {
        const params = new URLSearchParams();
        if (filters?.frequency) params.set('frequency', filters.frequency);
        if (filters?.category) params.set('category', filters.category);
        if (filters?.archived) params.set('archived', 'true');
        if (filters?.date) params.set('date', filters.date);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<Habit[]>(`/api/habits${query}`);
    },

    getStats: () => api.get<HabitStats>('/api/habits/stats'),

    getById: (id: string) => api.get<Habit>(`/api/habits/${id}`),

    create: (data: CreateHabitData) => api.post<Habit>('/api/habits', data),

    update: (id: string, data: Partial<CreateHabitData>) =>
        api.patch<Habit>(`/api/habits/${id}`, data),

    delete: (id: string) => api.delete(`/api/habits/${id}`),

    complete: (id: string, date?: string) =>
        api.post(`/api/habits/${id}/complete`, { date }),

    uncomplete: (id: string, date?: string) => {
        const query = date ? `?date=${date}` : '';
        return api.delete(`/api/habits/${id}/complete${query}`);
    },

    archive: (id: string, archived: boolean) =>
        api.patch(`/api/habits/${id}/archive`, { archived }),
};
