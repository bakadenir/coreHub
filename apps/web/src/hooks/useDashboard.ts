import useSWR from 'swr';
import { habitsApi, schedulesApi, notesApi, linksApi, todosApi } from '../lib';
import type { Habit, ScheduleEvent, Note, LinkItem, Todo } from '../types';

interface DashboardData {
    habits: Habit[];
    schedules: ScheduleEvent[];
    notes: Note[];
    links: LinkItem[];
    todos: Todo[];
}

const fetcher = async (): Promise<DashboardData> => {
    const [habitsRes, schedulesRes, notesRes, linksRes, todosRes] = await Promise.all([
        habitsApi.getAll(),
        schedulesApi.getAll(),
        notesApi.getAll(),
        linksApi.getAll(),
        todosApi.getAll()
    ]);

    // Process habits - filter for today
    let habits: Habit[] = [];
    if (habitsRes.success && habitsRes.data) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDayIndex = (new Date().getDay() + 6) % 7; // Convert JS day to modal day

        habits = habitsRes.data.filter(habit => {
            // Check start date
            if (habit.startDate) {
                const start = new Date(habit.startDate);
                start.setHours(0, 0, 0, 0);
                if (today < start) return false;
            }

            // Check frequency
            const freq = habit.frequency.toLowerCase();
            if (freq === 'daily') return true;
            if (freq === 'weekly') {
                if (habit.specificDays && habit.specificDays.length > 0) {
                    return habit.specificDays.includes(currentDayIndex);
                }
                return false;
            }
            return true;
        });
    }

    // Process schedules - filter for upcoming
    let schedules: ScheduleEvent[] = [];
    if (schedulesRes.success && schedulesRes.data) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        schedules = schedulesRes.data
            .filter(event => new Date(event.startTime) >= now)
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    }

    const notes = notesRes.success && notesRes.data ? notesRes.data : [];
    const links = linksRes.success && linksRes.data ? linksRes.data : [];
    const todos = todosRes.success && todosRes.data ? todosRes.data : [];

    return { habits, schedules, notes, links, todos };
};

export function useDashboard() {
    const { data, error, isLoading, mutate } = useSWR<DashboardData>('dashboard', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    return {
        habits: data?.habits || [],
        schedules: data?.schedules || [],
        notes: data?.notes || [],
        links: data?.links || [],
        todos: data?.todos || [],
        isLoading,
        error: error?.message || null,
        refresh: mutate,
    };
}
