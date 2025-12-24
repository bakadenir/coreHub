import { supabase } from '../config/supabase';

export interface HabitFilters {
    frequency?: string;
    category?: string;
    archived?: boolean;
    date?: string;
}

export interface CreateHabitDto {
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    frequency: string;
    specificDays?: number[];
    reminderTime?: string;
    startDate?: string;
}

export interface UpdateHabitDto {
    name?: string;
    description?: string;
    icon?: string;
    category?: string;
    frequency?: string;
    specificDays?: number[];
    reminderTime?: string;
}

export class HabitsService {
    async findAll(userId: string, filters: HabitFilters) {
        let query = supabase
            .from('habits')
            .select('*, habit_completions(*)')
            .eq('user_id', userId)
            .is('deleted_at', null);

        if (filters.frequency) {
            query = query.eq('frequency', filters.frequency);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        if (!filters.archived) {
            query = query.eq('is_archived', false);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];

        return (data || []).map(habit => ({
            ...habit,
            id: habit.id,
            name: habit.title,  // Map DB 'title' to frontend 'name'
            userId: habit.user_id,
            specificDays: habit.specific_days,
            reminderTime: habit.reminder_time,
            startDate: habit.start_date,
            isArchived: habit.is_archived,
            createdAt: habit.created_at,
            updatedAt: habit.updated_at,
            completions: habit.habit_completions || [],
            completed: (habit.habit_completions || []).some((c: any) => c.date === (filters.date || today)),
            completionRate: this.calculateCompletionRate(habit.habit_completions || []),
        }));
    }

    async create(userId: string, data: CreateHabitDto) {
        const { data: habit, error } = await supabase
            .from('habits')
            .insert({
                user_id: userId,
                title: data.name,  // Frontend sends 'name', DB uses 'title'
                description: data.description,
                icon: data.icon,
                category: data.category,
                frequency: data.frequency,
                specific_days: data.specificDays,
                reminder_time: data.reminderTime,
                start_date: data.startDate,
            })
            .select()
            .single();

        if (error) throw error;
        return habit;
    }

    async findById(id: string, userId: string) {
        const { data, error } = await supabase
            .from('habits')
            .select('*, habit_completions(*)')
            .eq('id', id)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async update(id: string, userId: string, data: UpdateHabitDto) {
        const updateData: any = { updated_at: new Date().toISOString() };
        if (data.name !== undefined) updateData.title = data.name;  // Frontend sends 'name', DB uses 'title'
        if (data.description !== undefined) updateData.description = data.description;
        if (data.icon !== undefined) updateData.icon = data.icon;
        if (data.category !== undefined) updateData.category = data.category;
        if (data.frequency !== undefined) updateData.frequency = data.frequency;
        if (data.specificDays !== undefined) updateData.specific_days = data.specificDays;
        if (data.reminderTime !== undefined) updateData.reminder_time = data.reminderTime;

        const { data: habit, error } = await supabase
            .from('habits')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return habit;
    }

    async softDelete(id: string, userId: string) {
        const { error } = await supabase
            .from('habits')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
    }

    async markComplete(habitId: string, userId: string, date: Date) {
        // Verify habit belongs to user
        const habit = await this.findById(habitId, userId);
        if (!habit) throw new Error('Habit not found');

        const dateStr = date.toISOString().split('T')[0];

        // Check if already completed
        const { data: existing } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habitId)
            .eq('date', dateStr)
            .single();

        if (existing) return existing;

        const { data: completion, error } = await supabase
            .from('habit_completions')
            .insert({
                habit_id: habitId,
                date: dateStr,
                completed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Update streak
        await this.updateStreak(habitId);

        return completion;
    }

    async unmarkComplete(habitId: string, userId: string, date: Date) {
        const habit = await this.findById(habitId, userId);
        if (!habit) throw new Error('Habit not found');

        const dateStr = date.toISOString().split('T')[0];

        const { error } = await supabase
            .from('habit_completions')
            .delete()
            .eq('habit_id', habitId)
            .eq('date', dateStr);

        if (error) throw error;

        await this.updateStreak(habitId);
    }

    async setArchived(id: string, userId: string, archived: boolean) {
        const { data: habit, error } = await supabase
            .from('habits')
            .update({ is_archived: archived, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return habit;
    }

    async getStats(userId: string) {
        const allHabits = await this.findAll(userId, { archived: false });
        const completedToday = allHabits.filter(h => h.completed).length;
        const longestStreak = Math.max(...allHabits.map(h => h.streak || 0), 0);

        return {
            totalHabits: allHabits.length,
            completedToday,
            completionRate: allHabits.length > 0 ? Math.round((completedToday / allHabits.length) * 100) : 0,
            longestStreak,
        };
    }

    private async updateStreak(habitId: string) {
        const { data: completions } = await supabase
            .from('habit_completions')
            .select('date')
            .eq('habit_id', habitId)
            .order('date', { ascending: false })
            .limit(365);

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < (completions?.length || 0); i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const dateStr = expectedDate.toISOString().split('T')[0];

            if (completions?.some(c => c.date === dateStr)) {
                streak++;
            } else {
                break;
            }
        }

        await supabase.from('habits').update({ streak }).eq('id', habitId);
    }

    private calculateCompletionRate(completions: any[]) {
        if (completions.length === 0) return 0;
        return Math.round((completions.length / 7) * 100);
    }
}
