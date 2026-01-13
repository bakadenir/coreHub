import useSWR from 'swr';
import { schedulesApi } from '../lib';
import type { ScheduleEvent } from '../types';

interface ScheduleParams {
    startDate: string;
    endDate: string;
    view: 'month' | 'week' | 'day';
}

const fetcher = async (key: string): Promise<ScheduleEvent[]> => {
    // Parse params from key
    const params = JSON.parse(key.replace('schedules:', '')) as ScheduleParams;

    const result = await schedulesApi.getAll({
        startDate: params.startDate,
        endDate: params.endDate,
        view: params.view,
    });

    if (result.success && result.data) {
        return result.data;
    }
    throw new Error(result.error || 'Failed to fetch schedules');
};

export function useSchedule(params: ScheduleParams) {
    const key = `schedules:${JSON.stringify(params)}`;

    const { data, error, isLoading, mutate } = useSWR<ScheduleEvent[]>(key, fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        events: data || [],
        isLoading,
        error: error?.message || null,
        mutate,
    };
}
