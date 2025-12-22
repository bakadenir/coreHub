import { db } from '../config/database';
import { habits, habitCompletions } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

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
        const conditions = [eq(habits.userId, userId), isNull(habits.deletedAt)];

        if (filters.frequency) {
            conditions.push(eq(habits.frequency, filters.frequency));
        }
        if (filters.category) {
            conditions.push(eq(habits.category, filters.category));
        }
        if (!filters.archived) {
            conditions.push(eq(habits.isArchived, false));
        }

        const result = await db.query.habits.findMany({
            where: and(...conditions),
            orderBy: desc(habits.createdAt),
            with: {
                completions: filters.date ? {
                    where: eq(habitCompletions.date, filters.date),
                } : {
                    limit: 7,
                    orderBy: desc(habitCompletions.completedAt),
                },
            },
        });

        return result.map(habit => ({
            ...habit,
            completed: filters.date
                ? habit.completions.length > 0
                : habit.completions.some(c => c.date === new Date().toISOString().split('T')[0]),
            completionRate: this.calculateCompletionRate(habit.completions),
        }));
    }

    async create(userId: string, data: CreateHabitDto) {
        const [habit] = await db.insert(habits).values({
            userId,
            ...data,
        }).returning();
        return habit;
    }

    async findById(id: string, userId: string) {
        return db.query.habits.findFirst({
            where: and(eq(habits.id, id), eq(habits.userId, userId), isNull(habits.deletedAt)),
            with: {
                completions: {
                    limit: 30,
                    orderBy: desc(habitCompletions.completedAt),
                },
            },
        });
    }

    async update(id: string, userId: string, data: UpdateHabitDto) {
        const [habit] = await db.update(habits)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(habits.id, id), eq(habits.userId, userId)))
            .returning();
        return habit;
    }

    async softDelete(id: string, userId: string) {
        await db.update(habits)
            .set({ deletedAt: new Date() })
            .where(and(eq(habits.id, id), eq(habits.userId, userId)));
    }

    async markComplete(habitId: string, userId: string, date: Date) {
        // Verify habit belongs to user
        const habit = await this.findById(habitId, userId);
        if (!habit) throw new Error('Habit not found');

        const dateStr = date.toISOString().split('T')[0];

        // Check if already completed
        const existing = await db.query.habitCompletions.findFirst({
            where: and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, dateStr)),
        });

        if (existing) return existing;

        const [completion] = await db.insert(habitCompletions).values({
            habitId,
            date: dateStr,
            completedAt: new Date(),
        }).returning();

        // Update streak
        await this.updateStreak(habitId);

        return completion;
    }

    async unmarkComplete(habitId: string, userId: string, date: Date) {
        const habit = await this.findById(habitId, userId);
        if (!habit) throw new Error('Habit not found');

        const dateStr = date.toISOString().split('T')[0];
        await db.delete(habitCompletions)
            .where(and(eq(habitCompletions.habitId, habitId), eq(habitCompletions.date, dateStr)));

        await this.updateStreak(habitId);
    }

    async setArchived(id: string, userId: string, archived: boolean) {
        const [habit] = await db.update(habits)
            .set({ isArchived: archived, updatedAt: new Date() })
            .where(and(eq(habits.id, id), eq(habits.userId, userId)))
            .returning();
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
        // Simple streak calculation - count consecutive days
        const completions = await db.query.habitCompletions.findMany({
            where: eq(habitCompletions.habitId, habitId),
            orderBy: desc(habitCompletions.date),
            limit: 365,
        });

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < completions.length; i++) {
            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);
            const dateStr = expectedDate.toISOString().split('T')[0];

            if (completions.some(c => c.date === dateStr)) {
                streak++;
            } else {
                break;
            }
        }

        await db.update(habits).set({ streak }).where(eq(habits.id, habitId));
    }

    private calculateCompletionRate(completions: any[]) {
        if (completions.length === 0) return 0;
        // Simple calculation based on last 7 days
        return Math.round((completions.length / 7) * 100);
    }
}
