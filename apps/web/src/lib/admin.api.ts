import { api } from './api';

export interface AdminStat {
    label: string;
    value: string;
    icon: string;
    color: string;
    change?: string;
}

export interface DashboardStats {
    cards: AdminStat[];
    adoption: { label: string; value: number; color: string }[];
    storage: { used: string; total: string; percent: number };
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    avatar?: string;
}
// ... (UserFilters interface stays here, moved down in file but omitted from this block for brevity if not changing)

// ...

export const adminApi = {
    // Get dashboard statistics
    getStats: () => api.get<DashboardStats>('/admin/stats'),

    // Get users with filtering and pagination
    getUsers: (filters?: UserFilters) => {
        const params = new URLSearchParams();
        if (filters?.page) params.set('page', String(filters.page));
        if (filters?.limit) params.set('limit', String(filters.limit));
        if (filters?.search) params.set('search', filters.search);
        if (filters?.role) params.set('role', filters.role);
        if (filters?.status) params.set('status', filters.status);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get<UsersResponse>(`/admin/users${query}`);
    },

    // Update user role
    updateUserRole: (id: string, role: string) =>
        api.patch<AdminUser>(`/admin/users/${id}/role`, { role }),

    // Ban/unban user
    updateUserStatus: (id: string, banned: boolean) =>
        api.patch<AdminUser>(`/admin/users/${id}/status`, { banned }),

    // Get user by ID
    getUserById: (id: string) =>
        api.get<AdminUser>(`/admin/users/${id}`),

    // Delete user permanently
    deleteUser: (id: string) =>
        api.delete(`/admin/users/${id}`),

    // Get activity logs
    getActivityLogs: (page = 1, limit = 50) =>
        api.get<ActivityLog[]>(`/admin/activity-logs?page=${page}&limit=${limit}`),

    // Get content reports
    getReports: (status?: string) => {
        const query = status ? `?status=${status}` : '';
        return api.get(`/admin/reports${query}`);
    },

    // Review a report
    reviewReport: (id: string, status: string) =>
        api.patch(`/admin/reports/${id}`, { status }),
};
