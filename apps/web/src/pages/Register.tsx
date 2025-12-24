import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import { signUp } from '../lib/auth';

export default function Register() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

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

    // Don't render register page if user is logged in (prevents flash)
    if (user) {
        return null;
    }

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePassword = (password: string) => {
        // Prioritize: Min 6 -> Uppercase -> Number
        if (password.length < 6) return 'Minimum 6 characters';
        if (!/(?=.*[A-Z])/.test(password)) return 'At least 1 uppercase letter (A-Z)';
        if (!/(?=.*\d)/.test(password)) return 'At least 1 number (0-9)';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        };
        let hasError = false;

        // Validation
        if (!formData.username.trim()) {
            newErrors.username = 'Enter a username';
            hasError = true;
        }

        if (!formData.email) {
            newErrors.email = 'Enter an email address';
            hasError = true;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Enter a valid email address (e.g., user@example.com)';
            hasError = true;
        }

        if (!formData.password) {
            newErrors.password = 'Enter a password';
            hasError = true;
        } else {
            const passwordError = validatePassword(formData.password);
            if (passwordError) {
                newErrors.password = passwordError;
                hasError = true;
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm your password';
            hasError = true;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            setIsLoading(false);
            return;
        }

        try {
            // Username is stored in Supabase user_metadata
            const result = await signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.username,
            });

            if (result.error) {
                showToast(result.error.message || 'Registration failed', 'error');
                setIsLoading(false);
                return;
            }

            showToast('Account created successfully! Please check your email to verify.', 'success');
            navigate('/login');
        } catch (error) {
            showToast('An error occurred during registration', 'error');
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
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Register</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg shadow-gray-200/50">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create your coreHub account</h2>
                            <p className="mt-2 text-sm text-gray-500">Join coreHub to unlock your productivity.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3" noValidate>
                            <FloatingInput
                                label="Username"
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                autoComplete="username"
                                className="mb-0"
                            />

                            <FloatingInput
                                label="Email"
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoComplete="email"
                                className="mb-0"
                            />

                            <FloatingInput
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value });
                                    if (errors.password) setErrors({ ...errors, password: '' });
                                }}
                                autoComplete="new-password"
                                className="mb-0"
                            />

                            <FloatingInput
                                label="Confirm Password"
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                autoComplete="new-password"
                                className="!mb-1"
                            />

                            {/* Consolidated Error Display */}
                            <div className="min-h-[20px] -mt-1 mb-2">
                                {(errors.username || errors.email || errors.password || errors.confirmPassword) && (
                                    <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1">
                                        <span className="material-icons-outlined text-[16px]">error</span>
                                        {errors.username || errors.email || errors.password || errors.confirmPassword}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end pt-0 pb-0">
                                <Link className="text-sm font-medium text-black hover:underline decoration-1 underline-offset-2" to="/login">
                                    Already have an account? Login
                                </Link>
                            </div>

                            <div className="pt-0">
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
                                            Creating Account...
                                        </>
                                    ) : (
                                        'Register'
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="bg-white px-2 text-gray-400">Or continue with</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => showToast('Google login coming soon!', 'info')}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => showToast('GitHub login coming soon!', 'info')}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                    </svg>
                                    GitHub
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className="text-center text-xs text-gray-400 font-mono">
                        Secure Access • coreHub Productivity System
                    </p>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-transparent relative z-10">
                © 2025 coreHub. All rights reserved. Code with <a href="https://github.com/bakadenir" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a>
            </footer>
        </div>
    );
}
