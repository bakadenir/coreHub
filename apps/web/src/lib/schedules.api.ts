import { api } from './api';
import type { ScheduleEvent, AgendaItem } from '../types';

interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    view?: 'day' | 'week' | 'month';
}

interface CreateScheduleData {
    title: string;
    description?: string;
    startTime: string;
    endTime?: string;
    location?: string;
    platform?: string;
    color?: string;
    isAllDay?: boolean;
    recurrence?: string;
}

export const schedulesApi = {
    getAll: (filters?: ScheduleFilters) => {
        const params = new URLSearchParams();
        if (filters?.startDate) params.set('startDate', filters.startDate);
        if (filters?.endDate) params.set('endDate', filters.endDate);
        if (filters?.view) params.set('view', filters.view);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<ScheduleEvent[]>(`/api/schedules${query}`);
    },

    getAgenda: () => api.get<AgendaItem[]>('/api/schedules/agenda'),

    getById: (id: string) => api.get<ScheduleEvent>(`/api/schedules/${id}`),

    create: (data: CreateScheduleData) => api.post<ScheduleEvent>('/api/schedules', data),

    update: (id: string, data: Partial<CreateScheduleData>) =>
        api.patch<ScheduleEvent>(`/api/schedules/${id}`, data),

    delete: (id: string) => api.delete(`/api/schedules/${id}`),
};
