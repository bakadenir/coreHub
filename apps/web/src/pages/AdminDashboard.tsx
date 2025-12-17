import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import UserManagement from '../components/admin/UserManagement';
import { mockAdminStats, mockRecentUsers, mockActivityLogs } from '../data';
import Analytics from '../components/admin/Analytics';
import ContentModeration from '../components/admin/ContentModeration';
import AdminSettings from '../components/admin/AdminSettings';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('Overview');

    const menuItems = [
        { name: 'Overview', icon: 'dashboard' },
        { name: 'User Management', icon: 'people' },
        { name: 'Content Moderation', icon: 'gavel' },
        { name: 'Analytics', icon: 'analytics' },
        { name: 'Settings', icon: 'settings' },
    ];

    const handleLogout = () => {
        showToast('Logged out successfully', 'success');
        navigate('/');
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
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === item.name
                                ? 'bg-primary/5 text-primary'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <span className="material-icons-outlined text-[20px]">
                                {item.icon}
                            </span>
                            {item.name}
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
                        <Link to="/dashboard" className="text-sm font-medium text-primary hover:underline">
                            Go to App
                        </Link>
                    </div>
                </header>

                <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in-up">
                    {activeTab === 'Overview' && (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {mockAdminStats.map((stat, index) => (
                                    <div key={index} className="bg-white p-6 rounded-xl border border-border-light shadow-sm hover:shadow-md transition-all">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-white`}>
                                                <span className={`material-icons-outlined text-2xl ${stat.color.replace('bg-', 'text-')}`}>{stat.icon}</span>
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                        <p className="text-sm text-text-secondary">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* User Management */}
                                <div className="lg:col-span-2 bg-white rounded-xl border border-border-light shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-border-light flex justify-between items-center bg-gray-50/50">
                                        <h3 className="text-lg font-bold text-gray-900">User Management</h3>
                                        <button className="text-primary text-sm font-semibold hover:underline">View All Users</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                <tr>
                                                    <th className="px-6 py-3">User</th>
                                                    <th className="px-6 py-3">Role</th>
                                                    <th className="px-6 py-3">Status</th>
                                                    <th className="px-6 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {mockRecentUsers.map((user, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-xs mr-3">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-semibold rounded-full ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                                                user.role === 'Pro' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                                                    'bg-gray-100 text-gray-600 border border-gray-200'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <span className={`h-2 w-2 rounded-full mr-2 ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                                                <span className="text-xs text-gray-600 font-medium">{user.status}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                                <span className="material-icons-outlined">more_vert</span>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Analytics / Activity Log */}
                                <div className="lg:col-span-1 flex flex-col gap-8">
                                    <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col h-full">
                                        <div className="p-6 border-b border-border-light bg-gray-50/50">
                                            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                        </div>
                                        <div className="p-6 flex-1 overflow-y-auto">
                                            <div className="flow-root">
                                                <ul className="-mb-8">
                                                    {mockActivityLogs.map((log, idx) => (
                                                        <li key={idx}>
                                                            <div className="relative pb-8">
                                                                {idx !== mockActivityLogs.length - 1 ? (
                                                                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                                                ) : null}
                                                                <div className="relative flex space-x-3">
                                                                    <div>
                                                                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white ${log.action.includes('Backup') ? 'bg-green-100 text-green-600' :
                                                                            log.action.includes('Failed') ? 'bg-red-100 text-red-600' :
                                                                                'bg-blue-100 text-blue-600'
                                                                            }`}>
                                                                            <span className="material-icons-outlined text-sm">
                                                                                {log.action.includes('Backup') ? 'cloud_upload' : log.action.includes('Failed') ? 'warning' : 'person'}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                        <div>
                                                                            <p className="text-sm text-gray-500">
                                                                                <span className="font-medium text-gray-900">{log.action}</span>
                                                                                {' '}by <span className="font-medium text-gray-900">{log.user}</span>
                                                                            </p>
                                                                        </div>
                                                                        <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                                                            <time>{log.time}</time>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                    }

                    {activeTab === 'User Management' && <UserManagement />}
                    {activeTab === 'Analytics' && <Analytics />}
                    {activeTab === 'Content Moderation' && <ContentModeration />}
                    {activeTab === 'Settings' && <AdminSettings />}

                </div >
            </main >
        </div >
    );
}
