import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { notificationsApi, type Notification } from '../lib/notifications.api';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (!user) return;

        setIsLoading(true);
        try {
            const [notifResult, countResult] = await Promise.all([
                notificationsApi.getAll(20, false),
                notificationsApi.getUnreadCount(),
            ]);

            if (notifResult.success && notifResult.data) {
                setNotifications(notifResult.data);
            }
            if (countResult.success && countResult.data) {
                setUnreadCount(countResult.data.count);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        if (user) {
            refreshNotifications();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, refreshNotifications]);

    // Set up SSE connection for real-time updates
    useEffect(() => {
        if (!user) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        let eventSource: EventSource | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 3;
        let isMounted = true;

        const connectSSE = async () => {
            // Don't attempt to connect if component unmounted or max attempts reached
            if (!isMounted || reconnectAttempts >= maxReconnectAttempts) return;

            try {
                // Get fresh token from Supabase
                const { supabase } = await import('../lib/supabaseClient');
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    console.log('No session for SSE, skipping connection');
                    return;
                }

                // Pass token as query parameter since EventSource doesn't support headers
                const url = `${apiUrl}/api/sse/notifications?token=${session.access_token}`;
                eventSource = new EventSource(url);

                eventSource.onopen = () => {
                    reconnectAttempts = 0; // Reset on successful connection
                };

                eventSource.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'unread_count') {
                            setUnreadCount(data.count);
                        } else if (data.type === 'new_notification') {
                            setNotifications(prev => [data.notification, ...prev]);
                            setUnreadCount(prev => prev + 1);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE message:', e);
                    }
                };

                eventSource.onerror = () => {
                    eventSource?.close();
                    reconnectAttempts++;

                    // Only reconnect if mounted and not exceeded max attempts
                    if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(5000 * reconnectAttempts, 30000);
                        setTimeout(connectSSE, delay);
                    }
                };
            } catch (e) {
                console.error('SSE connection error:', e);
            }
        };

        connectSSE();

        return () => {
            isMounted = false;
            eventSource?.close();
        };
    }, [user]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const result = await notificationsApi.markAsRead(id);
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => n.id === id ? { ...n, isRead: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const result = await notificationsApi.markAllAsRead();
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const result = await notificationsApi.delete(id);
            if (result.success) {
                const notification = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                if (notification && !notification.isRead) {
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                refreshNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
