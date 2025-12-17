import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import UserManagement from '../components/admin/UserManagement';
import Analytics from '../components/admin/Analytics';
import ContentModeration from '../components/admin/ContentModeration';
import AdminSettings from '../components/admin/AdminSettings';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');

    // Mock Data for Overview only
    const stats = [
        { label: 'Total Users', value: '12,450', change: '+12%', icon: 'people', color: 'bg-blue-500' },
        { label: 'Active Habits', value: '45,200', change: '+5%', icon: 'check_circle', color: 'bg-green-500' },
        { label: 'Total Notes', value: '8,930', change: '+18%', icon: 'description', color: 'bg-purple-500' },
        { label: 'Server Load', value: '24%', change: '-2%', icon: 'dns', color: 'bg-orange-500' },
    ];

    const recentUsers = [
        { name: 'Alex Johnson', email: 'alex@example.com', role: 'User', status: 'Active', date: '2 mins ago' },
        { name: 'Sarah Connor', email: 'sarah@example.com', role: 'Pro', status: 'Active', date: '15 mins ago' },
        { name: 'Mike Ross', email: 'mike@example.com', role: 'User', status: 'Offline', date: '1 hour ago' },
        { name: 'Jessica Pearson', email: 'jessica@example.com', role: 'Admin', status: 'Active', date: '3 hours ago' },
        { name: 'Harvey Specter', email: 'harvey@example.com', role: 'Pro', status: 'Active', date: '5 hours ago' },
    ];

    const activityLogs = [
        { action: 'New User Registered', user: 'Alex Johnson', time: '10:42 AM' },
        { action: 'System Backup Completed', user: 'System', time: '04:00 AM' },
        { action: 'Database Optimized', user: 'System', time: '03:30 AM' },
        { action: 'Failed Login Attempt', user: 'Unknown IP', time: 'Yesterday' },
    ];

    const handleLogout = () => {
        showToast('Logged out successfully', 'success');
        navigate('/landing');
    };

    return (
        <div className="bg-background-light text-gray-900 font-sans antialiased min-h-screen flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-20">
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center rounded-lg bg-black text-white size-8">
                            <span className="material-icons-outlined text-[20px]">admin_panel_settings</span>
                        </div>
                        <h1 className="text-lg font-bold tracking-tight text-gray-900">AdminPanel</h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {['Overview', 'User Management', 'Content Moderation', 'Analytics', 'Settings'].map((item) => (
                        <button
                            key={item}
                            onClick={() => setActiveTab(item)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === item
                                ? 'bg-primary/5 text-primary'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="material-icons-outlined text-[20px]">
                                {item === 'Overview' && 'dashboard'}
                                {item === 'User Management' && 'people'}
                                {item === 'Content Moderation' && 'gavel'}
                                {item === 'Analytics' && 'analytics'}
                                {item === 'Settings' && 'settings'}
                            </span>
                            {item}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                            <p className="text-xs text-gray-500 truncate">admin@corehub.dev</p>
                        </div>
                        <button onClick={handleLogout} className="text-gray-400 hover:text-red-600 transition-colors">
                            <span className="material-icons-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:pl-64 flex flex-col min-h-screen">
                {/* Header */}
                <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-900">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="material-icons-outlined">notifications</span>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <Link to="/" className="text-sm font-medium text-primary hover:underline">
                            Go to App
                        </Link>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat) => (
                                    <div key={stat.label} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-${stat.color.replace('bg-', '')}`}>
                                                <span className={`material-icons-outlined text-${stat.color.replace('bg-', '')}700`}>{stat.icon}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                        <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Main Chart Section (Mock) */}
                                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
                                        <select className="text-sm border-gray-200 rounded-lg text-gray-500 focus:ring-black focus:border-black">
                                            <option>Last 7 Days</option>
                                            <option>Last Month</option>
                                            <option>Last Year</option>
                                        </select>
                                    </div>
                                    <div className="h-64 flex items-end gap-2 sm:gap-4">
                                        {[35, 45, 30, 60, 75, 50, 65, 80, 70, 85, 90, 60].map((height, i) => (
                                            <div key={i} className="flex-1 flex flex-col justify-end group">
                                                <div
                                                    className="w-full bg-gray-100 rounded-t-md group-hover:bg-primary transition-all duration-500 relative"
                                                    style={{ height: `${height}%` }}
                                                >
                                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded transition-opacity whitespace-nowrap z-10">
                                                        {height * 12} Users
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-xs text-gray-400 font-mono">
                                        <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                                        <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                                    </div>
                                </div>

                                {/* Activity Logs */}
                                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
                                    <div className="space-y-6">
                                        {activityLogs.map((log, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="relative">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                                                    {index !== activityLogs.length - 1 && (
                                                        <div className="absolute top-4 left-1 w-px h-full bg-gray-200"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">by {log.user}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{log.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Users Table */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Registrations</h3>
                                    <button className="text-sm font-medium text-primary hover:text-primary/80">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                                <th className="pb-3 pl-2 font-medium">User</th>
                                                <th className="pb-3 font-medium">Role</th>
                                                <th className="pb-3 font-medium">Status</th>
                                                <th className="pb-3 font-medium">Joined</th>
                                                <th className="pb-3 pr-2 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {recentUsers.map((user, index) => (
                                                <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 pl-2 border-b border-gray-50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                                <p className="text-xs text-gray-500">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 border-b border-gray-50 text-gray-600">{user.role}</td>
                                                    <td className="py-4 border-b border-gray-50">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {user.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 border-b border-gray-50 text-gray-500 font-mono text-xs">{user.date}</td>
                                                    <td className="py-4 pr-2 border-b border-gray-50 text-right">
                                                        <button className="text-gray-400 hover:text-black p-1 transition-colors">
                                                            <span className="material-icons-outlined text-[18px]">more_vert</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'User Management' && <UserManagement />}
                    {activeTab === 'Analytics' && <Analytics />}
                    {activeTab === 'Content Moderation' && <ContentModeration />}
                    {activeTab === 'Settings' && <AdminSettings />}

                </div>
            </main>
        </div>
    );
}
