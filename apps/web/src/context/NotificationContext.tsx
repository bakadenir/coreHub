/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { notificationsApi, type Notification } from '../lib/notifications.api';
import { useAuth } from './AuthContext';

// Extend Window interface for webkit prefix
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}

// Play notification sound using Web Audio API (short chime ~0.5s)
const playNotificationSound = () => {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();

        // Simple two-tone chime
        const playTone = (frequency: number, startTime: number, duration: number) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            // Envelope: quick attack, quick decay
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        const now = audioContext.currentTime;
        // Two gentle tones ascending
        playTone(800, now, 0.15);
        playTone(1000, now + 0.12, 0.2);

        // Cleanup after sound finishes
        setTimeout(() => audioContext.close(), 500);
    } catch (e) {
        console.warn('Could not play notification sound:', e);
    }
};

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

    // Use ref to track if initial fetch has been done
    const hasFetchedRef = useRef(false);
    // Use user.id for stable dependency instead of entire user object
    const userId = user?.id;

    const refreshNotifications = useCallback(async () => {
        if (!userId) return;

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
    }, [userId]);

    // Fetch notifications on mount and when user changes
    useEffect(() => {
        if (userId) {
            // Only fetch if we haven't fetched yet or user actually changed
            if (!hasFetchedRef.current) {
                hasFetchedRef.current = true;
                refreshNotifications();
            }
        } else {
            hasFetchedRef.current = false;
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [userId, refreshNotifications]);

    // Set up SSE connection for real-time updates
    useEffect(() => {
        if (!userId) return;

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        let eventSource: EventSource | null = null;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10; // Limit max reconnection attempts
        let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
        let isMounted = true;

        const connectSSE = async () => {
            // Don't attempt to connect if component unmounted or max attempts reached
            if (!isMounted) return;
            if (reconnectAttempts >= maxReconnectAttempts) {
                console.log('Max SSE reconnection attempts reached, stopping.');
                return;
            }

            try {
                // Get fresh token from Supabase
                const { supabase } = await import('../lib/supabaseClient');
                const { data: { session } } = await supabase.auth.getSession();

                if (!session?.access_token) {
                    console.log('No session for SSE, skipping connection');
                    return;
                }

                // Close existing connection before creating new one
                if (eventSource) {
                    eventSource.close();
                    eventSource = null;
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
                            // 🔔 Play notification sound!
                            playNotificationSound();
                        }
                    } catch (e) {
                        console.error('Error parsing SSE message:', e);
                    }
                };

                eventSource.onerror = () => {
                    eventSource?.close();
                    eventSource = null;
                    reconnectAttempts++;

                    // Reconnect with exponential backoff (max 60 seconds), with attempt limit
                    if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 60000);
                        console.log(`SSE disconnected. Attempt ${reconnectAttempts}/${maxReconnectAttempts}. Reconnecting in ${Math.round(delay / 1000)}s...`);
                        reconnectTimeout = setTimeout(connectSSE, delay);
                    }
                };
            } catch (e) {
                console.error('SSE connection error:', e);
                reconnectAttempts++;
                // Also retry on connection errors with limit
                if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                    const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), 60000);
                    reconnectTimeout = setTimeout(connectSSE, delay);
                }
            }
        };

        // Delay initial SSE connection slightly to avoid race with auth
        const initialTimeout = setTimeout(connectSSE, 1000);

        // Reconnect when tab becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isMounted) {
                if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
                    reconnectAttempts = 0; // Reset attempts on manual reconnect
                    connectSSE();
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            clearTimeout(initialTimeout);
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            eventSource?.close();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [userId]);

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
