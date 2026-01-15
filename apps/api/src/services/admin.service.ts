import { supabase } from '../config/supabase';

export interface UserFilters {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
    page: number;
    limit: number;
}

export class AdminService {
    async logActivity(adminId: string, action: string, details?: Record<string, unknown>) {
        try {
            await supabase.from('activity_logs').insert({
                user_id: adminId,
                action,
                details: details || {},
            });
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    }

    private async _getAllUsers() {
        let allUsers: any[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await supabase.auth.admin.listUsers({
                page,
                perPage: 1000,
            });
            if (error) throw error;
            allUsers = [...allUsers, ...data.users];
            hasMore = data.users.length === 1000;
            page++;
        }
        return allUsers;
    }

    async getStats() {
        // Use auth.admin.listUsers to get the total count of registered users
        const { data: authData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        const userCount = authData && 'total' in authData ? (authData as any).total : 0;

        const { count: habitCount } = await supabase
            .from('habits')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        const { count: noteCount } = await supabase
            .from('notes')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        const { count: linkCount } = await supabase
            .from('links')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        const { count: scheduleCount } = await supabase
            .from('schedule_events')
            .select('*', { count: 'exact', head: true })
            .is('deleted_at', null);

        const safeUserCount = userCount || 1; // Prevent division by zero

        // Calculate rough "adoption" percentages (capped at 100)
        // This is a proxy metric: Avg items per user * 20 (so 5 items = 100%)
        const calculateAdoption = (count: number | null) => Math.min(Math.round(((count || 0) / safeUserCount) * 20), 100);

        // --- Daily Analytics ---
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        // New Users Today
        const { count: newUsersToday } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayIso);

        // Active Users Today (Distinct users in activity_logs)
        // Note: Supabase doesn't support 'distinct' in simple count queries easily via JS client without RPC.
        // For now, we'll fetch small amount of data or use a workaround. 
        // Better approach for scale: Create a DB function `get_daily_active_users`.
        // Current workaround: Fetch logs from today and count unique user_ids in memory (limit to 1000 for perf).
        const { data: recentLogs } = await supabase
            .from('activity_logs')
            .select('user_id')
            .gte('created_at', todayIso)
            .limit(1000); // Sample size limit

        const activeUsersToday = recentLogs ? new Set(recentLogs.map(l => l.user_id)).size : 0;


        // Deadactive Users (Inactive > 30 days)
        // Fetch all users to check last_sign_in_at
        const allUsers = await this._getAllUsers();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deadactiveCount = allUsers.filter((u: any) => {
            if (!u.last_sign_in_at) return true; // Never signed in
            return new Date(u.last_sign_in_at) < thirtyDaysAgo;
        }).length;

        return {
            cards: [
                { label: 'Total Users', value: String(userCount || 0), icon: 'people', color: 'bg-blue-500' },
                { label: 'New Today', value: `+${newUsersToday || 0}`, icon: 'person_add', color: 'bg-green-500' },
                { label: 'Active Today', value: String(activeUsersToday), icon: 'trending_up', color: 'bg-orange-500' },
                { label: 'Deadactive', value: String(deadactiveCount), icon: 'person_off', color: 'bg-zinc-500' },
            ],
            adoption: [
                { label: 'Habit Tracker', value: calculateAdoption(habitCount), color: 'bg-green-500' },
                { label: 'Notes', value: calculateAdoption(noteCount), color: 'bg-yellow-500' },
                { label: 'Link Manager', value: calculateAdoption(linkCount), color: 'bg-blue-500' },
                { label: 'Schedule', value: calculateAdoption(scheduleCount), color: 'bg-purple-500' }
            ],
            storage: {
                used: '452 MB', // Placeholder/Estimated
                total: '2 GB',
                percent: 22
            }
        };
    }

    async getUsers(filters: UserFilters) {
        const { page, limit, search, role, sortBy, sortOrder } = filters;
        const offset = (page - 1) * limit;

        // Strategy 1: If sorting is required, we MUST fetch all users to sort correctly
        // because Supabase ListUsers API doesn't support sorting by last_sign_in_at.
        if (sortBy) {

            // Fetch all users to check last_sign_in_at
            const allUsers = await this._getAllUsers();

            let mappedUsers = allUsers.map(u => ({
                id: u.id,
                name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown',
                email: u.email || '',
                role: u.user_metadata?.role || 'user',
                status: 'Active',
                createdAt: u.created_at,
                avatar: u.user_metadata?.image || null,
                lastSignInAt: u.last_sign_in_at,
            }));

            // Filter (in memory)
            if (role) {
                mappedUsers = mappedUsers.filter(u => u.role === role);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                mappedUsers = mappedUsers.filter(u =>
                    u.name.toLowerCase().includes(searchLower) ||
                    u.email.toLowerCase().includes(searchLower)
                );
            }

            // Sort
            mappedUsers.sort((a, b) => {
                let timeA = 0;
                let timeB = 0;

                if (sortBy === 'created_at') {
                    timeA = new Date(a.createdAt).getTime();
                    timeB = new Date(b.createdAt).getTime();
                } else if (sortBy === 'last_sign_in_at') {
                    timeA = a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0;
                    timeB = b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0;
                }

                if (sortOrder === 'asc') {
                    // Ascending: 0 (Never) -> Oldest -> Newest
                    return timeA - timeB;
                } else {
                    // Descending: Newest -> Oldest -> 0 (Never)
                    if (timeA === 0) return 1; // 0 goes to end
                    if (timeB === 0) return -1;
                    return timeB - timeA;
                }
            });

            // Paginate the sorted result
            const paginatedUsers = mappedUsers.slice(offset, offset + limit);

            return {
                users: paginatedUsers,
                pagination: {
                    page,
                    limit,
                    total: mappedUsers.length,
                    hasMore: offset + limit < mappedUsers.length,
                },
            };
        }

        // Strategy 2: Default Pagination (Efficient for standard view)
        const { data: authData, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: limit || 50,
        });

        if (error) throw error;

        let users = authData.users.map(u => ({
            id: u.id,
            name: u.user_metadata?.name || u.email?.split('@')[0] || 'Unknown',
            email: u.email || '',
            role: u.user_metadata?.role || 'user',
            status: 'Active',
            createdAt: u.created_at,
            avatar: u.user_metadata?.image || null,
            lastSignInAt: u.last_sign_in_at,
        }));

        // Filter by role (Note: This filters the PAGE, which is imperfect but standard for this API without search index)
        if (role) {
            users = users.filter(u => u.role === role);
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(u =>
                u.name.toLowerCase().includes(searchLower) ||
                u.email.toLowerCase().includes(searchLower)
            );
        }

        return {
            users: users.slice(0, limit), // Slice handled by array map above mostly, but ensure limit
            pagination: {
                page,
                limit,
                total: authData.total, // Total from API
                hasMore: offset + limit < authData.total,
            },
        };
    }

    async updateUserRole(id: string, role: string) {
        const { data, error } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: { role },
        });
        if (error) throw error;
        return data.user;
    }

    async getUserById(id: string) {
        const { data, error } = await supabase.auth.admin.getUserById(id);
        if (error) throw error;
        if (!data.user) return null;

        return {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
            email: data.user.email,
            emailVerified: data.user.email_confirmed_at ? true : false,
            role: data.user.user_metadata?.role || 'user',
            image: data.user.user_metadata?.image,
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at,
        };
    }

    async setUserBanned(id: string, banned: boolean) {
        const { data, error } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: { role: banned ? 'banned' : 'user' },
        });
        if (error) throw error;
        return data.user;
    }

    async deleteUser(id: string) {
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) throw error;
        return { id };
    }

    async getActivityLogs(params: PaginationParams) {
        const { page, limit } = params;
        const offset = (page - 1) * limit;

        const { data, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        return (data || []).map(log => ({
            action: log.action,
            user: log.user_name || 'System',
            time: log.created_at,
        }));
    }

    async getReports(status?: string) {
        let query = supabase.from('content_reports').select('*');

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async reviewReport(id: string, reviewerId: string, status: string) {
        const { data, error } = await supabase
            .from('content_reports')
            .update({
                status,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
