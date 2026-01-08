import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import FloatingInput from '../components/FloatingInput';
import { signIn, signUp, signOut } from '../lib/auth';
import { Workflow, AlertCircle } from 'lucide-react';

export default function LoginRegister() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [isSignUp, setIsSignUp] = useState(location.state?.isSignUp ?? false);

    // Auth States
    const [isLoading, setIsLoading] = useState(false);

    // Login Form Data
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Register Form Data
    const [registerData, setRegisterData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Redirect to dashboard if already logged in
    // Prevent redirect while form is submitting (isLoading) to handle register->signOut flow
    useEffect(() => {
        if (!authLoading && user && !isLoading) {
            navigate('/home', { replace: true });
        }
    }, [user, authLoading, navigate, isLoading]);

    // Validation Helpers
    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // --- Handlers ---
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (!loginData.email) throw new Error('Enter an email or username');

            // Heuristic check: if it looks like an email domain but has no '@', warn the user
            if (!loginData.email.includes('@') && /\.(com|net|org|edu|gov|io|co|id)$/i.test(loginData.email)) {
                throw new Error("Please include an '@' in the email address");
            }

            if (!loginData.password) throw new Error('Enter your password');

            const result = await signIn.email(loginData);

            if (result.error) {
                let errorMsg = 'Login failed';
                const msg = result.error.message?.toLowerCase() || '';
                if (msg.includes('invalid login credentials')) errorMsg = 'Invalid email or password';
                else if (msg.includes('user not found')) errorMsg = 'Account not found';
                else if (msg.includes('email not confirmed')) errorMsg = 'Please verify your email first';
                else errorMsg = result.error.message || 'Login failed';

                setErrors({ login: errorMsg });
            } else {
                showToast('Welcome back!', 'success');
                // Navigation handled by useEffect
            }
        } catch (err) {
            setErrors({ login: err instanceof Error ? err.message : 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        try {
            if (!registerData.email || !validateEmail(registerData.email)) throw new Error('Valid email required');
            if (registerData.password.length < 6) throw new Error('Password must be at least 6 chars');
            if (registerData.password !== registerData.confirmPassword) throw new Error('Passwords do not match');

            // Auto-generate username from email (part before @)
            const autoUsername = registerData.email.split('@')[0];

            const result = await signUp.email({
                email: registerData.email,
                password: registerData.password,
                name: autoUsername,
            });

            if (result.error) {
                setErrors({ register: result.error.message });
            } else {
                // Force logout so user has to login manually
                await signOut();
                showToast('Account created! Please login.', 'success');
                setIsSignUp(false); // Switch to login view
            }
        } catch (err) {
            setErrors({ register: err instanceof Error ? err.message : 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) return null;

    if (authLoading) return null;

    const socialButtons = (
        <div className="flex gap-4 mb-4">
            {/* Google */}
            <button type="button" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors bg-[#fdfdfd] shadow-sm" onClick={async () => {
                const { error } = await signIn.google();
                if (error) showToast(error.message, 'error');
            }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M24 12.276c0-1.16-.104-2.268-.297-3.328H12v6.29h6.728c-.288 1.55-1.165 2.87-2.482 3.75v3.12h4.02c2.352-2.164 3.708-5.352 3.708-9.832z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.956-1.074 7.94-2.906l-4.02-3.12c-1.074.72-2.45 1.146-3.92 1.146-3.128 0-5.776-2.112-6.724-4.95H1.14v3.226C3.136 21.366 7.228 24 12 24z" />
                    <path fill="#FBBC05" d="M5.276 14.168c-.24-.72-.376-1.492-.376-2.29s.136-1.57.376-2.29V6.47H1.14C.414 7.915 0 9.548 0 12.122s.414 4.207 1.14 5.652l4.136-3.226z" />
                    <path fill="#4285F4" d="M12 4.75c1.762 0 3.344.606 4.588 1.794l3.438-3.438C17.954 1.14 15.238 0 12 0 7.228 0 3.136 2.634 1.14 6.47l4.136 3.226c.948-2.838 3.596-4.95 6.724-4.95z" />
                </svg>
            </button>
            {/* GitHub - Working */}
            <button type="button" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors bg-[#fdfdfd] shadow-sm" onClick={async () => {
                const { error } = await signIn.github();
                if (error) showToast(error.message, 'error');
            }}>
                <svg className="w-5 h-5" fill="#181717" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
            </button>
        </div>
    );

    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Base bg */}
                <div className="absolute inset-0 bg-gray-50/50"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Gradient Fades */}
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white to-transparent"></div>
            </div>

            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2 select-none hover:opacity-80 transition-opacity">
                            <div className="flex items-center justify-center rounded-xl bg-zinc-900 text-white size-8 shadow-md">
                                <Workflow size={20} />
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">coreHub</h1>
                        </Link>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">
                            {isSignUp ? 'Register' : 'Login'}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4 relative z-10 animate-fade-in-up">
                {/* Main Container */}
                <div className={`relative bg-[#fdfdfd] rounded-xl shadow-lg shadow-gray-200/50 overflow-hidden w-full max-w-[850px] min-h-[600px] transition-all duration-300 border border-gray-200`}>

                    {/* Sign Up Form Container */}
                    <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out left-0 flex flex-col items-center justify-center p-12 bg-[#fdfdfd]
                        ${isSignUp ? 'translate-x-full z-50' : 'z-10'}`}>
                        <form onSubmit={handleRegister} className="w-full flex flex-col items-center" noValidate>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Create Account</h2>

                            {socialButtons}

                            <span className="text-sm text-gray-500 mb-6">or use your email for registration</span>

                            <div className="w-full flex flex-col gap-4">
                                <FloatingInput
                                    label="Email"
                                    id="register-email"
                                    name="email"
                                    type="email"
                                    value={registerData.email}
                                    onChange={e => setRegisterData({ ...registerData, email: e.target.value })}
                                    className="!mb-0"
                                />
                                <FloatingInput
                                    label="Password"
                                    id="register-password"
                                    name="password"
                                    type="password"
                                    value={registerData.password}
                                    onChange={e => setRegisterData({ ...registerData, password: e.target.value })}
                                    className="!mb-0"
                                />
                                <FloatingInput
                                    label="Confirm Password"
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type="password"
                                    value={registerData.confirmPassword}
                                    onChange={e => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                    className="!mb-0"
                                />
                            </div>

                            {errors.register && (
                                <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1 mt-2 w-full text-left justify-start">
                                    <AlertCircle size={16} />
                                    {errors.register}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing Up...
                                    </>
                                ) : 'Register'}
                            </button>

                            <p className="mt-4 text-center text-xs text-gray-500">
                                By continuing, you agree to our <Link to="/terms" className="underline hover:text-black">Terms of Service</Link> and <Link to="/privacy" className="underline hover:text-black">Privacy Policy</Link>.
                            </p>
                        </form>
                    </div>

                    {/* Sign In Form Container */}
                    <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out left-0 z-20 flex flex-col items-center justify-center p-12 bg-[#fdfdfd]
                        ${isSignUp ? 'translate-x-full' : ''}`}>
                        <form onSubmit={handleLogin} className="w-full flex flex-col items-center" noValidate>
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-4">Login</h2>

                            {socialButtons}

                            <span className="text-sm text-gray-500 mb-6">or use your email account</span>

                            <div className="w-full flex flex-col gap-4">
                                <FloatingInput
                                    label="Email"
                                    id="login-email"
                                    name="email"
                                    type="text"
                                    value={loginData.email}
                                    onChange={e => setLoginData({ ...loginData, email: e.target.value })}
                                    className="!mb-0"
                                />
                                <FloatingInput
                                    label="Password"
                                    id="login-password"
                                    name="password"
                                    type="password"
                                    value={loginData.password}
                                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                                    className="!mb-0"
                                />
                            </div>

                            {errors.login && (
                                <p className="flex items-center gap-2 text-sm text-red-600 font-medium animate-fade-in pl-1 mt-2 w-full text-left justify-start">
                                    <AlertCircle size={16} />
                                    {errors.login}
                                </p>
                            )}

                            <div className="flex items-center justify-between w-full mt-4 mb-6 px-1">
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

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center items-center gap-2 rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-zinc-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging In...
                                    </>
                                ) : 'Login'}
                            </button>
                        </form>
                    </div>

                    {/* Overlay Container - Industry Standard Premium Design */}
                    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] z-[100] 
                        bg-zinc-900 text-white
                        ${isSignUp ? '-translate-x-full' : 'translate-x-0'}`}>

                        {/* Sign In Prompt (Show when on Left/Registering) */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center px-16 text-center transition-all duration-700 ease-in-out
                            ${isSignUp ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 -translate-x-[20%] pointer-events-none'}`}>
                            <h1 className="text-3xl font-bold mb-4 tracking-tight">Welcome Back!</h1>
                            <p className="text-sm mb-8 leading-relaxed text-gray-300 font-medium">
                                To keep connected with us please login with your personal info
                            </p>
                            <button
                                className="rounded-xl bg-white/10 px-8 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-white hover:text-zinc-900 transition-all duration-300 shadow-lg"
                                onClick={() => setIsSignUp(false)}
                            >
                                Login
                            </button>
                        </div>

                        {/* Sign Up Prompt (Show when on Right/Logging in) */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center px-16 text-center transition-all duration-700 ease-in-out
                            ${isSignUp ? 'opacity-0 translate-x-[20%] pointer-events-none' : 'opacity-100 translate-x-0 delay-100'}`}>
                            <h1 className="text-3xl font-bold mb-4 tracking-tight">Get started</h1>
                            <p className="text-sm mb-8 leading-relaxed text-gray-300 font-medium">
                                Join coreHub to unlock your productivity.
                            </p>
                            <button
                                className="rounded-xl bg-white/10 px-8 py-2.5 text-sm font-bold text-white uppercase tracking-wider hover:bg-white hover:text-zinc-900 transition-all duration-300 shadow-lg"
                                onClick={() => setIsSignUp(true)}
                            >
                                Register
                            </button>
                        </div>
                    </div>

                </div >
            </main >
        </div >
    );
}
