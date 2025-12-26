
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CookieConsent from '../components/CookieConsent';

export default function Landing() {
    const navigate = useNavigate();
    const { user, isLoading } = useAuth();

    // Redirect to dashboard if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            navigate('/home', { replace: true });
        }
    }, [user, isLoading, navigate]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render landing page if user is logged in (prevents flash)
    if (user) {
        return null;
    }

    return (
        <div className="flex flex-col min-h-screen font-sans text-text-primary relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
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

            {/* Navigation */}
            <header className="w-full border-b border-gray-200/50 bg-white/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo Icon */}
                        <div className="flex items-center justify-center rounded-lg bg-black text-white size-8 shadow-lg shadow-black/10">
                            <span className="material-icons-outlined text-[20px]">hub</span>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-tight text-text-primary">coreHub</h2>
                    </div>
                    {/* Desktop Navigation */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link className="text-sm font-medium hover:text-primary transition-colors text-text-primary" to="/login">
                            Login
                        </Link>
                        <Link
                            to="/register"
                            className="flex items-center justify-center rounded-lg h-9 px-4 bg-black hover:bg-gray-800 transition-all text-white text-sm font-bold shadow-md hover:shadow-lg hover:translate-y-[-1px]"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col relative z-10">
                {/* Hero Section */}
                <section className="flex flex-1 justify-center py-12 md:py-24">
                    <div className="w-full max-w-[1200px] px-4 md:px-10 flex flex-col items-center md:flex-row gap-12">
                        <div className="flex flex-col gap-6 items-start text-left md:w-1/2">
                            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight text-text-primary drop-shadow-sm">
                                Productivity, <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500">Simplified.</span>
                            </h1>
                            <p className="text-xl font-medium leading-relaxed text-text-secondary max-w-[600px]">
                                The all-in-one workspace to master your habits, manage your schedule, and capture clarity.
                            </p>

                            <div className="flex flex-wrap gap-4 mt-4">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center rounded-xl h-14 px-8 bg-black hover:bg-gray-800 text-white text-lg font-bold shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center rounded-xl h-14 px-8 bg-white border border-gray-200 hover:bg-gray-50 text-text-primary text-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>

                        {/* Hero Image / Dashboard Preview */}
                        <div className="w-full md:w-1/2 mt-8 md:mt-0 relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                            <div
                                className="relative w-full aspect-[16/10] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                            >
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAF_rx-ZO13WaUeZASRotPg6N5hniRXV4USNvwq7bImKviX1iS-D5VG3B3XKLr6wbZsoW6KBCmDSEwexK3EF085qztjJNAKy_r-0zfk26Ooc0eGijUwxTOrkQGU0iT5zdgzLOVQnAAQwkQze9QLeH6G2nRUe_uTngLZLuUAzYl-POsfwgyUGFrU7STEXvCAxMGWWFkBYiXzOoEyH1r0eGFRSKa-mDbIYifPoEkizPIb3mex7cqnJ09bM9ZPPHdt7QxwfOk8HeYWImP"
                                    alt="Dashboard Preview"
                                    className="w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-700"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Section */}
                <section className="py-24 bg-white/50 border-t border-gray-200/50 backdrop-blur-sm">
                    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col gap-16">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary max-w-[800px]">
                                Your brain, <span className="text-gray-400">organized</span>.
                            </h2>
                            <p className="text-lg text-text-secondary max-w-[600px]">
                                Stop switching between 4 different apps. coreHub gives you a unified system to track everything that matters.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-800 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                    <span className="material-icons-outlined text-[24px]">check_circle</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-lg font-bold text-gray-900">Habit Tracker</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Build steel-strong habits with visual streaks and daily targets.</p>
                                </div>
                            </div>
                            {/* Feature 2 */}
                            <div className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-800 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                    <span className="material-icons-outlined text-[24px]">calendar_today</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-lg font-bold text-gray-900">Smart Schedule</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Time-block your day effortlessly and never miss a beat.</p>
                                </div>
                            </div>
                            {/* Feature 3 */}
                            <div className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-800 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                    <span className="material-icons-outlined text-[24px]">edit_note</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-lg font-bold text-gray-900">Quick Notes</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Capture fleeting thoughts instantly in a distraction-free editor.</p>
                                </div>
                            </div>
                            {/* Feature 4 */}
                            <div className="group flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
                                <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg text-gray-800 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                    <span className="material-icons-outlined text-[24px]">link</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <h3 className="text-lg font-bold text-gray-900">Link Vault</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">Save resources and bookmarks for later reading and reference.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-10 bg-white border-t border-gray-200 relative z-10">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col gap-6 items-center text-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-md bg-black text-white size-6">
                            <span className="material-icons-outlined text-[16px]">hub</span>
                        </div>
                        <span className="font-bold text-text-primary">coreHub</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="https://github.com/bakadenir" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-text-primary transition-colors" title="GitHub">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </a>
                        <a href="https://www.instagram.com/bakadenir/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-text-primary transition-colors" title="Instagram">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                        <a href="https://www.linkedin.com/in/bakadenir/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-text-primary transition-colors" title="LinkedIn">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                        <a href="https://x.com/bakadenir" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-text-primary transition-colors" title="X (Twitter)">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                    </div>
                    <p className="text-sm text-text-secondary">© 2025 coreHub. All rights reserved. Code with <a href="https://www.linkedin.com/in/bakadenir/" target="_blank" rel="noopener noreferrer" className="hover:underline">bakadenir</a></p>
                </div>
            </footer>

            {/* Cookie Consent Banner */}
            <CookieConsent />
        </div>
    );
}
