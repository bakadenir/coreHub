import { useState } from 'react';

export default function AdminSettings() {
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [registrationOpen, setRegistrationOpen] = useState(true);

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">System Configuration</h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div>
                            <h4 className="text-base font-medium text-gray-900">Maintenance Mode</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Temporarily disable access to the user dashboard for maintenance.
                            </p>
                        </div>
                        <button
                            onClick={() => setMaintenanceMode(!maintenanceMode)}
                            className={`relative w-12 h-7 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${maintenanceMode ? 'bg-zinc-900' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute left-1 top-1 w-5 h-5 bg-[#fdfdfd] rounded-full transition-transform transform ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div>
                            <h4 className="text-base font-medium text-gray-900">User Registrations</h4>
                            <p className="text-sm text-gray-500 mt-1">
                                Allow new users to sign up. Detailed control over invite-only access.
                            </p>
                        </div>
                        <button
                            onClick={() => setRegistrationOpen(!registrationOpen)}
                            className={`relative w-12 h-7 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${registrationOpen ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                            <span className={`absolute left-1 top-1 w-5 h-5 bg-[#fdfdfd] rounded-full transition-transform transform ${registrationOpen ? 'translate-x-5' : 'translate-x-0'}`}></span>
                        </button>
                    </div>

                    <div>
                        <h4 className="text-base font-medium text-gray-900 mb-4">Email Notifications</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                                <span className="text-sm text-gray-700">New User Alerts</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                                <span className="text-sm text-gray-700">System Errors</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                                <span className="text-sm text-gray-700">Daily Digest</span>
                            </label>
                            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input type="checkbox" className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black" />
                                <span className="text-sm text-gray-700">Backup Success</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                    <button className="px-6 py-2 bg-zinc-900 text-white font-medium rounded-lg hover:bg-zinc-800 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
