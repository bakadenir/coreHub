import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi, type SearchResult } from '../lib/search.api';
import { renderIcon } from '../lib/iconMap';
import { Search, RefreshCw, SearchX, LayoutDashboard, Settings, Sparkles, FileText, Link as LinkIcon, CalendarDays, CornerDownLeft, ListTodo } from 'lucide-react';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

// Static navigation items for quick access
interface NavItem {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    path: string;
    type: 'navigation';
    keywords: string[];
}

const navigationItems: NavItem[] = [
    // Main Pages
    { id: 'nav-home', title: 'Home', subtitle: 'Dashboard & Overview', icon: 'dashboard', path: '/home', type: 'navigation', keywords: ['home', 'dashboard', 'overview', 'main', 'beranda'] },
    { id: 'nav-habits', title: 'Habits', subtitle: 'Track your daily habits', icon: 'check_circle', path: '/habits', type: 'navigation', keywords: ['habits', 'track', 'daily', 'routine', 'kebiasaan'] },
    { id: 'nav-schedule', title: 'Schedule', subtitle: 'Calendar & Events', icon: 'calendar_today', path: '/schedule', type: 'navigation', keywords: ['schedule', 'calendar', 'events', 'appointments', 'jadwal'] },
    { id: 'nav-notes', title: 'Notes', subtitle: 'Your personal notes', icon: 'description', path: '/notes', type: 'navigation', keywords: ['notes', 'write', 'text', 'document', 'catatan'] },
    { id: 'nav-links', title: 'Links', subtitle: 'Saved bookmarks', icon: 'link', path: '/links', type: 'navigation', keywords: ['links', 'bookmarks', 'urls', 'websites', 'tautan'] },

    // Profile & Settings
    { id: 'nav-profile', title: 'My Profile', subtitle: 'View your profile', icon: 'person', path: '/profile', type: 'navigation', keywords: ['profile', 'account', 'user', 'me', 'profil'] },
    { id: 'nav-settings', title: 'Settings', subtitle: 'Account settings', icon: 'settings', path: '/settings', type: 'navigation', keywords: ['settings', 'preferences', 'configuration', 'pengaturan'] },
    { id: 'nav-profile-settings', title: 'Profile Settings', subtitle: 'Update name, bio, avatar', icon: 'manage_accounts', path: '/settings', type: 'navigation', keywords: ['profile settings', 'name', 'bio', 'avatar', 'username', 'location', 'foto profil'] },
    { id: 'nav-security', title: 'Security & Login', subtitle: 'Password & authentication', icon: 'security', path: '/settings', type: 'navigation', keywords: ['security', 'password', 'login', 'authentication', 'change password', 'keamanan', 'kata sandi'] },
    { id: 'nav-notifications', title: 'Notification Settings', subtitle: 'Manage reminders', icon: 'notifications', path: '/settings', type: 'navigation', keywords: ['notifications', 'reminders', 'alerts', 'push', 'notifikasi'] },
    { id: 'nav-delete-account', title: 'Delete Account', subtitle: 'Remove your account permanently', icon: 'delete_forever', path: '/settings', type: 'navigation', keywords: ['delete account', 'remove account', 'hapus akun', 'account actions'] },

    // Donate
    { id: 'nav-donate', title: 'Donate', subtitle: 'Support the developer', icon: 'volunteer_activism', path: '/donate', type: 'navigation', keywords: ['donate', 'support', 'contribute', 'coffee', 'donasi'] },
    { id: 'nav-feedback', title: 'Feedback', subtitle: 'Send feedback & suggestions', icon: 'feedback', path: '/donate', type: 'navigation', keywords: ['feedback', 'suggestion', 'report', 'bug', 'feature request', 'saran', 'masukan'] },

    // Dashboard Features
    { id: 'nav-pomodoro', title: 'Pomodoro Timer', subtitle: 'Focus timer on dashboard', icon: 'timer', path: '/home', type: 'navigation', keywords: ['pomodoro', 'timer', 'focus', 'productivity', 'time management', 'waktu'] },
    { id: 'nav-quick-actions', title: 'Quick Actions', subtitle: 'Add habits, notes, links quickly', icon: 'add_circle', path: '/home', type: 'navigation', keywords: ['quick actions', 'add', 'create', 'new', 'tambah'] },
    { id: 'nav-activity', title: 'Your Activity', subtitle: 'Recent activities overview', icon: 'insights', path: '/home', type: 'navigation', keywords: ['activity', 'recent', 'overview', 'aktivitas'] },
    { id: 'nav-todos', title: 'Todos', subtitle: 'Your todo list', icon: 'checklist', path: '/todos', type: 'navigation', keywords: ['todo', 'todos', 'task', 'tasks', 'checklist', 'tugas'] },
    { id: 'nav-clock', title: 'Clock Widget', subtitle: 'Time display on dashboard', icon: 'schedule', path: '/home', type: 'navigation', keywords: ['clock', 'time', 'jam', 'widget'] },

    // Specific Features
    { id: 'nav-habit-reminders', title: 'Habit Reminders', subtitle: 'Get notified about habits', icon: 'alarm', path: '/settings', type: 'navigation', keywords: ['habit reminders', 'habit notifications', 'pengingat kebiasaan'] },
    { id: 'nav-schedule-reminders', title: 'Schedule Reminders', subtitle: 'Event notifications', icon: 'event_available', path: '/settings', type: 'navigation', keywords: ['schedule reminders', 'event notifications', 'pengingat jadwal'] },
    { id: 'nav-push-notifications', title: 'Push Notifications', subtitle: 'Browser notifications', icon: 'notifications_active', path: '/settings', type: 'navigation', keywords: ['push notifications', 'browser notifications', 'desktop notifications'] },

    // Legal
    { id: 'nav-privacy', title: 'Privacy Policy', subtitle: 'Our privacy policy', icon: 'privacy_tip', path: '/privacy', type: 'navigation', keywords: ['privacy', 'policy', 'data', 'privasi', 'kebijakan'] },
    { id: 'nav-terms', title: 'Terms of Service', subtitle: 'Terms and conditions', icon: 'gavel', path: '/terms', type: 'navigation', keywords: ['terms', 'service', 'conditions', 'syarat', 'ketentuan'] },
];

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [apiResults, setApiResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Filter navigation items based on query
    const navResults = useMemo((): NavItem[] => {
        if (!query.trim() || query.length < 2) return [];
        const q = query.toLowerCase();
        return navigationItems.filter(item =>
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q) ||
            item.keywords.some(kw => kw.includes(q))
        ).map(item => ({
            id: item.id,
            type: item.type,
            title: item.title,
            subtitle: item.subtitle,
            icon: item.icon,
            path: item.path,
            keywords: item.keywords,
        }));
    }, [query]);

    // Combine nav results with API results
    const results = useMemo(() => {
        return [...navResults, ...apiResults];
    }, [navResults, apiResults]);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setApiResults([]);
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Debounced API search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setApiResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const result = await searchApi.search(query);
                if (result.success && result.data) {
                    setApiResults(result.data);
                }
            } catch {
                console.error('Search failed');
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [results.length]);

    // Handle selecting a result
    const handleSelect = useCallback((result: SearchResult | NavItem) => {
        if ('path' in result) {
            // Navigation item
            navigate(result.path);
        } else {
            // Content item
            const routes: Record<string, string> = {
                habit: '/habits',
                note: '/notes',
                link: '/links',
                schedule: '/schedule',
                todo: '/todos',
            };
            navigate(routes[result.type] || '/home');
        }
        onClose();
    }, [navigate, onClose]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, selectedIndex, onClose, handleSelect]);

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            habit: 'Habit',
            note: 'Note',
            link: 'Link',
            schedule: 'Event',
            todo: 'Todo',
            navigation: 'Page',
        };
        return labels[type] || type;
    };

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            habit: 'bg-green-100 text-green-700',
            note: 'bg-blue-100 text-blue-700',
            link: 'bg-purple-100 text-purple-700',
            schedule: 'bg-orange-100 text-orange-700',
            todo: 'bg-amber-100 text-amber-700',
            navigation: 'bg-gray-200 text-gray-700',
        };
        return colors[type] || 'bg-gray-100 text-gray-700';
    };

    // Handle escape globally
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-200"
                onClick={onClose}
            />

            {/* Search Modal */}
            <div className={`relative w-full max-w-2xl mx-4 bg-[#fdfdfd] rounded-xl shadow-2xl overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'}`}>
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <Search size={20} className="text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search anything... pages, settings, content"
                        className="flex-1 text-lg text-text-primary placeholder-gray-400 outline-none bg-transparent"
                    />
                    {isLoading && (
                        <RefreshCw size={20} className="text-gray-400 animate-spin" />
                    )}
                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-100 rounded border border-gray-200">
                        ESC
                    </kbd>
                </div>

                {/* Results */}
                <div className="max-h-[400px] overflow-y-auto">
                    {query.length >= 2 && results.length === 0 && !isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <SearchX size={48} className="mb-3" />
                            <p className="text-sm">No results found for "{query}"</p>
                        </div>
                    )}

                    {query.length < 2 && !isLoading && (
                        <div className="p-6">
                            <p className="text-sm text-gray-400 text-center">Type at least 2 characters to search</p>
                            <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <LayoutDashboard size={14} />
                                    Pages
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <Settings size={14} />
                                    Settings
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <Sparkles size={14} />
                                    Habits
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <FileText size={14} />
                                    Notes
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <LinkIcon size={14} />
                                    Links
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <CalendarDays size={14} />
                                    Events
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-500">
                                    <ListTodo size={14} />
                                    Todos
                                </span>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <ul className="py-2">
                            {results.map((result, index) => (
                                <li key={`${result.type}-${result.id}`}>
                                    <button
                                        onClick={() => handleSelect(result)}
                                        className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${index === selectedIndex
                                            ? 'bg-gray-100'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                            {renderIcon(result.icon, { size: 18, className: 'text-gray-600' })}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate">
                                                {result.title}
                                            </p>
                                            {result.subtitle && (
                                                <p className="text-xs text-gray-400 truncate">
                                                    {result.subtitle}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getTypeColor(result.type)}`}>
                                            {getTypeLabel(result.type)}
                                        </span>
                                        {index === selectedIndex && (
                                            <CornerDownLeft size={16} className="text-gray-400" />
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-xs">↑</kbd>
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-xs">↓</kbd>
                            navigate
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-xs">↵</kbd>
                            select
                        </span>
                    </div>
                    <span className="flex items-center gap-1">
                        Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded-md text-xs mx-1">/</kbd> to search anywhere
                    </span>
                </div>
            </div>
        </div>
    );
}
