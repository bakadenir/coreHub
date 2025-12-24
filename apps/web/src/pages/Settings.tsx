import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AvatarUpload from '../components/AvatarUpload';
import ConfirmDialog from '../components/ConfirmDialog';
import { usersApi, notificationsApi } from '../lib';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';



export default function Settings() {
    const navigate = useNavigate();
    const { user, refreshUser, signOut } = useAuth();
    const { showToast } = useToast();

    // Profile form state
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('');


    // Loading states
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Notification settings state
    const [habitReminders, setHabitReminders] = useState(true);
    const [scheduleReminders, setScheduleReminders] = useState(true);
    const [scheduleReminderMinutes, setScheduleReminderMinutes] = useState(15);
    const [isLoadingNotifSettings, setIsLoadingNotifSettings] = useState(false);
    const [isSavingNotifSetting, setIsSavingNotifSetting] = useState(false);

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

                }
            } catch (error) {
                console.error('Error fetching user:', error);
                // Fallback to session data
                if (user) {
                    setName(user.name || '');
                    setBio(user.bio || '');
                    setAvatar(user.avatar || '');

                }
            }
        };
        fetchUser();
    }, []);

    // Load notification settings on mount
    useEffect(() => {
        const fetchNotificationSettings = async () => {
            setIsLoadingNotifSettings(true);
            try {
                const result = await notificationsApi.getSettings();
                if (result.success && result.data) {
                    setHabitReminders(result.data.habitReminders);
                    setScheduleReminders(result.data.scheduleReminders);
                    setScheduleReminderMinutes(result.data.scheduleReminderMinutes);
                }
            } catch (error) {
                console.error('Error fetching notification settings:', error);
            } finally {
                setIsLoadingNotifSettings(false);
            }
        };
        fetchNotificationSettings();
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
            // Import supabase client
            const { supabase } = await import('../lib/supabaseClient');

            // First verify current password by trying to sign in
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: user?.email || '',
                password: currentPassword,
            });

            if (verifyError) {
                showToast('Current password is incorrect', 'error');
                setIsSavingPassword(false);
                return;
            }

            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                showToast(error.message || 'Failed to change password', 'error');
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

    // Handler for updating notification settings
    const updateNotificationSetting = async (key: 'habitReminders' | 'scheduleReminders' | 'scheduleReminderMinutes', value: boolean | number) => {
        if (isSavingNotifSetting) return; // Prevent spam clicks
        setIsSavingNotifSetting(true);
        try {
            const result = await notificationsApi.updateSettings({ [key]: value });
            if (result.success) {
                if (key === 'habitReminders') setHabitReminders(value as boolean);
                if (key === 'scheduleReminders') setScheduleReminders(value as boolean);
                if (key === 'scheduleReminderMinutes') setScheduleReminderMinutes(value as number);
                showToast('Settings updated', 'success');
            } else {
                showToast(result.error || 'Failed to update settings', 'error');
            }
        } catch {
            showToast('Network error', 'error');
        } finally {
            setIsSavingNotifSetting(false);
        }
    };


    const role = user?.role || 'user';

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
            <Header subtitle="Settings" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow relative z-10">

                {/* Back to Home Control */}
                <div className="mb-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <span className="material-icons-outlined text-base">arrow_back</span>
                        Back to Home
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
                                    <p className="text-sm text-text-secondary mb-2">{(role === 'user' || role === 'authenticated') ? 'Free Trial' : role === 'admin' ? 'Admin' : role}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Username</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                    />
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
                            {isLoadingNotifSettings ? (
                                <div className="flex items-center justify-center py-8">
                                    <span className="material-icons-outlined text-2xl animate-spin text-gray-400">refresh</span>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Push Notifications */}
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Push Notifications</h4>
                                            <p className="text-sm text-gray-500">Receive browser push notifications for reminders</p>
                                        </div>
                                        {typeof Notification !== 'undefined' && Notification.permission === 'denied' ? (
                                            <div className="text-right">
                                                <span className="px-4 py-2 text-sm font-medium bg-red-100 text-red-700 rounded-lg">
                                                    Blocked
                                                </span>
                                                <p className="text-xs text-gray-400 mt-1">Reset in browser settings</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    if ('Notification' in window && Notification.permission === 'default') {
                                                        const permission = await Notification.requestPermission();
                                                        if (permission === 'granted') {
                                                            showToast('Push notifications enabled', 'success');
                                                        } else if (permission === 'denied') {
                                                            showToast('Permission blocked. Reset in browser settings.', 'error');
                                                        }
                                                    }
                                                }}
                                                disabled={typeof Notification !== 'undefined' && Notification.permission === 'granted'}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${typeof Notification !== 'undefined' && Notification.permission === 'granted'
                                                    ? 'bg-green-100 text-green-700 cursor-default'
                                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {typeof Notification !== 'undefined' && Notification.permission === 'granted' ? 'Enabled ✓' : 'Enable'}
                                            </button>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100"></div>

                                    {/* Habit Reminders */}
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Habit Reminders</h4>
                                            <p className="text-sm text-gray-500">Get notified about your daily habits at scheduled times</p>
                                        </div>
                                        <button
                                            onClick={() => updateNotificationSetting('habitReminders', !habitReminders)}
                                            disabled={isSavingNotifSetting}
                                            className={`w-12 h-7 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${habitReminders ? 'bg-black' : 'bg-gray-300'} ${isSavingNotifSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${habitReminders ? 'ml-auto' : 'ml-0'}`}></div>
                                        </button>
                                    </div>

                                    {/* Schedule Reminders */}
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Schedule Reminders</h4>
                                            <p className="text-sm text-gray-500">Receive notifications before scheduled events</p>
                                        </div>
                                        <button
                                            onClick={() => updateNotificationSetting('scheduleReminders', !scheduleReminders)}
                                            disabled={isSavingNotifSetting}
                                            className={`w-12 h-7 rounded-full flex items-center p-0.5 cursor-pointer transition-colors ${scheduleReminders ? 'bg-black' : 'bg-gray-300'} ${isSavingNotifSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all ${scheduleReminders ? 'ml-auto' : 'ml-0'}`}></div>
                                        </button>
                                    </div>

                                    {/* Reminder Time */}
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Reminder Time</h4>
                                            <p className="text-sm text-gray-500">How early to send event reminders</p>
                                        </div>
                                        <select
                                            value={scheduleReminderMinutes}
                                            onChange={(e) => updateNotificationSetting('scheduleReminderMinutes', Number(e.target.value))}
                                            disabled={isSavingNotifSetting}
                                            className={`px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 outline-none focus:border-gray-400 ${isSavingNotifSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value={5}>5 minutes before</option>
                                            <option value={10}>10 minutes before</option>
                                            <option value={15}>15 minutes before</option>
                                            <option value={30}>30 minutes before</option>
                                        </select>
                                    </div>
                                </div>
                            )}
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

            <footer className="w-full border-t border-border-light py-5 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50/50 relative z-10">
                <p>© 2025 coreHub. All rights reserved. Code with <a href="https://linkedin.com/in/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
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
                confirmText="delete"
            />
        </div>
    );
}
