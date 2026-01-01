import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';
import { useUser } from '../hooks/useUser';
import { Workflow, Search, ChevronDown, User, Settings, Heart, LogOut } from 'lucide-react';

interface HeaderProps {
    subtitle?: string;
}

export default function Header({ subtitle = 'Productivity, Simplified' }: HeaderProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user: authUser, signOut } = useAuth();
    const { user: profileData } = useUser(); // SWR cached fetch - deduped for 60s
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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

    const displayName = profileData?.name || authUser?.name || 'User';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=000&color=fff`;
    const fullAvatarUrl = getFullAvatarUrl(profileData?.image);
    const displayAvatar = (fullAvatarUrl && fullAvatarUrl.trim() !== '') ? fullAvatarUrl : defaultAvatar;

    return (
        <>
            <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            <header className="w-full border-b border-gray-200 bg-[#fdfdfd]/90 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="flex items-center justify-center rounded-lg bg-zinc-900 text-white size-8">
                                <Workflow size={20} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">
                                coreHub
                            </h1>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">
                            {subtitle}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#fdfdfd] hover:bg-gray-50 rounded-lg transition-colors text-sm text-gray-500 border border-gray-200 min-w-[200px]"
                        >
                            <Search size={16} className="opacity-70" />
                            <span className="font-normal tracking-normal">Type <kbd className="px-1.5 py-0.5 bg-gray-100 rounded-md text-xs font-medium border border-gray-200 mx-1">/</kbd> to search</span>
                        </button>

                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <Search size={24} className="text-gray-500" />
                        </button>

                        {/* Notification Bell */}
                        <NotificationBell />

                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group relative">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-900 leading-none">
                                    {displayName}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {authUser?.role === 'admin' ? 'Admin' : 'Free Trial'}
                                </p>
                            </div>
                            <img
                                alt="Profile"
                                className="h-9 w-9 rounded-full border border-gray-200 object-cover bg-gray-100"
                                src={displayAvatar}
                            />
                            <ChevronDown size={20} className="text-gray-500 group-hover:text-primary transition-colors" />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50 py-1">
                                <Link
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    to="/profile"
                                >
                                    <User size={18} className="text-gray-500" />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    to="/settings"
                                >
                                    <Settings size={18} className="text-gray-500" />
                                    <span>Settings</span>
                                </Link>
                                <Link
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                    to="/donate"
                                >
                                    <Heart size={18} className="text-gray-500" />
                                    <span>Donate</span>
                                </Link>
                                <div className="h-px bg-gray-200 my-1 mx-2"></div>
                                <button
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={18} className="text-gray-500" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
