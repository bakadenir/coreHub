import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render page if user is logged in (prevents flash)
    if (user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email) {
            setError('Enter an email address');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/forget-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    redirectTo: `${window.location.origin}/reset-password`,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.message || 'Failed to send reset link');
                showToast('Failed to send reset link', 'error');
            } else {
                setIsSubmitted(true);
                showToast('Reset link sent! Check the backend console for the reset URL.', 'success');
            }
        } catch {
            setError('Network error. Please try again.');
            showToast('Failed to send reset link', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300 relative overflow-hidden">
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
            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 select-none cursor-default">
                            <div className="flex items-center justify-center rounded-lg bg-black text-white size-8 shadow-md">
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
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg shadow-gray-200/50">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reset Password</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Enter your email or username and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center space-y-4 animate-fade-in">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <span className="material-icons-outlined text-green-600 text-3xl">mark_email_read</span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
                                <p className="text-sm text-gray-500">
                                    We sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
                                </p>
                                <div className="pt-4">
                                    <Link
                                        to="/login"
                                        className="inline-flex justify-center rounded-lg bg-black px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 transition-all"
                                    >
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3" noValidate>
                                <FloatingInput
                                    label="Email / Username"
                                    id="email"
                                    name="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    // error prop removed to prevent input border coloring, handle error display globally below
                                    autoComplete="email"
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
                                        className="flex w-full justify-center items-center gap-2 rounded-lg bg-black px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending Link...
                                            </>
                                        ) : (
                                            'Send Reset Link'
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
                    <p className="text-center text-xs text-gray-400">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>.
                    </p>
                </div>
            </main>

        </div>
    );
}
