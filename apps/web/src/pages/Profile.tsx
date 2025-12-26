
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { usersApi, habitsApi, notesApi, linksApi } from '../lib';

interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    image?: string;
    bio?: string;
    username?: string;
    location?: string;
}

interface Stats {
    habits: number;
    notes: number;
    links: number;
}

export default function Profile() {
    const { user: sessionUser } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState<Stats>({ habits: 0, notes: 0, links: 0 });

    // Fetch user data and stats from API on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userResult, habitsResult, notesResult, linksResult] = await Promise.all([
                    usersApi.getMe(),
                    habitsApi.getAll({}),
                    notesApi.getAll(),
                    linksApi.getAll()
                ]);

                if (userResult.success && userResult.data) {
                    setUser(userResult.data as unknown as UserProfile);
                }

                setStats({
                    habits: habitsResult.success && habitsResult.data ? habitsResult.data.length : 0,
                    notes: notesResult.success && notesResult.data ? notesResult.data.length : 0,
                    links: linksResult.success && linksResult.data ? linksResult.data.length : 0,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

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
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gray-50/50"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,transparent,white)]"></div>
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
                <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">My Profile</h2>

                {/* Profile Card */}
                <div className="relative w-full">
                    {/* Card container */}
                    <div className="bg-white border border-border-light rounded-xl pt-20 pb-10 px-8 relative shadow-sm">
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
                        <div className="flex justify-center">
                            <Link
                                to="/settings"
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium bg-black text-white rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
                            >
                                Change Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono bg-white">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://linkedin.com/in/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
            </footer>
        </div>
    );
}
