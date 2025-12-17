
export default function ContentModeration() {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                    <h3 className="text-red-800 font-bold text-lg mb-1">Critical Alerts</h3>
                    <div className="text-3xl font-bold text-red-900">3</div>
                    <p className="text-red-700 text-sm mt-1">Requires immediate attention</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                    <h3 className="text-orange-800 font-bold text-lg mb-1">Reports Today</h3>
                    <div className="text-3xl font-bold text-orange-900">12</div>
                    <p className="text-orange-700 text-sm mt-1">+2 from yesterday</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl">
                    <h3 className="text-green-800 font-bold text-lg mb-1">Auto-Moderated</h3>
                    <div className="text-3xl font-bold text-green-900">45</div>
                    <p className="text-green-700 text-sm mt-1">Spam accounts blocked</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Flagged Content Queue</h3>
                    <div className="flex gap-2 text-sm">
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium">Pending (3)</button>
                        <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">Resolved</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {[
                                { type: 'Note', user: 'SpamBot_99', reason: 'Spam / Advertising', date: '30 mins ago' },
                                { type: 'Comment', user: 'AngryUser123', reason: 'Harassment', date: '2 hours ago' },
                                { type: 'Link', user: 'PhishingAttempt', reason: 'Malicious URL', date: '5 hours ago' }
                            ].map((item, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-outlined text-gray-400 text-sm">person</span>
                                            <span className="text-sm font-medium text-gray-900">{item.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-red-600 font-medium">
                                        {item.reason}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                        {item.date}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors">
                                                Ban User
                                            </button>
                                            <button className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors">
                                                Ignore
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
