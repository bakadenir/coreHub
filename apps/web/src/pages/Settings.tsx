import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AvatarUpload from '../components/AvatarUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { usersApi } from '../lib';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Settings() {
    const navigate = useNavigate();
    const { user, refreshUser, signOut } = useAuth();
    const { showToast } = useToast();

    // Profile form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');
    const [username, setUsername] = useState('');

    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    // Load user data on mount - fetch from API for latest data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await usersApi.getMe();
                if (result.success && result.data) {
                    const userData = result.data as any;
                    setName(userData.name || '');
                    setBio(userData.bio || '');
                    setAvatar(getFullAvatarUrl(userData.image));  // Apply full URL for uploaded images
                    setUsername(userData.username || '');
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                // Fallback to session data
                if (user) {
                    setName(user.name || '');
                    setBio(user.bio || '');
                    setAvatar(user.avatar || '');
                    setUsername(user.username || '');
                }
            }
        };
        fetchUser();
    }, []);

    const handleSaveProfile = async () => {
        if (!name.trim()) {
            showToast('Name is required', 'error');
            return;
        }

        setIsSavingProfile(true);
        try {
            // Upload avatar first if it's a new base64 image (not a URL)
            if (avatar && avatar.startsWith('data:image/')) {
                const uploadResult = await usersApi.uploadAvatar(avatar);
                if (!uploadResult.success) {
                    showToast(uploadResult.error || 'Failed to upload avatar', 'error');
                    setIsSavingProfile(false);
                    return;
                }
                // Avatar is now saved to server, update local state with URL
                if (uploadResult.data?.avatarUrl) {
                    setAvatar(uploadResult.data.avatarUrl);
                }
            }

            // Update profile (name and bio only - avatar already uploaded)
            const result = await usersApi.updateProfile({
                name: name.trim(),
                bio: bio.trim(),
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

    const handleChangePassword = async () => {
        if (!currentPassword) {
            showToast('Current password is required', 'error');
            return;
        }

        if (!newPassword) {
            showToast('New password is required', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showToast('New password must be at least 8 characters', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        setIsSavingPassword(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    revokeOtherSessions: false,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                showToast(data.message || 'Failed to change password', 'error');
            } else {
                showToast('Password changed successfully', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSavingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeletingAccount(true);
        try {
            const result = await usersApi.deleteAccount();

            if (result.success) {
                showToast('Account deleted successfully', 'success');
                await signOut();
                navigate('/');
            } else {
                showToast(result.error || 'Failed to delete account', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsDeletingAccount(false);
            setShowDeleteConfirm(false);
        }
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
                                    <p className="text-sm text-text-secondary mb-2">{role === 'user' ? 'Free Member' : role === 'admin' ? 'Admin' : role}</p>
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
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-gray-100 text-gray-400 text-[15px]">
                                            @
                                        </span>
                                        <input
                                            type="text"
                                            value={username}
                                            readOnly
                                            disabled
                                            placeholder="username"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-r-lg px-4 py-3 text-gray-500 placeholder-gray-300 cursor-not-allowed text-[15px] shadow-sm outline-none"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">Username cannot be changed</p>
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        readOnly
                                        disabled
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed text-[15px] shadow-sm outline-none"
                                    />
                                    <p className="text-xs text-gray-400">Email cannot be changed</p>
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
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                                            className="px-5 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isSavingPassword && (
                                                <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
                                            )}
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notification Settings Section */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">Notifications</h2>

                        <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
                            <div className="space-y-6">
                                {/* Push Notifications */}
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Push Notifications</h4>
                                        <p className="text-sm text-gray-500">Receive browser push notifications for reminders</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if ('Notification' in window) {
                                                const permission = await Notification.requestPermission();
                                                if (permission === 'granted') {
                                                    showToast('Push notifications enabled', 'success');
                                                } else {
                                                    showToast('Permission denied', 'error');
                                                }
                                            }
                                        }}
                                        className="px-4 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'Enabled ✓' : 'Enable'}
                                    </button>
                                </div>

                                <div className="border-t border-gray-100"></div>

                                {/* Habit Reminders */}
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Habit Reminders</h4>
                                        <p className="text-sm text-gray-500">Get notified about your daily habits at scheduled times</p>
                                    </div>
                                    <div className="w-12 h-7 bg-black rounded-full flex items-center p-0.5 cursor-pointer">
                                        <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm"></div>
                                    </div>
                                </div>

                                {/* Schedule Reminders */}
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Schedule Reminders</h4>
                                        <p className="text-sm text-gray-500">Receive notifications before scheduled events</p>
                                    </div>
                                    <div className="w-12 h-7 bg-black rounded-full flex items-center p-0.5 cursor-pointer">
                                        <div className="w-6 h-6 bg-white rounded-full ml-auto shadow-sm"></div>
                                    </div>
                                </div>

                                {/* Reminder Time */}
                                <div className="flex items-center justify-between py-2">
                                    <div>
                                        <h4 className="font-medium text-gray-900">Reminder Time</h4>
                                        <p className="text-sm text-gray-500">How early to send event reminders</p>
                                    </div>
                                    <select className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-400">
                                        <option value="5">5 minutes before</option>
                                        <option value="10">10 minutes before</option>
                                        <option value="15" selected>15 minutes before</option>
                                        <option value="30">30 minutes before</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Delete Account Section */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-red-600">Danger Zone</h2>

                        <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-base font-bold text-gray-900 mb-2">Delete Account</h4>
                                    <p className="text-sm text-gray-500 max-w-md">
                                        Permanently delete your account and all of your data. This action cannot be undone.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    disabled={isDeletingAccount}
                                    className="px-5 py-2.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
                                >
                                    {isDeletingAccount && (
                                        <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
                                    )}
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-8 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://github.com/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
                <div className="mt-2 flex justify-center gap-4">
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Privacy</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Terms</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Contact</a>
                </div>
            </footer>

            {/* Delete Account Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteAccount}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data including habits, schedules, notes, and links will be permanently deleted."
                confirmLabel="Delete My Account"
                variant="danger"
                isLoading={isDeletingAccount}
            />
        </div>
    );
}
