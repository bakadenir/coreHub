
import { Link } from 'react-router-dom';

interface HeaderProps {
    subtitle?: string;
}

export default function Header({ subtitle = 'Productivity, Simplified' }: HeaderProps) {

    return (
        <header className="w-full border-b border-gray-200 bg-background-light/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
                            <span className="material-icons-outlined text-[20px]">hub</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-text-primary">
                            coreHub
                        </h1>
                    </div>
                    <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block"></div>
                    <span className="text-sm text-gray-500 font-medium hidden sm:block">
                        {subtitle}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Notification Dropdown */}
                    <div className="relative group">
                        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                            <span className="material-icons-outlined text-gray-500 text-2xl">notifications</span>
                            <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="absolute top-full right-[-80px] md:right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                <span className="text-xs text-primary font-medium cursor-pointer hover:underline">Mark all as read</span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto">
                                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                    <div className="p-2 rounded-full bg-blue-50 text-blue-600 shrink-0">
                                        <span className="material-icons-outlined text-sm">event</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Weekly Design Sync</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Today at 10:00 AM</p>
                                    </div>
                                </div>
                                <div className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                    <div className="p-2 rounded-full bg-green-50 text-green-600 shrink-0">
                                        <span className="material-icons-outlined text-sm">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Drink Water Reminder</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Habit pending for this hour</p>
                                    </div>
                                </div>
                                <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer items-start flex gap-3">
                                    <div className="p-2 rounded-full bg-purple-50 text-purple-600 shrink-0">
                                        <span className="material-icons-outlined text-sm">description</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New AI Insights Available</p>
                                        <p className="text-xs text-gray-500 mt-0.5">For "Project Everest" note</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group relative">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-gray-900 leading-none">
                                Deni Romadhon
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Pro Member
                            </p>
                        </div>
                        <img
                            alt="Profile"
                            className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrvtkImsgcFS5l83m9Qx_Re3EyUYrh8vzBQojuvGNhiXmnWzOJEEQ_DuyTqeKCJPjmqs0Hk-oqUiMZWWXkVvCcaHhFNRysEUuP_-JZs63HBKDuxTNMic_HsCLS0SOJ9ZuTkuZ5C8i_ItMlbC0SWWPWMJGjxLqujqb6q9_nXKgPPKsCkogpK0fGMQ3q1FevQfOnVsiWersWtEGajIqlLIzlWDyRQvLxtcietFbGuafpeFFf3CnRMvuly57D3vSJcQ8yNYyyJnhkCrl"
                        />
                        <span className="material-icons-outlined text-gray-500 group-hover:text-primary transition-colors">
                            expand_more
                        </span>
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                            <Link
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                                to="/profile"
                            >
                                <span className="material-icons-outlined text-lg">person</span>
                                Profile
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                to="/settings"
                            >
                                <span className="material-icons-outlined text-lg">settings</span>
                                Settings
                            </Link>
                            <Link
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                to="/donate"
                            >
                                <span className="material-icons-outlined text-lg">volunteer_activism</span>
                                Donate
                            </Link>
                            <div className="h-px bg-gray-200 my-1"></div>
                            <a
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                                href="#"
                            >
                                <span className="material-icons-outlined text-lg">logout</span>
                                Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
