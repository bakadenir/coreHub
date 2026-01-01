import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background-light flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gray-50/50"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            </div>

            <div className="relative z-10 text-center max-w-lg">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-[150px] md:text-[200px] font-extrabold text-gray-200 leading-none select-none">
                        404
                    </h1>
                </div>

                {/* Message */}
                <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-lg p-8 -mt-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Page Not Found
                    </h2>

                    <p className="text-gray-600 mb-8">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex gap-3 justify-center flex-wrap">
                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Go Back
                        </button>
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                        >
                            <Home size={18} />
                            Home
                        </Link>
                    </div>
                </div>

                {/* Helpful Links */}
                <div className="mt-8 text-sm text-gray-500">
                    <p className="mb-2">Looking for something?</p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/home" className="hover:text-gray-900 underline">Dashboard</Link>
                        <Link to="/notes" className="hover:text-gray-900 underline">Notes</Link>
                        <Link to="/habits" className="hover:text-gray-900 underline">Habits</Link>
                        <Link to="/donate" className="hover:text-gray-900 underline">Donate</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
