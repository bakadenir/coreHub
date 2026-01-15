export default function TermsOfService() {
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
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Terms of Service</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
                    <p className="text-gray-500 mb-8">Last updated: January 15, 2026</p>

                    <div className="prose prose-gray max-w-none space-y-8">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Welcome to coreHub. These Terms of Service ("Terms") govern your use of our productivity application
                                and services. By accessing or using coreHub, you agree to be bound by these Terms. If you do not
                                agree with any part of these Terms, you may not use our services.
                            </p>
                        </section>

                        {/* Service Description */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Service Description</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                coreHub is a personal productivity platform that provides the following features:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Notes:</strong> Create, edit, organize, pin, and share notes publicly with unique URLs</li>
                                <li><strong>Links:</strong> Save and manage bookmarks with automatic metadata fetching</li>
                                <li><strong>Habits:</strong> Track daily and weekly habits with completion tracking and streaks</li>
                                <li><strong>Schedule:</strong> Manage calendar events and appointments</li>
                                <li><strong>Todos:</strong> Organize tasks with smart lists, priorities, subtasks, and due dates</li>
                                <li><strong>Pomodoro Timer:</strong> Focus timer with customizable work/break intervals</li>
                                <li><strong>Dashboard:</strong> Customizable widgets for quick access to your data</li>
                                <li><strong>Notifications:</strong> In-app notification system for reminders and updates</li>
                            </ul>
                        </section>

                        {/* User Accounts */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                To use coreHub, you must create an account. You are responsible for:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Providing accurate and up-to-date information</li>
                                <li>Notifying us immediately of any unauthorized access</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                We reserve the right to suspend or terminate accounts that violate these Terms or engage in
                                suspicious activities.
                            </p>
                        </section>

                        {/* Acceptable Use */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                You agree not to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Use the service for any illegal or unauthorized purpose</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Upload malicious content or spam</li>
                                <li>Interfere with or disrupt the service</li>
                                <li>Share your account credentials with others</li>
                                <li>Scrape or collect data from other users</li>
                            </ul>
                        </section>

                        {/* User Content */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. User Content</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                You retain ownership of all content you create within coreHub (notes, links, habits, schedules, todos).
                                By using our service, you grant us a limited license to store, process, and display your content
                                solely for the purpose of providing the service to you. We do not claim ownership of your content
                                and will not share it with third parties except as required by law.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                <strong>Public Sharing:</strong> When you choose to make a note public, you are granting permission
                                for anyone with the link to view that content. You can revoke public access at any time. You are
                                responsible for ensuring that publicly shared content does not violate any laws or third-party rights.
                            </p>
                        </section>

                        {/* Donations */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Donations</h2>
                            <p className="text-gray-600 leading-relaxed">
                                coreHub offers a voluntary donation feature to support development. Donations are processed
                                through Midtrans, a third-party payment provider. All donations are non-refundable unless
                                required by law. By making a donation, you agree to Midtrans's terms of service and privacy policy.
                            </p>
                        </section>

                        {/* Service Availability */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Service Availability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We strive to maintain high availability but cannot guarantee uninterrupted service. We may
                                temporarily suspend the service for maintenance, updates, or security reasons. We are not liable
                                for any loss or damage resulting from service interruptions.
                            </p>
                        </section>

                        {/* Limitation of Liability */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
                            <p className="text-gray-600 leading-relaxed">
                                coreHub is provided "as is" without warranties of any kind. We are not liable for any indirect,
                                incidental, special, or consequential damages arising from your use of the service. Our total
                                liability shall not exceed the amount you have paid to us, if any, in the past twelve months.
                            </p>
                        </section>

                        {/* Changes to Terms */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update these Terms from time to time. We will notify you of significant changes via email
                                or through the application. Your continued use of coreHub after changes take effect constitutes
                                your acceptance of the revised Terms.
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about these Terms, please contact us at{' '}
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
