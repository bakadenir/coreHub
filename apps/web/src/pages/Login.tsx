import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';
import { signIn } from '../lib/auth';

export default function Login() {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const newErrors = {
            email: '',
            password: '',
        };
        let hasError = false;

        // Validation
        if (!formData.email) {
            newErrors.email = 'Enter an email or username';
            hasError = true;
        }
        if (!formData.password) {
            newErrors.password = 'Enter your password';
            hasError = true;
        }

        setErrors(newErrors);

        if (hasError) {
            setIsLoading(false);
            return;
        }

        try {
            // Supabase only supports email login, not username
            // If user entered a non-email, show error
            let emailToUse = formData.email;

            if (!formData.email.includes('@')) {
                showToast('Please use your email address to login', 'error');
                setIsLoading(false);
                return;
            }

            const result = await signIn.email({
                email: emailToUse,
                password: formData.password,
            });

            if (result.error) {
                showToast(result.error.message || 'Invalid credentials', 'error');
                setIsLoading(false);
                return;
            }

            // Check user role for admin redirect
            const userRole = (result.data?.user as any)?.user_metadata?.role;
            if (userRole === 'admin') {
                showToast('Welcome back! Redirecting to admin...', 'success');
                setTimeout(() => {
                    window.location.href = '/admin';
                }, 100);
            } else {
                showToast('Welcome back! Login successful.', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 100);
            }
        } catch (error) {
            showToast('An error occurred during login', 'error');
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
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Login</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-lg shadow-gray-200/50">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                            <p className="mt-2 text-sm text-gray-500">Please enter your details to sign in.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3" noValidate>
                            <FloatingInput
                                label="Email / Username"
                                id="email"
                                name="email"
                                type="text"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                autoComplete="username"
                                className="mb-0"
                            />

                            <FloatingInput
                                label="Password"
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                autoComplete="current-password"
                                className="!mb-1"
                            />

                            {/* Consolidated Error Display */}
                            <div className="min-h-[20px] -mt-1 mb-2">
                                {(errors.email || errors.password) && (
                                    <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1">
                                        <span className="material-icons-outlined text-[16px]">error</span>
                                        {errors.email || errors.password}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-0 pb-0">
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                    />
                                    <label className="ml-2 block text-sm text-gray-600 cursor-pointer select-none" htmlFor="remember-me">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <Link className="font-medium text-black hover:underline decoration-1 underline-offset-2" to="/forgot-password">Forgot Password?</Link>
                                </div>
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
                                            Signing in...
                                        </>
                                    ) : (
                                        'Login'
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
                                    <span className="bg-white px-2 text-gray-500 font-medium">New to coreHub?</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Link
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-transparent px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                                    to="/register"
                                >
                                    Register Account
                                </Link>
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
