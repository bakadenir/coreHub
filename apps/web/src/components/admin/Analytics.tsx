
export default function Analytics() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Total API Requests</h3>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-icons-outlined text-sm">api</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">2.4M</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">trending_up</span>
                        +14.2% vs last month
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Avg. Session Duration</h3>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-icons-outlined text-sm">timer</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">14m 32s</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">trending_up</span>
                        +5.4% vs last month
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
                        <span className="p-2 bg-orange-50 text-orange-600 rounded-lg material-icons-outlined text-sm">storage</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">452 GB</p>
                    <p className="text-xs text-gray-500 mt-1">
                        of 2TB Total Capacity
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Usage */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Feature Adoption</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Habit Tracker', value: 85, color: 'bg-green-500' },
                            { label: 'Notes', value: 65, color: 'bg-yellow-500' },
                            { label: 'Link Manager', value: 45, color: 'bg-blue-500' },
                            { label: 'Schedule', value: 30, color: 'bg-purple-500' }
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                    <span className="text-gray-500">{item.value}% Users</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                                        style={{ width: `${item.value}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Device Distribution</h3>
                    <div className="flex items-end justify-center gap-8 h-48">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-900 rounded-t-lg relative group h-32">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">58%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Desktop</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-400 rounded-t-lg relative group h-24">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">35%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Mobile</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-t-lg relative group h-8">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">7%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Tablet</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
