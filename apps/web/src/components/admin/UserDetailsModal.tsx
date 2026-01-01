import { useState, useEffect } from 'react';
import { adminApi, type AdminUser } from '../../lib/admin.api';

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export default function UserDetailsModal({ isOpen, onClose, userId }: UserDetailsModalProps) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            // Defer loading state to avoid synchronous setState warning
            const loadUser = async () => {
                setIsLoading(true);
                const res = await adminApi.getUserById(userId);
                if (res.success && res.data) {
                    setUser(res.data);
                }
                setIsLoading(false);
            };
            loadUser();
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-[#fdfdfd] rounded-xl shadow-2xl z-10 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900">User Details</h2>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100">
                        <span className="material-icons-outlined text-gray-400 text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                <div className="flex-1">
                                    <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full bg-gray-100 rounded"></div>
                                <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                    ) : user ? (
                        <div className="space-y-6">
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-2xl font-bold text-gray-600">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Role</span>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                        user.role === 'pro' ? 'bg-blue-100 text-blue-700' :
                                            user.role === 'banned' ? 'bg-red-100 text-red-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`flex items-center gap-1.5 text-sm font-medium ${user.role === 'banned' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${user.role === 'banned' ? 'bg-red-500' : 'bg-green-500'
                                            }`}></span>
                                        {user.role === 'banned' ? 'Banned' : 'Active'}
                                    </span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">User ID</span>
                                    <span className="text-sm font-mono text-gray-700 truncate max-w-[180px]">{user.id}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Created At</span>
                                    <span className="text-sm text-gray-700">{formatDate(user.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <span className="material-icons-outlined text-4xl mb-2 block">person_off</span>
                            User not found
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
