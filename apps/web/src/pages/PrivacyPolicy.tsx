export default function PrivacyPolicy() {
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
                        <span className="text-sm text-gray-500 font-medium hidden sm:block">Privacy Policy</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-3xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                    <p className="text-gray-500 mb-8">Last updated: December 26, 2025</p>

                    <div className="prose prose-gray max-w-none space-y-8">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
                            <p className="text-gray-600 leading-relaxed">
                                At coreHub, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                                store, and protect your personal information when you use our productivity application. By using
                                coreHub, you consent to the data practices described in this policy.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.1 Account Information</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Email address (for authentication and communication)</li>
                                <li>Display name (optional, for personalization)</li>
                                <li>Profile picture (optional, stored securely)</li>
                                <li>Account preferences and settings</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.2 User Content</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Notes and their content</li>
                                <li>Saved links and bookmarks</li>
                                <li>Habit tracking data and completion history</li>
                                <li>Schedule events and appointments</li>
                                <li>Dashboard widget configurations</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 mb-2 mt-4">2.3 Technical Information</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Browser type and version</li>
                                <li>Device information</li>
                                <li>IP address (for security purposes)</li>
                                <li>Usage patterns and session data</li>
                            </ul>
                        </section>

                        {/* How We Use Your Information */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We use your information to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Provide and maintain the coreHub service</li>
                                <li>Authenticate your identity and secure your account</li>
                                <li>Sync your data across devices</li>
                                <li>Send important service notifications</li>
                                <li>Improve our application and user experience</li>
                                <li>Provide customer support</li>
                            </ul>
                        </section>

                        {/* Data Storage and Security */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Storage and Security</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                Your data is stored on secure servers provided by Supabase, a trusted cloud infrastructure provider.
                                We implement industry-standard security measures including:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Encrypted data transmission (HTTPS/TLS)</li>
                                <li>Encrypted data storage at rest</li>
                                <li>Secure authentication with JWT tokens</li>
                                <li>Regular security audits and updates</li>
                                <li>Access controls and authentication requirements</li>
                            </ul>
                        </section>

                        {/* Third-Party Services */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Third-Party Services</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We use the following third-party services:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Supabase:</strong> Authentication and database services</li>
                                <li><strong>Midtrans:</strong> Payment processing for donations</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                These services have their own privacy policies. We encourage you to review them. We only share
                                the minimum information necessary for these services to function.
                            </p>
                        </section>

                        {/* Data Sharing */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Sharing</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                We do <strong>not</strong> sell, rent, or trade your personal information. We may share your data only:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>When required by law or legal process</li>
                                <li>To protect our rights or prevent fraud</li>
                                <li>With service providers who assist in operating coreHub (under strict confidentiality)</li>
                            </ul>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
                            <p className="text-gray-600 leading-relaxed mb-3">
                                You have the right to:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li><strong>Access:</strong> View all data we have about you</li>
                                <li><strong>Edit:</strong> Update or correct your personal information</li>
                                <li><strong>Delete:</strong> Request deletion of your account and all associated data</li>
                                <li><strong>Export:</strong> Download your data in a portable format</li>
                                <li><strong>Withdraw consent:</strong> Stop using our services at any time</li>
                            </ul>
                            <p className="text-gray-600 leading-relaxed mt-3">
                                To exercise these rights, visit your account settings or contact us directly.
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies and Local Storage</h2>
                            <p className="text-gray-600 leading-relaxed">
                                coreHub uses cookies and local storage to maintain your session, remember your preferences,
                                and provide a seamless experience. These are essential for the application to function properly.
                                We do not use tracking cookies for advertising purposes.
                            </p>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Data Retention</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We retain your data for as long as your account is active. If you delete your account,
                                we will permanently remove all your personal data within 30 days, except where retention
                                is required by law or for legitimate business purposes (such as fraud prevention).
                            </p>
                        </section>

                        {/* Children's Privacy */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Children's Privacy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                coreHub is not intended for users under the age of 13. We do not knowingly collect personal
                                information from children. If you believe a child has provided us with personal information,
                                please contact us immediately.
                            </p>
                        </section>

                        {/* Changes to Policy */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to This Policy</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes
                                via email or through the application. The "Last updated" date at the top of this page indicates
                                when the policy was last revised.
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact Us</h2>
                            <p className="text-gray-600 leading-relaxed">
                                If you have any questions about this Privacy Policy or our data practices, please contact us
                                through the support section in your account settings or via our official communication channels.
                            </p>
                        </section>
                    </div>

                    {/* Back Link */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <a href="/" className="text-primary hover:underline font-medium">
                            ← Back to Home
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
