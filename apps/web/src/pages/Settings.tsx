import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import AvatarUpload from '../components/AvatarUpload';
import { usersApi } from '../lib';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
    const { user, refreshUser } = useAuth();
    const { showToast } = useToast();

    // Profile form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [username, setUsername] = useState('');

    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingUsername, setIsSavingUsername] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Load user data on mount
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setAvatar(user.avatar || '');
            setUsername(user.username || '');
        }
    }, [user]);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        setIsSavingProfile(true);
        try {
            const result = await usersApi.updateProfile({
                name: name.trim(),
                bio: bio.trim(),
                avatar: avatar,
            });

            if (result.success) {
                showToast('Profile updated successfully', 'success');
                refreshUser?.();
            } else {
                showToast(result.error || 'Failed to update profile', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveUsername = async () => {
        if (!username.trim()) {
            showToast('Username is required', 'error');
            return;
        }

        if (username.length < 3) {
            showToast('Username must be at least 3 characters', 'error');
            return;
        }

        setIsSavingUsername(true);
        try {
            const result = await usersApi.updateUsername(username.trim());

            if (result.success) {
                showToast('Username updated successfully', 'success');
                refreshUser?.();
            } else {
                showToast(result.message || result.error || 'Failed to update username', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSavingUsername(false);
        }
    };

    const handleCancelProfile = () => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setAvatar(user.avatar || '');
        }
    };

    const handleAvatarChange = (base64: string) => {
        setAvatar(base64);
    };

    const email = user?.email || '';
    const role = user?.role || 'user';

    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary">
            <Header subtitle="Settings" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow">

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

                <div className="flex flex-col gap-12">
                    {/* Profile Settings Section */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">Profile Settings</h2>

                        <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 mb-8">
                                <AvatarUpload
                                    currentAvatar={avatar}
                                    name={name}
                                    onAvatarChange={handleAvatarChange}
                                />
                                <div className="hidden sm:block">
                                    <h3 className="text-lg font-bold text-text-primary">{name || 'User'}</h3>
                                    <p className="text-sm text-text-secondary mb-2 capitalize">{role} Member</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        readOnly
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-500 text-[15px] shadow-sm cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-400">Email cannot be changed</p>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-light">
                                <button
                                    onClick={handleCancelProfile}
                                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSavingProfile && (
                                        <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Security Settings Section (Username) */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">Security & Login</h2>

                        <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Username</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-[15px]">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            placeholder="username"
                                            className="w-full bg-white border border-gray-300 rounded-r-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">Only lowercase letters, numbers, and underscores</p>
                                </div>

                                <div className="border-t border-gray-100 pt-6"></div>

                                <div>
                                    <h4 className="text-base font-bold text-text-primary mb-4">Change Password</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="block text-sm font-medium text-gray-500">Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2.5">
                                                <label className="block text-sm font-medium text-gray-500">New Password</label>
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-sm font-medium text-gray-500">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Password change coming soon</p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-light">
                                <button
                                    onClick={handleSaveUsername}
                                    disabled={isSavingUsername || username === user?.username}
                                    className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSavingUsername && (
                                        <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
                                    )}
                                    Update Username
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-8 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50">
                <p>© 2025 coreHub. All rights reserved.</p>
                <div className="mt-2 flex justify-center gap-4">
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Privacy</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Terms</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Contact</a>
                </div>
            </footer>
        </div>
    );
}
