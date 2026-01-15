import { useState, useEffect, useCallback } from 'react';
import { adminApi, type AdminUser } from '../../lib/admin.api';
import { useToast } from '../../context/ToastContext';
import ActionMenu from '../ActionMenu';
import ConfirmDialog from '../ConfirmDialog';
import UserDetailsModal from './UserDetailsModal';

export default function UserManagement() {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, hasMore: false });
    const [sortBy, setSortBy] = useState<'created_at' | 'last_sign_in_at'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'unban' | 'role' | 'delete'; user: AdminUser; role?: string } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // User details modal
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await adminApi.getUsers({
                page,
                limit: 20,
                search: searchTerm || undefined,
                role: filterRole || undefined,
                sortBy,
                sortOrder,
            });
            if (result.success && result.data) {
                setUsers(result.data.users);
                setPagination({ total: result.data.pagination.total, hasMore: result.data.pagination.hasMore });
            }
        } catch {
            showToast('Failed to fetch users', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [page, searchTerm, filterRole, sortBy, sortOrder, showToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleViewDetails = (user: AdminUser) => {
        setSelectedUserId(user.id);
        setDetailsOpen(true);
    };

    const handleRoleChange = (user: AdminUser, newRole: string) => {
        setConfirmAction({ type: 'role', user, role: newRole });
        setConfirmOpen(true);
    };

    const handleBanToggle = (user: AdminUser) => {
        const isBanned = user.role === 'banned';
        setConfirmAction({ type: isBanned ? 'unban' : 'ban', user });
        setConfirmOpen(true);
    };

    const handleDelete = (user: AdminUser) => {
        setConfirmAction({ type: 'delete', user });
        setConfirmOpen(true);
    };

    const handleConfirm = async () => {
        if (!confirmAction) return;

        setIsProcessing(true);
        try {
            if (confirmAction.type === 'role' && confirmAction.role) {
                const result = await adminApi.updateUserRole(confirmAction.user.id, confirmAction.role);
                if (result.success) {
                    showToast(`Role updated to ${confirmAction.role}`, 'success');
                    fetchUsers();
                } else {
                    showToast('Failed to update role', 'error');
                }
            } else if (confirmAction.type === 'ban' || confirmAction.type === 'unban') {
                const result = await adminApi.updateUserStatus(confirmAction.user.id, confirmAction.type === 'ban');
                if (result.success) {
                    showToast(confirmAction.type === 'ban' ? 'User banned' : 'User unbanned', 'success');
                    fetchUsers();
                } else {
                    showToast('Failed to update status', 'error');
                }
            } else if (confirmAction.type === 'delete') {
                const result = await adminApi.deleteUser(confirmAction.user.id);
                if (result.success) {
                    showToast('User deleted permanently', 'success');
                    fetchUsers();
                } else {
                    showToast('Failed to delete user', 'error');
                }
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsProcessing(false);
            setConfirmOpen(false);
            setConfirmAction(null);
        }
    };

    const getActionMenuItems = (user: AdminUser) => {
        const isBanned = user.role === 'banned';
        return [
            {
                label: 'View Details',
                icon: 'visibility',
                onClick: () => handleViewDetails(user),
            },
            {
                label: 'Make Admin',
                icon: 'admin_panel_settings',
                onClick: () => handleRoleChange(user, 'admin'),
                disabled: user.role === 'admin',
            },
            {
                label: 'Make Pro',
                icon: 'workspace_premium',
                onClick: () => handleRoleChange(user, 'pro'),
                disabled: user.role === 'pro',
            },
            {
                label: 'Make User',
                icon: 'person',
                onClick: () => handleRoleChange(user, 'user'),
                disabled: user.role === 'user' || isBanned,
            },
            {
                label: isBanned ? 'Unban User' : 'Ban User',
                icon: isBanned ? 'check_circle' : 'block',
                onClick: () => handleBanToggle(user),
                variant: isBanned ? 'default' as const : 'danger' as const,
            },
            {
                label: 'Delete User',
                icon: 'delete',
                onClick: () => handleDelete(user),
                variant: 'danger' as const,
            },
        ];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getConfirmDialogProps = () => {
        if (!confirmAction) return { title: '', message: '', confirmLabel: '', variant: 'warning' as const };

        switch (confirmAction.type) {
            case 'ban':
                return {
                    title: 'Ban User',
                    message: `Are you sure you want to ban ${confirmAction.user.name}? They will not be able to access the platform.`,
                    confirmLabel: 'Ban User',
                    variant: 'danger' as const,
                };
            case 'unban':
                return {
                    title: 'Unban User',
                    message: `Are you sure you want to unban ${confirmAction.user.name}?`,
                    confirmLabel: 'Unban',
                    variant: 'warning' as const,
                };
            case 'delete':
                return {
                    title: 'Delete User Permanently',
                    message: `Are you sure you want to PERMANENTLY delete ${confirmAction.user.name}? This cannot be undone and will remove all their data.`,
                    confirmLabel: 'Delete Forever',
                    variant: 'danger' as const,
                };
            case 'role':
                return {
                    title: 'Change Role',
                    message: `Change ${confirmAction.user.name}'s role to ${confirmAction.role}?`,
                    confirmLabel: 'Change Role',
                    variant: 'warning' as const,
                };
        }
    };

    const confirmProps = getConfirmDialogProps();

    return (
        <div className="space-y-6 animate-fade-in-up">
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => { setConfirmOpen(false); setConfirmAction(null); }}
                onConfirm={handleConfirm}
                title={confirmProps.title}
                message={confirmProps.message}
                confirmLabel={confirmProps.confirmLabel}
                variant={confirmProps.variant}
                isLoading={isProcessing}
            />
            <UserDetailsModal
                isOpen={detailsOpen}
                onClose={() => { setDetailsOpen(false); setSelectedUserId(null); }}
                userId={selectedUserId}
            />

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-zinc-900 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-zinc-900 bg-[#fdfdfd]"
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
                    >
                        <option value="created_at">Joined Date</option>
                        <option value="last_sign_in_at">Last Active</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center min-w-[42px]"
                        title={sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
                    >
                        <span className="material-icons-outlined text-gray-500">
                            {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                    </button>
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-zinc-900 bg-[#fdfdfd]"
                        value={filterRole}
                        onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
                    >
                        <option value="">All Roles</option>
                        <option value="user">User</option>
                        <option value="pro">Pro</option>
                        <option value="admin">Admin</option>
                        <option value="banned">Banned</option>
                    </select>
                </div>
            </div>

            <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Active</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-200 rounded ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <span className="material-icons-outlined text-4xl mb-2 block">person_off</span>
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const isBanned = user.role === 'banned';
                                    return (
                                        <tr key={user.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${isBanned ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                                                        }`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm font-semibold ${isBanned ? 'text-red-700 line-through' : 'text-gray-900'}`}>{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                    user.role === 'pro' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        user.role === 'banned' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            'bg-gray-50 text-gray-700 border-gray-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isBanned ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isBanned ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                                    {isBanned ? 'Banned' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-gray-500">
                                                {user.lastSignInAt ? (
                                                    <span title={new Date(user.lastSignInAt).toLocaleString()}>
                                                        {formatDate(user.lastSignInAt)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Never</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ActionMenu items={getActionMenuItems(user)} />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                    <span>Showing {users.length} of {pagination.total} users</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-200 rounded bg-[#fdfdfd] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={!pagination.hasMore}
                            className="px-3 py-1 border border-gray-200 rounded bg-[#fdfdfd] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
