export default function CookiePolicy() {
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
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Cookie Policy</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
                    <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

                    <div className="prose prose-gray max-w-none space-y-8">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                This Cookie Policy explains how coreHub uses cookies and similar technologies to recognize
                                you when you visit our application. It explains what these technologies are and why we use them,
                                as well as your rights to control our use of them.
                            </p>
                        </section>

                        {/* What Are Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. What Are Cookies?</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Cookies are small data files that are placed on your computer or mobile device when you visit
                                a website. They are widely used to make websites work more efficiently and provide reporting information.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Cookies set by the website owner (in this case, coreHub) are called "first-party cookies."
                                Cookies set by parties other than the website owner are called "third-party cookies."
                            </p>
                        </section>

                        {/* Types of Cookies We Use */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Types of Cookies We Use</h2>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">3.1 Essential Cookies</h3>
                            <p className="text-gray-600 leading-relaxed mb-2">
                                These cookies are strictly necessary for the application to function. They include:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Authentication tokens:</strong> To keep you logged in securely</li>
                                <li><strong>Session cookies:</strong> To maintain your session state</li>
                                <li><strong>Security cookies:</strong> To prevent fraud and protect your account</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">3.2 Functional Cookies</h3>
                            <p className="text-gray-600 leading-relaxed mb-2">
                                These cookies enable enhanced functionality and personalization:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Theme preferences:</strong> Remember your light/dark mode setting</li>
                                <li><strong>Layout preferences:</strong> Remember your dashboard widget configuration</li>
                                <li><strong>Notification settings:</strong> Remember your notification preferences</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">3.3 Analytics Cookies</h3>
                            <p className="text-gray-600 leading-relaxed">
                                We may use analytics cookies to understand how visitors interact with coreHub. This helps us
                                improve our service. These cookies collect information anonymously.
                            </p>
                        </section>

                        {/* Local Storage */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Local Storage</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                In addition to cookies, coreHub uses browser local storage for:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Caching user data for faster load times</li>
                                <li>Storing Pomodoro timer settings and session data</li>
                                <li>Keeping unsaved content drafts (auto-save)</li>
                                <li>Remembering UI state and preferences</li>
                            </ul>
                        </section>

                        {/* Third-Party Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Cookies</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We use the following third-party services that may set cookies:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Supabase:</strong> Authentication and session management</li>
                                <li><strong>Midtrans:</strong> Payment processing (only during donation transactions)</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                These third parties have their own cookie policies. We encourage you to review them.
                            </p>
                        </section>

                        {/* Cookie Duration */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookie Duration</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Cookies can remain on your device for different periods:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                                <li><strong>Persistent cookies:</strong> Remain until they expire or you delete them (typically 7-30 days for auth tokens)</li>
                            </ul>
                        </section>

                        {/* Your Choices */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Choices</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                You have several options for managing cookies:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Browser settings:</strong> Most browsers allow you to refuse or delete cookies</li>
                                <li><strong>Logout:</strong> Logging out will clear your session cookies</li>
                                <li><strong>Clear storage:</strong> You can clear local storage through your browser's developer tools</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                <strong>Note:</strong> Blocking essential cookies will prevent you from using coreHub, as they are
                                required for authentication and core functionality.
                            </p>
                        </section>

                        {/* We Don't Use */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. What We Don't Do</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                coreHub does <strong>not</strong> use cookies for:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Advertising or ad targeting</li>
                                <li>Tracking you across other websites</li>
                                <li>Selling data to third parties</li>
                                <li>Creating advertising profiles</li>
                            </ul>
                        </section>

                        {/* Updates */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Updates to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements.
                                Any changes will be posted on this page with an updated "Last updated" date.
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about our use of cookies, please contact us at{' '}
                                <a href="mailto:bakadenir@gmail.com" className="text-primary hover:underline">bakadenir@gmail.com</a>{' '}
                                or visit our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
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
