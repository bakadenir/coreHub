import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import OTPInput from '../components/OTPInput';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    // Flow states: 'email' -> 'otp' -> 'password' -> 'success'
    const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
    const [resendTimer, setResendTimer] = useState(0);

    // Password reset fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/home', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Timer countdown
    useEffect(() => {
        if (resendTimer > 0) {
            const interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [resendTimer]);

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

    const handleSendOTP = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.retryAfter) {
                    setResendTimer(data.retryAfter);
                    setStep('otp');
                    showToast(`Please wait ${data.retryAfter}s before requesting new code`, 'info');
                } else {
                    setError(data.error || 'Failed to send reset code');
                    showToast('Failed to send reset code', 'error');
                }
            } else {
                setStep('otp');
                setResendTimer(60);
                showToast('Reset code sent to your email', 'success');
            }
        } catch {
            setError('Network error. Please try again.');
            showToast('Network error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = useCallback(async (code: string) => {
        setOtpCode(code);
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/validate-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Invalid verification code');
                // Don't show toast here as the inline error is enough, but maybe just for consistency?
                // Actually user requested cleaner UI, inline error is enough.
                // But let's show info toast if it's expired maybe?
                // Let's stick to inline error + optional toast.
            } else {
                setStep('password');
                showToast('OTP verified! Set your new password', 'success');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [email, showToast]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!newPassword) {
            setError('Enter a new password');
            setIsLoading(false);
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setIsLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode, newPassword }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                setError(data.error || 'Failed to reset password');
                // If OTP expired, go back to OTP step
                if (data.error?.includes('expired') || data.error?.includes('Invalid')) {
                    setStep('otp');
                }
                showToast('Failed to reset password', 'error');
            } else {
                setStep('success');
                showToast('Password reset successfully!', 'success');
            }
        } catch {
            setError('Network error. Please try again.');
            showToast('Network error', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        await handleSendOTP();
    };

    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gray-50/50"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
                            <img src="/logo.png" alt="Logo" className="size-8 object-contain" />
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">coreHub</h1>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Reset Password</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in-up relative z-10">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-8 shadow-lg shadow-gray-200/50">

                        {/* Step 1: Email Input */}
                        {step === 'email' && (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <span className="material-icons-outlined text-zinc-900 text-3xl">lock_reset</span>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reset Password</h2>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter your email and we'll send you a code to reset your password.
                                    </p>
                                </div>

                                <form onSubmit={handleSendOTP} className="flex flex-col gap-3" noValidate>
                                    <FloatingInput
                                        label="Email"
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="!mb-1"
                                    />

                                    {error && (
                                        <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1 mb-2">
                                            <span className="material-icons-outlined text-[16px]">error</span>
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Sending Code...
                                            </>
                                        ) : (
                                            'Send Reset Code'
                                        )}
                                    </button>
                                    <div className="text-center pt-2">
                                        <Link className="text-sm font-medium text-gray-500 hover:text-black transition-colors" to="/auth">
                                            Back to Login
                                        </Link>
                                    </div>
                                </form>
                            </>
                        )}

                        {/* Step 2: OTP Input */}
                        {step === 'otp' && (
                            <div className="animate-fade-in">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <span className="material-icons-outlined text-zinc-900 text-3xl">mark_email_read</span>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Enter Code</h2>
                                    <p className="mt-2 text-sm text-gray-500 max-w-[280px] mx-auto">
                                        We sent a 6-digit code to<br />
                                        <span className="font-semibold text-gray-900">{email}</span>
                                    </p>
                                </div>

                                <OTPInput
                                    onComplete={handleVerifyOTP}
                                    disabled={isLoading}
                                />

                                {error && (
                                    <p className="flex items-center justify-center gap-2 text-sm text-red-600 font-medium animate-fade-in mt-6">
                                        <span className="material-icons-outlined text-[16px]">error</span>
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col items-center gap-4 mt-8 w-full">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendTimer > 0 || isLoading}
                                        className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                                    </button>

                                    <button
                                        onClick={() => setStep('email')}
                                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"
                                    >
                                        Change email
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: New Password */}
                        {step === 'password' && (
                            <div className="animate-fade-in">
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                        <span className="material-icons-outlined text-green-600 text-3xl">verified</span>
                                    </div>
                                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Set New Password</h2>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Enter your new password below.
                                    </p>
                                </div>

                                <form onSubmit={handleResetPassword} className="flex flex-col gap-3" noValidate>
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

                                    {error && (
                                        <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1 mb-2">
                                            <span className="material-icons-outlined text-[16px]">error</span>
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        className="flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
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
                                </form>
                            </div>
                        )}

                        {/* Step 4: Success */}
                        {step === 'success' && (
                            <div className="text-center space-y-4 animate-fade-in">
                                <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <span className="material-icons-outlined text-green-600 text-3xl">check_circle</span>
                                </div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900">Password Reset!</h3>
                                <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                                    Your password has been successfully reset. You can now login with your new password.
                                </p>
                                <div className="pt-6">
                                    <Link
                                        to="/auth"
                                        className="inline-flex justify-center rounded-xl bg-zinc-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-zinc-200 hover:bg-zinc-800 hover:shadow-xl transition-all w-full sm:w-auto"
                                    >
                                        Go to Login
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
