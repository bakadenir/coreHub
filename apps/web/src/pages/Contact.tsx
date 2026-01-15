import { Mail, Instagram, Linkedin, Github, MessageCircle, Globe } from 'lucide-react';

export default function Contact() {
    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex flex-col">
            {/* Header */}
            <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="/" className="flex items-center gap-2 select-none cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex items-center justify-center rounded-lg bg-zinc-900 text-white size-8 shadow-md">
                                <span className="material-icons-outlined text-[20px]">hub</span>
                            </div>
                            <h1 className="text-xl font-bold tracking-tight text-text-primary">coreHub</h1>
                        </a>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Contact</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
                    <p className="text-gray-500 mb-8">Get in touch with the coreHub team</p>

                    <div className="space-y-8">
                        {/* Introduction */}
                        <section className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
                            <p className="text-gray-600 leading-relaxed">
                                Hi there! 👋 I'm <strong>Deni Romadhon</strong>, the creator and developer of coreHub.
                                I built this productivity app to help people organize their lives more effectively.
                                If you have any questions, feedback, feature requests, or just want to say hello,
                                feel free to reach out through any of the channels below.
                            </p>
                        </section>

                        {/* Contact Methods */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get In Touch</h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Email */}
                                <a
                                    href="mailto:bakadenir@gmail.com"
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                                        <Mail className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Email</p>
                                        <p className="text-sm text-gray-500">bakadenir@gmail.com</p>
                                    </div>
                                </a>

                                {/* Instagram */}
                                <a
                                    href="https://instagram.com/bakadenir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-pink-50 rounded-xl group-hover:bg-pink-100 transition-colors">
                                        <Instagram className="w-6 h-6 text-pink-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Instagram</p>
                                        <p className="text-sm text-gray-500">@bakadenir</p>
                                    </div>
                                </a>

                                {/* LinkedIn */}
                                <a
                                    href="https://linkedin.com/in/bakadenir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                                        <Linkedin className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">LinkedIn</p>
                                        <p className="text-sm text-gray-500">bakadenir</p>
                                    </div>
                                </a>

                                {/* GitHub */}
                                <a
                                    href="https://github.com/bakadenir"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl group-hover:bg-gray-200 transition-colors">
                                        <Github className="w-6 h-6 text-gray-800" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">GitHub</p>
                                        <p className="text-sm text-gray-500">bakadenir</p>
                                    </div>
                                </a>
                            </div>
                        </section>

                        {/* Response Time */}
                        <section className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-1">Response Time</h3>
                                    <p className="text-sm text-gray-600">
                                        I typically respond within 24-48 hours during weekdays. For urgent matters,
                                        email is the best way to reach me. For general feedback or feature requests,
                                        feel free to use any platform you're comfortable with.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* What to Reach Out About */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Can I Help With?</h2>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">🐛</span>
                                    <span className="text-gray-700">Bug reports & issues</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">💡</span>
                                    <span className="text-gray-700">Feature requests</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">❓</span>
                                    <span className="text-gray-700">General questions</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">🤝</span>
                                    <span className="text-gray-700">Collaboration opportunities</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">📝</span>
                                    <span className="text-gray-700">Feedback & suggestions</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-lg">💼</span>
                                    <span className="text-gray-700">Business inquiries</span>
                                </div>
                            </div>
                        </section>

                        {/* Project Info */}
                        <section className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Globe className="w-5 h-5 text-zinc-400" />
                                <h3 className="font-semibold">About This Project</h3>
                            </div>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                                coreHub is a personal productivity platform designed to help you manage your notes,
                                habits, schedules, todos, and links all in one place. It's built with modern web technologies
                                including React, TypeScript, Node.js, and Supabase.
                            </p>
                            <p className="text-zinc-400 text-sm">
                                If you enjoy using coreHub, consider{' '}
                                <a href="/donate" className="text-blue-400 hover:text-blue-300 hover:underline">supporting the project</a>!
                            </p>
                        </section>
                    </div>

                    {/* Back Link */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <a href="/" className="text-primary hover:underline font-medium">
                            ← Back to coreHub
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full text-center py-6 text-xs text-gray-400 border-t border-gray-200">
                © 2025 coreHub. All rights reserved.
            </footer>
        </div>
    );
}
