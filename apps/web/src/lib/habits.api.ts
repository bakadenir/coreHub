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
        return api.get<Habit[]>(`/habits${query}`);
    },

    getStats: () => api.get<HabitStats>('/habits/stats'),

    getById: (id: string) => api.get<Habit>(`/habits/${id}`),

    create: (data: CreateHabitData) => api.post<Habit>('/habits', data),

    update: (id: string, data: Partial<CreateHabitData>) =>
        api.patch<Habit>(`/habits/${id}`, data),

    delete: (id: string) => api.delete(`/habits/${id}`),

    complete: (id: string, date?: string) =>
        api.post(`/habits/${id}/complete`, { date }),

    uncomplete: (id: string, date?: string) => {
        const query = date ? `?date=${date}` : '';
        return api.delete(`/habits/${id}/complete${query}`);
    },

    archive: (id: string, archived: boolean) =>
        api.patch(`/habits/${id}/archive`, { archived }),
};
