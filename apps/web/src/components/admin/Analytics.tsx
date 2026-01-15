interface AnalyticsProps {
    data?: {
        adoption: { label: string; value: number; color: string }[];
        storage: { used: string; total: string; percent: number };
    };
}

export default function Analytics({ data }: AnalyticsProps) {
    const adoption = data?.adoption || [
        { label: 'Habit Tracker', value: 0, color: 'bg-green-500' },
        { label: 'Notes', value: 0, color: 'bg-yellow-500' },
        { label: 'Link Manager', value: 0, color: 'bg-blue-500' },
        { label: 'Schedule', value: 0, color: 'bg-purple-500' }
    ];

    const storage = data?.storage || { used: '0 MB', total: '2 GB', percent: 0 };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Top Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#fdfdfd] p-6 rounded-xl border border-gray-200 shadow-sm opacity-60">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Total API Requests (Est)</h3>
                        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-icons-outlined text-sm">api</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-gray-500 mt-1">Not tracked yet</p>
                </div>
                <div className="bg-[#fdfdfd] p-6 rounded-xl border border-gray-200 shadow-sm opacity-60">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Avg. Session Duration</h3>
                        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg material-icons-outlined text-sm">timer</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-xs text-gray-500 mt-1">Not tracked yet</p>
                </div>
                <div className="bg-[#fdfdfd] p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-500">Storage Used</h3>
                        <span className="p-2 bg-orange-50 text-orange-600 rounded-lg material-icons-outlined text-sm">storage</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{storage.used}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        of {storage.total} Total Capacity
                    </p>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: `${storage.percent}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feature Usage */}
                <div className="bg-[#fdfdfd] p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Feature Adoption</h3>
                    <div className="space-y-4">
                        {adoption.map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-gray-700">{item.label}</span>
                                    <span className="text-gray-500">{item.value}/100 Score</span>
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
                <div className="bg-[#fdfdfd] p-6 rounded-xl border border-gray-200 shadow-sm opacity-60">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Device Distribution (Est)</h3>
                    <div className="flex items-end justify-center gap-8 h-48">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-900 rounded-t-lg relative group h-32">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">58%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Desktop</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-400 rounded-t-lg relative group h-24">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">35%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Mobile</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-t-lg relative group h-8">
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">7%</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">Tablet</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
