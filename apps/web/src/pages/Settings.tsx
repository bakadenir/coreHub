
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Settings() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary">
            <Header subtitle="Settings" />

            <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 flex-grow">

                {/* Back to Dashboard Control */}
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors hover:translate-x-[-4px] duration-200"
                    >
                        <span className="material-icons-outlined text-base">arrow_back</span>
                        Back to Dashboard
                    </Link>
                </div>

                <div className="flex flex-col gap-12">
                    {/* Profile Settings Section */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">Profile Settings</h2>

                        <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
                            {/* Profile Header */}
                            <div className="flex items-center gap-6 mb-8">
                                <img
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrvtkImsgcFS5l83m9Qx_Re3EyUYrh8vzBQojuvGNhiXmnWzOJEEQ_DuyTqeKCJPjmqs0Hk-oqUiMZWWXkVvCcaHhFNRysEUuP_-JZs63HBKDuxTNMic_HsCLS0SOJ9ZuTkuZ5C8i_ItMlbC0SWWPWMJGjxLqujqb6q9_nXKgPPKsCkogpK0fGMQ3q1FevQfOnVsiWersWtEGajIqlLIzlWDyRQvLxtcietFbGuafpeFFf3CnRMvuly57D3vSJcQ8yNYyyJnhkCrl"
                                />
                                <div>
                                    <h3 className="text-lg font-bold text-text-primary">Deni Romadhon</h3>
                                    <p className="text-sm text-text-secondary mb-2">Pro Member</p>
                                    <button className="text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                                        Change Photo
                                    </button>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                    <input
                                        type="text"
                                        defaultValue="Deni Romadhon"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                    <input
                                        type="email"
                                        defaultValue="deni.romadhon@corehub.com"
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                    />
                                </div>

                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Bio</label>
                                    <textarea
                                        defaultValue="Passionate about productivity and clean design."
                                        rows={3}
                                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-light">
                                <button className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    Cancel
                                </button>
                                <button className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Security Settings Section (Password & Username) */}
                    <section>
                        <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">Security & Login</h2>

                        <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">
                            <div className="space-y-6">
                                <div className="space-y-2.5">
                                    <label className="block text-sm font-medium text-gray-500">Username</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-[15px]">
                                            corehub.com/
                                        </span>
                                        <input
                                            type="text"
                                            defaultValue="deniromadhon"
                                            className="w-full bg-white border border-gray-300 rounded-r-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 pt-6"></div>

                                <div>
                                    <h4 className="text-base font-bold text-text-primary mb-4">Change Password</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2.5">
                                            <label className="block text-sm font-medium text-gray-500">Current Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                            />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="space-y-2.5">
                                                <label className="block text-sm font-medium text-gray-500">New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2.5">
                                                <label className="block text-sm font-medium text-gray-500">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border-light">
                                <button className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5">
                                    Update Security
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="w-full border-t border-border-light py-8 text-center text-sm text-gray-500 font-mono mt-12 bg-gray-50">
                <p>© 2025 coreHub. All rights reserved.</p>
                <div className="mt-2 flex justify-center gap-4">
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Privacy</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Terms</a>
                    <a className="hover:text-black underline decoration-1 underline-offset-2" href="#">Contact</a>
                </div>
            </footer>
        </div>
    );
}
