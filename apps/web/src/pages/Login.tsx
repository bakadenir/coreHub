
import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col transition-colors duration-300">
            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
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
            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h2>
                            <p className="mt-2 text-sm text-gray-500">Please enter your details to sign in.</p>
                        </div>
                        <form action="#" className="space-y-5" method="POST">
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="email">Email or Username</label>
                                <input
                                    autoComplete="email"
                                    className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                                    id="email"
                                    name="email"
                                    required
                                    type="text"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2" htmlFor="password">Password</label>
                                <input
                                    autoComplete="current-password"
                                    className="block w-full rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-2.5 transition-shadow"
                                    id="password"
                                    name="password"
                                    required
                                    type="password"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                    />
                                    <label className="ml-2 block text-sm text-gray-600 cursor-pointer select-none" htmlFor="remember-me">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a className="font-medium text-primary hover:underline decoration-1 underline-offset-2" href="#">Forgot Password?</a>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    className="flex w-full justify-center rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                                    type="submit"
                                >
                                    Login
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
            <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-transparent">
                © 2025 coreHub. All rights reserved.
            </footer>
        </div>
    );
}
