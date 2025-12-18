import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import FloatingInput from '../components/FloatingInput';
import { signUp } from '../lib/auth';

export default function Register() {
    const navigate = useNavigate();
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
            const result = await signUp.email({
                email: formData.email,
                password: formData.password,
                name: formData.username,  // Use username as display name
            });

            if (result.error) {
                showToast(result.error.message || 'Registration failed', 'error');
                setIsLoading(false);
                return;
            }

            // Save username to database after account creation
            if (result.data?.user) {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
                    await fetch(`${apiUrl}/api/auth-custom/set-username`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ username: formData.username }),
                    });
                } catch {
                    // Username save failed but account created
                    console.log('Username save failed during registration');
                }
            }

            showToast('Account created successfully! Please login.', 'success');
            navigate('/login');
        } catch (error) {
            showToast('An error occurred during registration', 'error');
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
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up">
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
                                    <span className="bg-white px-2 text-gray-500 font-medium">Or continue with</span>
                                </div>
                            </div>
                            <div className="mt-6 flex gap-3">
                                <button
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-transparent px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                                >
                                    Google
                                </button>
                                <button
                                    className="flex w-full justify-center items-center gap-2 rounded-lg bg-transparent px-3 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all"
                                >
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
            <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-transparent">
                © 2025 coreHub. All rights reserved.
            </footer>
        </div>
    );
}
