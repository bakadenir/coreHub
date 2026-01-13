import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';

export default function Profile() {
    const { user: sessionUser } = useAuth();

    // Use SWR hook for cached data with background sync
    const { user, stats } = useProfile();

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

    const name = user?.name || sessionUser?.name || 'User';
    const bio = user?.bio || 'No bio yet.';
    const location = user?.location || 'Location not set';
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&size=200`;
    const userImage = getFullAvatarUrl(user?.image);
    const avatar = (userImage && userImage.trim() !== '') ? userImage : defaultAvatar;

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
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
            <Header subtitle="Profile" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow relative z-10">
                {/* Back to Home */}
                <div className="mb-8">
                    <Link
                        to="/home"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <span className="material-icons-outlined text-base">arrow_back</span>
                        Back to Home
                    </Link>
                </div>

                {/* Page Title */}
                <h2 className="text-3xl font-extrabold tracking-tight mb-8 text-text-primary">My Profile</h2>

                {/* Profile Card */}
                <div className="relative w-full">
                    {/* Card container */}
                    <div className="bg-[#fdfdfd] border border-border-light rounded-xl pt-20 pb-10 px-8 relative shadow-sm">
                        {/* Avatar - Centered and overlapping top */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-16">
                            <div className="w-32 h-32 rounded-full shadow-2xl overflow-hidden">
                                <img
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    src={avatar}
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <h1 className="text-2xl font-bold text-center text-text-primary mb-1 mt-2">
                            {name}
                        </h1>

                        {/* Location */}
                        <p className="text-sm text-text-secondary text-center mb-6">
                            {location}
                        </p>

                        {/* Bio (Limit width for aesthetics) */}
                        <div className="text-center mb-8 max-w-xs mx-auto">
                            <p className="text-base text-text-secondary leading-relaxed">
                                {bio}
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between items-center px-4 py-6 border-t border-b border-gray-100 mb-8">
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-bold text-text-primary">{stats.habits}</span>
                                <span className="text-xs text-text-secondary uppercase tracking-wide mt-1">Habits</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100"></div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-bold text-text-primary">{stats.notes}</span>
                                <span className="text-xs text-text-secondary uppercase tracking-wide mt-1">Notes</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100"></div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-xl font-bold text-text-primary">{stats.links}</span>
                                <span className="text-xs text-text-secondary uppercase tracking-wide mt-1">Links</span>
                            </div>
                        </div>

                        {/* Change Profile Button */}
                        <div className="flex justify-end">
                            <Link
                                to="/settings"
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5"
                            >
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved.</p>
            </footer>
        </div>
    );
}
