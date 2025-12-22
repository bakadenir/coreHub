
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../lib';

interface UserProfile {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    image?: string;
    bio?: string;
    username?: string;
}

export default function Profile() {
    const { user: sessionUser } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);

    // Fetch user data from API on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await usersApi.getMe();
                if (result.success && result.data) {
                    setUser(result.data as unknown as UserProfile);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
        fetchUser();
    }, []);

    // Helper to construct full URL for uploaded files
    const getFullAvatarUrl = (imageUrl: string | null | undefined): string => {
        if (!imageUrl || imageUrl.trim() === '') return '';
        // If it's already a full URL (http/https), return as-is
        if (imageUrl.startsWith('http')) return imageUrl;
        // If it's a relative path to uploads, prefix with API base URL
        if (imageUrl.startsWith('/uploads/')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            return `${apiUrl}${imageUrl}`;
        }
        return imageUrl;
    };

    const name = user?.name || sessionUser?.name || 'User';
    const roleRaw = user?.role || sessionUser?.role || 'user';
    // Convert 'user' role to 'Free Trial' display
    const role = roleRaw === 'user' ? 'Free Trial' : roleRaw === 'admin' ? 'Admin' : roleRaw;
    const email = user?.email || sessionUser?.email || '';
    const bio = user?.bio || 'No bio yet.';
    // Better fallback: check for null, undefined, or empty string
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff`;
    const userImage = getFullAvatarUrl(user?.image);
    const avatar = (userImage && userImage.trim() !== '') ? userImage : defaultAvatar;

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Base bg */}
                <div className="absolute inset-0 bg-gray-50/50"></div>

                {/* Animated Gradient Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px] animate-blob mix-blend-multiply"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200/30 rounded-full blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial fade for grid to be softer at edges */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_200px,transparent,white)]"></div>
            </div>
            <Header subtitle="Profile" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow relative z-10">

                {/* Back to Dashboard Control */}
                <div className="mb-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <span className="material-icons-outlined text-base">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </div>

                <div className="w-full">
                    <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">My Profile</h2>

                    <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">

                        {/* Header Section */}
                        <div className="flex items-center gap-6 mb-8">
                            <img
                                alt="Profile"
                                className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                                src={avatar}
                            />
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">{name}</h3>
                                <p className="text-sm text-text-secondary mb-2">{role}</p>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm">
                                    {name}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm">
                                    {email}
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Bio</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm min-h-[100px]">
                                    {bio}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <Link
                                to="/settings"
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
                            >
                                Change Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://linkedin.com/in/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
            </footer>
        </div>
    );
}
