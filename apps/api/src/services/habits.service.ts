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
        if (filters.archived) {
            query = query.eq('is_archived', true);
        } else {
            query = query.eq('is_archived', false);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const today = new Date().toISOString().split('T')[0];
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        // Get day of week (0 = Monday, 1 = Tuesday, ..., 6 = Sunday)
        const todayDayOfWeek = todayDate.getDay() === 0 ? 6 : todayDate.getDay() - 1;

        return (data || []).map(habit => {
            // Check if habit has started
            let hasStarted = true;
            if (habit.start_date) {
                const startDate = new Date(habit.start_date);
                startDate.setHours(0, 0, 0, 0);
                hasStarted = todayDate >= startDate;
            }

            // Check if habit is due today based on frequency and specific_days
            let isDueToday = true;
            if (habit.specific_days && habit.specific_days.length > 0) {
                // specific_days is array of day indices: 0=Mon, 1=Tue, ..., 6=Sun
                isDueToday = habit.specific_days.includes(todayDayOfWeek);
            } else if (habit.frequency === 'weekly') {
                // For weekly without specific days, always due (user can complete any day)
                isDueToday = true;
            }
            // For daily, always due

            return {
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
                completed: (habit.habit_completions || []).some((c: any) => {
                    const completedDate = c.completed_at ? c.completed_at.split('T')[0] : null;
                    return completedDate === (filters.date || today);
                }),
                completionRate: this.calculateCompletionRate(habit.habit_completions || []),
                streak: habit.streak || 0,  // Include streak from database
                hasStarted,  // Indicates if the habit start_date has passed
                isDueToday,  // Indicates if this habit should be completed today
            };
        });
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

        // Check if habit has started (start_date validation)
        if (habit.start_date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startDate = new Date(habit.start_date);
            startDate.setHours(0, 0, 0, 0);

            if (today < startDate) {
                throw new Error(`This habit starts on ${habit.start_date}. You cannot mark it complete before then.`);
            }
        }

        const dateStr = date.toISOString().split('T')[0];

        // Check if already completed today - use completed_at with date extraction
        const { data: existing, error: existingError } = await supabase
            .from('habit_completions')
            .select('*')
            .eq('habit_id', habitId)
            .gte('completed_at', `${dateStr}T00:00:00.000Z`)
            .lt('completed_at', `${dateStr}T23:59:59.999Z`)
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) return existing;

        const { data: completion, error } = await supabase
            .from('habit_completions')
            .insert({
                habit_id: habitId,
                user_id: userId,
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
            .gte('completed_at', `${dateStr}T00:00:00.000Z`)
            .lt('completed_at', `${dateStr}T23:59:59.999Z`);

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
            .select('completed_at')
            .eq('habit_id', habitId)
            .order('completed_at', { ascending: false })
            .limit(365);

        if (!completions || completions.length === 0) {
            await supabase.from('habits').update({ streak: 0 }).eq('id', habitId);
            return;
        }

        let streak = 0;
        const today = new Date();

        // Get today's date in local timezone as YYYY-MM-DD
        const getLocalDateStr = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Convert completion dates to local date strings for comparison
        const completionDates = new Set(
            completions.map(c => {
                if (!c.completed_at) return null;
                // Parse the ISO date and get local date string
                const date = new Date(c.completed_at);
                return getLocalDateStr(date);
            }).filter(Boolean)
        );

        // Check consecutive days starting from today
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateStr = getLocalDateStr(checkDate);

            if (completionDates.has(dateStr)) {
                streak++;
            } else {
                // If it's not today (i > 0) and we break, keep the streak
                // If today is not completed but yesterday was, streak should still count yesterday's
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
