import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import { usersApi } from '../lib';

interface HeaderProps {
    subtitle?: string;
}

export default function Header({ subtitle = 'Productivity, Simplified' }: HeaderProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, signOut } = useAuth();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    // Fetch user data from API
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await usersApi.getMe();
                if (result.success && result.data) {
                    const userData = result.data as any;
                    setUserAvatar(userData.image || null);
                    setUserName(userData.name || null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    // Global keyboard shortcut for search (Cmd+K, Ctrl+K, or /)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
            // "/" key (but not when typing in an input)
            if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        await signOut();
        showToast('Logout successful', 'success');
        navigate('/');
        window.scrollTo(0, 0);  // Scroll to top after logout
    };

    // Helper to construct full URL for uploaded files
    const getFullAvatarUrl = (imageUrl: string | null | undefined): string => {
        if (!imageUrl || imageUrl.trim() === '') return '';
        if (imageUrl.startsWith('http')) return imageUrl;
        if (imageUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            return `${apiUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    const displayName = userName || user?.name || 'User';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=000&color=fff`;
    const fullAvatarUrl = getFullAvatarUrl(userAvatar);
    const displayAvatar = (fullAvatarUrl && fullAvatarUrl.trim() !== '') ? fullAvatarUrl : defaultAvatar;

    return (
        <>
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
                                <span className="material-icons-outlined text-[20px]">hub</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">
                                coreHub
                            </h1>
                        </div>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">
                            {subtitle}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-500 border border-gray-200 min-w-[200px]"
                        >
                            <span className="material-icons-outlined text-base opacity-70">search</span>
                            <span className="font-normal tracking-normal">Type <kbd className="px-1.5 py-0.5 bg-gray-100 rounded-md text-[11px] font-medium border border-gray-200 mx-1">/</kbd> to search</span>
                        </button>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <span className="material-icons-outlined text-gray-500 text-2xl">search</span>
                        </button>

                        {/* Notification Dropdown */}
                        <div className="relative group">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors relative">
                                <span className="material-icons-outlined text-gray-500 text-xl">notifications</span>
                                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <div className="absolute top-full right-[-80px] md:right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                    <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all as read</span>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                        <div className="p-2 rounded-full bg-blue-50 text-blue-600 shrink-0">
                                            <span className="material-icons-outlined text-sm">event</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Weekly Design Sync</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Today at 10:00 AM</p>
                                        </div>
                                    </div>
                                    <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                        <div className="p-2 rounded-full bg-green-50 text-green-600 shrink-0">
                                            <span className="material-icons-outlined text-sm">check_circle</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Drink Water Reminder</p>
                                            <p className="text-xs text-gray-500 mt-0.5">Habit pending for this hour</p>
                                        </div>
                                    </div>
                                    <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                        <div className="p-2 rounded-full bg-purple-50 text-purple-600 shrink-0">
                                            <span className="material-icons-outlined text-sm">description</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">New AI Insights Available</p>
                                            <p className="text-xs text-gray-500 mt-0.5">For "Project Everest" note</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group relative">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 capitalize">
                                    {user?.role || 'user'} Member
                                </p>
                            </div>
                            <img
                                alt="Profile"
                                className="h-9 w-9 rounded-full border border-gray-200 object-cover bg-gray-100"
                                src={displayAvatar}
                            />
                            <span className="material-icons-outlined text-gray-500 group-hover:text-primary transition-colors">
                                expand_more
                            </span>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                                    to="/profile"
                                >
                                    <span className="material-icons-outlined text-lg">person</span>
                                    Profile
                                </Link>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    to="/settings"
                                >
                                    <span className="material-icons-outlined text-lg">settings</span>
                                    Settings
                                </Link>
                                <Link
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    to="/donate"
                                >
                                    <span className="material-icons-outlined text-lg">volunteer_activism</span>
                                    Donate
                                </Link>
                                <div className="h-px bg-gray-200 my-1"></div>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg w-full text-left"
                                    onClick={handleLogout}
                                >
                                    <span className="material-icons-outlined text-lg">logout</span>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
