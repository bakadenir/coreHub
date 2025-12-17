import { db } from '../config/database';
import { users, habits, notes, links, activityLogs, contentReports } from '../db/schema';
import { eq, desc, count, isNull, sql, and, like, or } from 'drizzle-orm';

export interface UserFilters {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export class AdminService {
    async getStats() {
        const [userStats] = await db.select({ count: count() }).from(users).where(isNull(users.deletedAt));
        const [habitStats] = await db.select({ count: count() }).from(habits).where(isNull(habits.deletedAt));
        const [noteStats] = await db.select({ count: count() }).from(notes).where(isNull(notes.deletedAt));
        const [linkStats] = await db.select({ count: count() }).from(links).where(isNull(links.deletedAt));

        return [
            { label: 'Total Users', value: userStats.count.toString(), icon: 'people', color: 'bg-blue-500' },
            { label: 'Active Habits', value: habitStats.count.toString(), icon: 'check_circle', color: 'bg-green-500' },
            { label: 'Total Notes', value: noteStats.count.toString(), icon: 'description', color: 'bg-purple-500' },
            { label: 'Total Links', value: linkStats.count.toString(), icon: 'link', color: 'bg-orange-500' },
        ];
    }

    async getUsers(filters: UserFilters) {
        const { page, limit, search, role, status } = filters;
        const offset = (page - 1) * limit;

        const conditions = [isNull(users.deletedAt)];

        if (role) {
            conditions.push(eq(users.role, role));
        }

        let allUsers = await db.query.users.findMany({
            where: and(...conditions),
            orderBy: desc(users.createdAt),
            limit,
            offset,
        });

        if (search) {
            const searchLower = search.toLowerCase();
            allUsers = allUsers.filter(u =>
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        const [total] = await db.select({ count: count() }).from(users).where(and(...conditions));

        return {
            users: allUsers.map(u => ({
                ...u,
                status: u.deletedAt ? 'Banned' : 'Active',
            })),
            pagination: {
                page,
                limit,
                total: total.count,
                hasMore: offset + allUsers.length < total.count,
            },
        };
    }

    async updateUserRole(id: string, role: string) {
        const [user] = await db.update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async setUserBanned(id: string, banned: boolean) {
        const [user] = await db.update(users)
            .set({ deletedAt: banned ? new Date() : null, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async getActivityLogs(params: PaginationParams) {
        const { page, limit } = params;
        const offset = (page - 1) * limit;

        const logs = await db.query.activityLogs.findMany({
            orderBy: desc(activityLogs.createdAt),
            limit,
            offset,
            with: {
                user: true,
            },
        });

        return logs.map(log => ({
            action: log.action,
            user: log.user?.name || 'System',
            time: log.createdAt,
        }));
    }

    async getReports(status?: string) {
        const conditions = status ? [eq(contentReports.status, status)] : [];

        return db.query.contentReports.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            orderBy: desc(contentReports.createdAt),
            with: {
                reporter: true,
                reviewer: true,
            },
        });
    }

    async reviewReport(id: string, reviewerId: string, status: string) {
        const [report] = await db.update(contentReports)
            .set({
                status,
                reviewedBy: reviewerId,
                reviewedAt: new Date(),
            })
            .where(eq(contentReports.id, id))
            .returning();
        return report;
    }
}
