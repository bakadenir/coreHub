
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary">
            {/* Navigation */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-4 md:px-10 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Logo Icon */}
                        <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
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
                            className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary hover:bg-opacity-90 transition-colors text-white text-sm font-bold shadow-sm"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Hero Section */}
                <section className="flex flex-1 justify-center py-12 md:py-20">
                    <div className="w-full max-w-[1200px] px-4 md:px-10 flex flex-col-reverse md:flex-row items-center gap-12">
                        {/* Left Content */}
                        <div className="flex flex-col gap-6 md:w-1/2 items-start text-left">
                            <div className="flex flex-col gap-4">
                                <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-text-primary">
                                    coreHub<br />
                                    <span className="text-gray-500">Productivity, Simplified.</span>
                                </h1>
                                <p className="text-lg font-medium leading-relaxed text-text-secondary max-w-[500px]">
                                    The all-in-one workspace to master your habits, manage your schedule, capture thoughts, and organize your digital life.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-2">
                                <Link
                                    to="/register"
                                    className="flex items-center justify-center rounded-lg h-12 px-6 bg-primary hover:bg-opacity-90 text-white text-base font-bold shadow-sm transition-all"
                                >
                                    Get Started
                                </Link>
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center rounded-lg h-12 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-text-primary text-base font-bold transition-all"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                        {/* Right Image */}
                        <div className="w-full md:w-1/2">
                            <div
                                className="w-full aspect-[4/3] bg-center bg-no-repeat bg-cover rounded-xl shadow-xl border border-gray-200"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAF_rx-ZO13WaUeZASRotPg6N5hniRXV4USNvwq7bImKviX1iS-D5VG3B3XKLr6wbZsoW6KBCmDSEwexK3EF085qztjJNAKy_r-0zfk26Ooc0eGijUwxTOrkQGU0iT5zdgzLOVQnAAQwkQze9QLeH6G2nRUe_uTngLZLuUAzYl-POsfwgyUGFrU7STEXvCAxMGWWFkBYiXzOoEyfH1r0eGFRSKa-mDbIYifPoEkizPIb3mex7cqnJ09bM9ZPPHdt7QxwfOk8HeYWImP")' }}
                            >
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Section */}
                <section className="py-20 bg-gray-50 border-t border-gray-100">
                    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col gap-12">
                        <div className="flex flex-col gap-4 text-center items-center">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary max-w-[720px]">
                                Everything you need, nothing you don't
                            </h2>
                            <p className="text-lg text-text-secondary max-w-[720px]">
                                Designed for focus. Built for speed. A strict system for chaotic lives.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Feature 1 */}
                            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                                <div className="p-2 bg-gray-100 rounded-lg w-fit text-text-primary">
                                    <span className="material-icons-outlined text-[28px]">check_circle</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-text-primary">Habit Tracker</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Build consistency with daily streaks and visual progress bars.</p>
                                </div>
                            </div>
                            {/* Feature 2 */}
                            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                                <div className="p-2 bg-gray-100 rounded-lg w-fit text-text-primary">
                                    <span className="material-icons-outlined text-[28px]">calendar_today</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-text-primary">Scheduler</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Own your time with a minimal calendar and time-blocking tools.</p>
                                </div>
                            </div>
                            {/* Feature 3 */}
                            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                                <div className="p-2 bg-gray-100 rounded-lg w-fit text-text-primary">
                                    <span className="material-icons-outlined text-[28px]">description</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-text-primary">Notes</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Capture clarity in a distraction-free, markdown-enabled editor.</p>
                                </div>
                            </div>
                            {/* Feature 4 */}
                            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
                                <div className="p-2 bg-gray-100 rounded-lg w-fit text-text-primary">
                                    <span className="material-icons-outlined text-[28px]">link</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg font-bold text-text-primary">Links</h3>
                                    <p className="text-sm text-text-secondary leading-relaxed">Organize resources, bookmarks, and read-later lists for quick access.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-10 bg-white border-t border-gray-200">
                <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10 flex flex-col gap-6 items-center text-center">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-md bg-black text-white size-6">
                            <span className="material-icons-outlined text-[16px]">hub</span>
                        </div>
                        <span className="font-bold text-text-primary">coreHub</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="text-gray-400 hover:text-text-primary transition-colors">
                            <span className="material-icons-outlined text-2xl">code</span>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-text-primary transition-colors">
                            <span className="material-icons-outlined text-2xl">business_center</span>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-text-primary transition-colors">
                            <span className="material-icons-outlined text-2xl">camera_alt</span>
                        </a>
                        <a href="#" className="text-gray-400 hover:text-text-primary transition-colors">
                            <span className="material-icons-outlined text-2xl">close</span>
                        </a>
                    </div>
                    <p className="text-sm text-text-secondary">© 2024 coreHub Inc. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
