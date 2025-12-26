import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ResetPassword() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setError('Invalid or missing reset token');
        } else {
            setToken(tokenParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!newPassword) {
            setError('Enter a new password');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword,
                    token,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.message || 'Failed to reset password');
                showToast('Failed to reset password', 'error');
            } else {
                showToast('Password reset successfully! Please login.', 'success');
                navigate('/login');
            }
        } catch {
            setError('Network error. Please try again.');
            showToast('Failed to reset password', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 select-none cursor-default">
                            <div className="flex items-center justify-center rounded-xl bg-black text-white size-8 shadow-md">
                                <span className="material-icons-outlined text-[20px]">hub</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">coreHub</h1>
                        </div>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Reset Password</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg shadow-gray-200/50">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Set New Password</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your new password below.
                            </p>
                        </div>

                        {!token ? (
                            <div className="text-center space-y-4 animate-fade-in">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-icons-outlined text-red-600 text-3xl">error</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Invalid Reset Link</h3>
                                <p className="text-sm text-gray-500">
                                    The password reset link is invalid or has expired.
                                </p>
                                <div className="pt-4">
                                    <Link
                                        to="/forgot-password"
                                        className="inline-flex justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition-all"
                                    >
                                        Request New Link
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3" noValidate>
                                <FloatingInput
                                    label="New Password"
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="!mb-1"
                                />

                                <FloatingInput
                                    label="Confirm Password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    className="!mb-1"
                                />

                                {/* Consolidated Error Display */}
                                <div className="min-h-[20px] -mt-1 mb-2">
                                    {error && (
                                        <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1">
                                            <span className="material-icons-outlined text-[16px]">error</span>
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <button
                                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-black px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </div>
                                <div className="text-center">
                                    <Link className="text-sm font-medium text-gray-600 hover:text-black hover:underline transition-colors" to="/login">
                                        Back to Login
                                    </Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-transparent">
                © 2025 coreHub. All rights reserved. Code with <a href="https://github.com/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a>
            </footer>
        </div>
    );
}
