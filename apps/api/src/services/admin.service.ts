import { supabase } from '../config/supabase';

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

    async getStats() {
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

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

        return [
            { label: 'Total Users', value: String(userCount || 0), icon: 'people', color: 'bg-blue-500' },
            { label: 'Active Habits', value: String(habitCount || 0), icon: 'check_circle', color: 'bg-green-500' },
            { label: 'Total Notes', value: String(noteCount || 0), icon: 'description', color: 'bg-purple-500' },
            { label: 'Total Links', value: String(linkCount || 0), icon: 'link', color: 'bg-orange-500' },
        ];
    }

    async getUsers(filters: UserFilters) {
        const { page, limit, search, role } = filters;
        const offset = (page - 1) * limit;

        // Get users from Supabase Auth
        const { data: authData, error } = await supabase.auth.admin.listUsers({
            page,
            perPage: limit,
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
        }));

        // Filter by role
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
            users: users.slice(offset, offset + limit),
            pagination: {
                page,
                limit,
                total: users.length,
                hasMore: offset + limit < users.length,
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
