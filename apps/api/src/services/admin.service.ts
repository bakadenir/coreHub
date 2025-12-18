import { db } from '../config/database';
import { user, habits, notes, links, activityLogs, contentReports } from '../db/schema';
import { eq, desc, count, isNull, and, ilike, or } from 'drizzle-orm';

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
    // Helper to log admin activities
    async logActivity(adminId: string, action: string, details?: Record<string, unknown>) {
        try {
            await db.insert(activityLogs).values({
                userId: adminId,
                action,
                details: details || {},
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    async getStats() {
        // Count from 'user' table (better-auth)
        const [userStats] = await db.select({ count: count() }).from(user);
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
        const { page, limit, search, role } = filters;
        const offset = (page - 1) * limit;

        // Build conditions for 'user' table (better-auth)
        const conditions = [];

        if (role) {
            conditions.push(eq(user.role, role));
        }

        if (search) {
            conditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )
            );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const allUsers = await db
            .select()
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limit)
            .offset(offset);

        const [total] = await db.select({ count: count() }).from(user).where(whereClause);

        return {
            users: allUsers.map(u => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role || 'user',
                status: 'Active', // Better-auth doesn't have deletedAt
                createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
                avatar: u.image,
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
        const [updatedUser] = await db.update(user)
            .set({ role, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async getUserById(id: string) {
        const [foundUser] = await db.select().from(user).where(eq(user.id, id));
        if (!foundUser) return null;

        return {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            emailVerified: foundUser.emailVerified,
            role: foundUser.role || 'user',
            image: foundUser.image,
            createdAt: foundUser.createdAt?.toISOString(),
            updatedAt: foundUser.updatedAt?.toISOString(),
        };
    }

    async setUserBanned(id: string, banned: boolean) {
        // For ban, we'll update a custom 'banned' field or use role-based approach
        // Since better-auth schema doesn't have banned field, we change role to 'banned'
        const newRole = banned ? 'banned' : 'user';
        const [updatedUser] = await db.update(user)
            .set({ role: newRole, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    async deleteUser(id: string) {
        // Delete user and associated data
        const [deletedUser] = await db.delete(user)
            .where(eq(user.id, id))
            .returning();
        return deletedUser;
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
