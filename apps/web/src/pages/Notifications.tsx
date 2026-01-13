import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { NotificationListSkeleton } from '../components/Skeleton';
import { ArrowLeft, Bell, Check, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
// Removed unused Notification type import
import { notificationsApi } from '../lib';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
    const { showToast } = useToast();
    const { notifications, unreadCount, refreshNotifications: refetch, isLoading } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [isMarkingAll, setIsMarkingAll] = useState(false);
    const [displayCount, setDisplayCount] = useState(5);

    // Refresh on mount only (not on refetch change)
    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    // Mark single as read
    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationsApi.markAsRead(id);
            refetch();
        } catch {
            showToast('Failed to mark as read', 'error');
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async () => {
        setIsMarkingAll(true);
        try {
            await notificationsApi.markAllAsRead();
            refetch();
            showToast('All notifications marked as read', 'success');
        } catch {
            showToast('Failed to mark all as read', 'error');
        } finally {
            setIsMarkingAll(false);
        }
    };

    // Delete notification
    const handleDelete = async (id: string) => {
        try {
            await notificationsApi.delete(id);
            refetch();
            showToast('Notification deleted', 'success');
        } catch {
            showToast('Failed to delete notification', 'error');
        }
    };

    // Format relative time
    const formatRelativeTime = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        if (diffMs < 0 || isNaN(diffMs)) return date.toLocaleDateString();

        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    // Get icon based on notification type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'reminder':
            case 'habit_reminder':
            case 'schedule_reminder':
                return <Bell size={16} className="text-zinc-900" />;
            case 'achievement':
                return <Check size={16} className="text-zinc-900" />;
            default:
                return <Bell size={16} className="text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Base bg */}
                <div className="absolute inset-0 bg-gray-50/50"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Gradient Fades */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            <Header subtitle="Notifications" />

            {/* Main Content */}
            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow relative z-10">
                {/* Back to Home */}
                <div className="mb-8">
                    <Link
                        to="/home"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                </div>

                {/* Page Title */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Notifications</h1>
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-zinc-900 text-white text-sm font-medium rounded-full">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAll}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isMarkingAll ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <CheckCheck size={16} />
                            )}
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                            ? 'bg-zinc-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                            ? 'bg-zinc-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Unread
                    </button>
                </div>

                {/* Notifications List */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-4">
                            <NotificationListSkeleton count={5} />
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Bell size={28} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500 font-medium">
                                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                {filter === 'unread' ? 'You\'re all caught up!' : 'Check back later for updates'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredNotifications.slice(0, displayCount).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`group flex gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${!notification.isRead ? 'bg-gray-50/50' : ''
                                        }`}
                                    onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                                >
                                    {/* Icon */}
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[15px] text-gray-900 leading-snug">
                                            <span className="font-semibold">{notification.title}</span>
                                        </p>
                                        {notification.message && (
                                            <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatRelativeTime(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0 pt-2">
                                            <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"></div>
                                        </div>
                                    )}

                                    {/* Delete Button (on hover) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(notification.id);
                                        }}
                                        className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded-lg transition-all text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="flex flex-col items-center gap-4 mt-6">
                    {filteredNotifications.length > displayCount && (
                        <button
                            onClick={() => setDisplayCount(prev => prev + 5)}
                            className="text-sm font-medium text-gray-900 hover:text-black hover:underline transition-colors"
                        >
                            See previous notifications
                        </button>
                    )}
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved.</p>
            </footer>
        </div>
    );
}
