import { supabase } from '../config/supabase';

export interface ScheduleFilters {
    startDate?: string;
    endDate?: string;
    view?: 'day' | 'week' | 'month';
}

export interface CreateScheduleDto {
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

export interface UpdateScheduleDto extends Partial<CreateScheduleDto> { }

// Helper to transform snake_case DB fields to camelCase for frontend
function transformEvent(event: any) {
    if (!event) return null;
    return {
        id: event.id,
        title: event.title,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        platform: event.platform,
        color: event.color || 'border-gray-600',
        isAllDay: event.is_all_day,
        recurrence: event.recurrence,
        createdAt: event.created_at,
        updatedAt: event.updated_at,
    };
}

export class SchedulesService {
    async findAll(userId: string, filters: ScheduleFilters) {
        let query = supabase
            .from('schedule_events')
            .select('*, schedule_attendees(*)')
            .eq('user_id', userId)
            .is('deleted_at', null);

        if (filters.startDate) {
            query = query.gte('start_time', filters.startDate);
        }
        if (filters.endDate) {
            query = query.lte('start_time', filters.endDate);
        }

        const { data, error } = await query.order('start_time', { ascending: true });

        if (error) throw error;
        return (data || []).map(transformEvent);
    }

    async getAgenda(userId: string) {
        const now = new Date().toISOString();
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const { data, error } = await supabase
            .from('schedule_events')
            .select('*, schedule_attendees(*)')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .gte('start_time', now)
            .lte('start_time', endOfWeek.toISOString())
            .order('start_time', { ascending: true })
            .limit(10);

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return (data || []).map(event => ({
            ...transformEvent(event),
            isToday: new Date(event.start_time) >= today && new Date(event.start_time) < tomorrow,
        }));
    }

    async create(userId: string, data: CreateScheduleDto) {
        const { data: event, error } = await supabase
            .from('schedule_events')
            .insert({
                user_id: userId,
                title: data.title,
                description: data.description,
                start_time: data.startTime,
                end_time: data.endTime,
                // Note: location, platform, color, is_all_day, recurrence columns may not exist in DB
            })
            .select()
            .single();

        if (error) throw error;
        return transformEvent(event);
    }

    async findById(id: string, userId: string) {
        const { data, error } = await supabase
            .from('schedule_events')
            .select('*, schedule_attendees(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return transformEvent(data);
    }

    async update(id: string, userId: string, data: UpdateScheduleDto) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.startTime !== undefined) updateData.start_time = data.startTime;
        if (data.endTime !== undefined) updateData.end_time = data.endTime;
        // Note: location, platform, color, is_all_day, recurrence columns may not exist in DB

        const { data: event, error } = await supabase
            .from('schedule_events')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return transformEvent(event);
    }

    async delete(id: string, userId: string) {
        const { error } = await supabase
            .from('schedule_events')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }
}
