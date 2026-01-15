import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../lib/admin.api';
import { useToast } from '../../context/ToastContext';

interface Report {
    id: string;
    reporter_id: string;
    reported_user_id: string;
    content_type: string;
    content_id: string;
    reason: string;
    description: string;
    status: string;
    created_at: string;
}

export default function ContentModeration() {
    const { showToast } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        critical: 0,
        today: 0,
        auto: 0
    });

    const fetchReports = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await adminApi.getReports();
            if (res.success && res.data) {
                const fetchedReports = res.data as Report[];
                setReports(fetchedReports);

                // Calculate simple stats
                const today = new Date().toISOString().split('T')[0];
                setStats({
                    critical: fetchedReports.filter(r => r.reason.toLowerCase().includes('harassment') || r.reason.toLowerCase().includes('malicious')).length,
                    today: fetchedReports.filter(r => r.created_at.startsWith(today)).length,
                    auto: 0 // Placeholder as we don't have automod yet
                });
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            showToast('Failed to load reports', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleAction = async (report: Report, action: 'ban' | 'ignore' | 'resolve') => {
        try {
            if (action === 'ban') {
                if (window.confirm(`Are you sure you want to ban the user reported in this ${report.content_type}?`)) {
                    await adminApi.updateUserStatus(report.reported_user_id, true);
                    await adminApi.reviewReport(report.id, 'resolved'); // Auto resolve report after ban
                    showToast('User banned and report resolved', 'success');
                } else {
                    return;
                }
            } else if (action === 'ignore') {
                await adminApi.reviewReport(report.id, 'dismissed');
                showToast('Report dismissed', 'info');
            } else if (action === 'resolve') {
                await adminApi.reviewReport(report.id, 'resolved');
                showToast('Report resolved', 'success');
            }
            fetchReports(); // Refresh list
        } catch (error) {
            console.error('Action failed:', error);
            showToast('Failed to perform action', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 3600000) return `${Math.floor(diff / 60000)} mins ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                    <h3 className="text-red-800 font-bold text-lg mb-1">Critical Alerts</h3>
                    <div className="text-3xl font-bold text-red-900">{stats.critical}</div>
                    <p className="text-red-700 text-sm mt-1">Requires attention</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl">
                    <h3 className="text-orange-800 font-bold text-lg mb-1">Reports Today</h3>
                    <div className="text-3xl font-bold text-orange-900">{stats.today}</div>
                    <p className="text-orange-700 text-sm mt-1">New submissions</p>
                </div>
                <div className="bg-green-50 border border-green-100 p-6 rounded-xl">
                    <h3 className="text-green-800 font-bold text-lg mb-1">Auto-Moderated</h3>
                    <div className="text-3xl font-bold text-green-900">{stats.auto}</div>
                    <p className="text-green-700 text-sm mt-1">Spam accounts blocked</p>
                </div>
            </div>

            <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Flagged Content Queue</h3>
                    <div className="flex gap-2 text-sm">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium">Pending ({reports.filter(r => r.status === 'pending').length})</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading reports...</td></tr>
                            ) : reports.length === 0 ? (
                                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No pending reports</td></tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="group hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                {report.content_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-red-600 font-medium">
                                            {report.reason}
                                            {report.description && <p className="text-xs text-gray-500 mt-1 font-normal truncate max-w-[200px]">{report.description}</p>}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {formatDate(report.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {report.status === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleAction(report, 'ban')}
                                                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        Ban User
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(report, 'ignore')}
                                                        className="px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
                                                    >
                                                        Ignore
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${report.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {report.status}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
