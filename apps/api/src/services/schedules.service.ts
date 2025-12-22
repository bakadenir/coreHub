import { db } from '../config/database';
import { scheduleEvents } from '../db/schema';
import { eq, and, isNull, desc, gte, lte } from 'drizzle-orm';

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

export class SchedulesService {
    async findAll(userId: string, filters: ScheduleFilters) {
        const conditions = [eq(scheduleEvents.userId, userId), isNull(scheduleEvents.deletedAt)];

        if (filters.startDate) {
            conditions.push(gte(scheduleEvents.startTime, new Date(filters.startDate)));
        }
        if (filters.endDate) {
            conditions.push(lte(scheduleEvents.startTime, new Date(filters.endDate)));
        }

        return db.query.scheduleEvents.findMany({
            where: and(...conditions),
            orderBy: desc(scheduleEvents.startTime),
            with: {
                attendees: true,
            },
        });
    }

    async getAgenda(userId: string) {
        const now = new Date();
        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const events = await db.query.scheduleEvents.findMany({
            where: and(
                eq(scheduleEvents.userId, userId),
                isNull(scheduleEvents.deletedAt),
                gte(scheduleEvents.startTime, now),
                lte(scheduleEvents.startTime, endOfWeek)
            ),
            orderBy: scheduleEvents.startTime,
            with: {
                attendees: true,
            },
            limit: 10,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return events.map(event => ({
            ...event,
            isToday: new Date(event.startTime) >= today && new Date(event.startTime) < tomorrow,
        }));
    }

    async create(userId: string, data: CreateScheduleDto) {
        const [event] = await db.insert(scheduleEvents).values({
            userId,
            ...data,
            startTime: new Date(data.startTime),
            endTime: data.endTime ? new Date(data.endTime) : null,
        }).returning();
        return event;
    }

    async findById(id: string, userId: string) {
        return db.query.scheduleEvents.findFirst({
            where: and(
                eq(scheduleEvents.id, id),
                eq(scheduleEvents.userId, userId),
                isNull(scheduleEvents.deletedAt)
            ),
            with: {
                attendees: true,
            },
        });
    }

    async update(id: string, userId: string, data: UpdateScheduleDto) {
        const updateData: any = { ...data, updatedAt: new Date() };
        if (data.startTime) updateData.startTime = new Date(data.startTime);
        if (data.endTime) updateData.endTime = new Date(data.endTime);

        const [event] = await db.update(scheduleEvents)
            .set(updateData)
            .where(and(eq(scheduleEvents.id, id), eq(scheduleEvents.userId, userId)))
            .returning();
        return event;
    }

    async delete(id: string, userId: string) {
        await db.update(scheduleEvents)
            .set({ deletedAt: new Date() })
            .where(and(eq(scheduleEvents.id, id), eq(scheduleEvents.userId, userId)));
    }
}
