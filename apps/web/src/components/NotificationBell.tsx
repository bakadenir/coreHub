import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import type { Notification } from '../lib/notifications.api';
import { Bell, BellOff, CheckCircle, CalendarDays, Heart, X, ListTodo } from 'lucide-react';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        // Could navigate to related item here based on referenceType/referenceId
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'habit_reminder':
                return <CheckCircle size={18} />;
            case 'schedule_reminder':
                return <CalendarDays size={18} />;
            case 'todo_reminder':
                return <ListTodo size={18} />;
            case 'system':
                return <Heart size={18} />;
            default:
                return <Bell size={18} />;
        }
    };

    const isNotificationsPage = location.pathname === '/notifications';

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => !isNotificationsPage && setIsOpen(!isOpen)}
                className={`relative w-[38px] h-[38px] flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors ${isNotificationsPage ? 'cursor-default bg-gray-100' : 'cursor-pointer'}`}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-zinc-900 text-white text-xs font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-gray-900 hover:underline font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">
                                <BellOff size={40} className="mx-auto mb-2" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-gray-50/80' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-zinc-900">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'} text-gray-900 truncate`}>
                                                {notification.title}
                                            </p>
                                            {notification.message && (
                                                <p className="text-xs text-gray-500 truncate">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatTime(notification.createdAt)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            className="p-1 text-gray-300 hover:text-gray-500 rounded"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-100 p-2">
                        <Link
                            to="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block w-full py-2 text-center text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            See all notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

