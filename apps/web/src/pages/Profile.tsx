
import { Link } from 'react-router-dom';
import Header from '../components/Header';

export default function Profile() {
    return (
        <div className="flex flex-col min-h-screen bg-background-light font-sans text-text-primary">
            <Header subtitle="Profile" />

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

                <div className="w-full">
                    <h2 className="text-2xl font-bold tracking-tight mb-8 text-text-primary">My Profile</h2>

                    <div className="bg-white border border-border-light rounded-xl p-8 shadow-sm">

                        {/* Header Section */}
                        <div className="flex items-center gap-6 mb-8">
                            <img
                                alt="Profile"
                                className="h-20 w-20 rounded-full border border-gray-200 object-cover"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrvtkImsgcFS5l83m9Qx_Re3EyUYrh8vzBQojuvGNhiXmnWzOJEEQ_DuyTqeKCJPjmqs0Hk-oqUiMZWWXkVvCcaHhFNRysEUuP_-JZs63HBKDuxTNMic_HsCLS0SOJ9ZuTkuZ5C8i_ItMlbC0SWWPWMJGjxLqujqb6q9_nXKgPPKsCkogpK0fGMQ3q1FevQfOnVsiWersWtEGajIqlLIzlWDyRQvLxtcietFbGuafpeFFf3CnRMvuly57D3vSJcQ8yNYyyJnhkCrl"
                            />
                            <div>
                                <h3 className="text-lg font-bold text-text-primary">Deni Romadhon</h3>
                                <p className="text-sm text-text-secondary mb-2">Pro Member</p>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-6">
                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm">
                                    Deni Romadhon
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm">
                                    deni.romadhon@corehub.com
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <label className="block text-sm font-medium text-gray-500">Bio</label>
                                <div className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-[15px] shadow-sm min-h-[100px]">
                                    Passionate about productivity and clean design.
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
                            <Link
                                to="/settings"
                                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
                            >
                                Change Profile
                            </Link>
                        </div>
                    </div>
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
