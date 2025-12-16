import { useNavigate } from 'react-router-dom';


export default function ActivityCards() {
    const navigate = useNavigate();


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Habit Tracker */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/habits')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">check_circle</span>
                    <h4 className="font-bold text-gray-900">Habit Tracker</h4>
                </div>
                <ul className="space-y-3 pl-1">
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                        <input
                            defaultChecked
                            className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            type="checkbox"
                        />
                        <span className="line-through text-gray-400 font-light">Morning Meditation</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600">
                        <input
                            className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            type="checkbox"
                        />
                        <span className="font-light">Read 20 pages</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-600 opacity-50">
                        <input
                            className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                            type="checkbox"
                        />
                        <span className="font-light">Drink 2L Water</span>
                    </li>
                </ul>
            </div>

            {/* Schedule */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/schedule')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">schedule</span>
                    <h4 className="font-bold text-gray-900">Schedule</h4>
                </div>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-sm">
                        <span className="font-mono text-xs font-bold text-gray-400 pt-0.5">09:00</span>
                        <span className="text-gray-700 font-light">Team Standup</span>
                    </li>
                    <li className="flex gap-3 text-sm">
                        <span className="font-mono text-xs font-bold text-primary pt-0.5">
                            14:00
                        </span>
                        <span className="text-gray-900 font-medium">
                            Project Review
                            <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded ml-1 text-gray-500 font-light">
                                Zoom
                            </span>
                        </span>
                    </li>
                    <li className="flex gap-3 text-sm opacity-50">
                        <span className="font-mono text-xs font-bold text-gray-400 pt-0.5">16:30</span>
                        <span className="text-gray-600 font-light">Deep Work</span>
                    </li>
                </ul>
            </div>

            {/* Notes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/notes')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">description</span>
                    <h4 className="font-bold text-gray-900">Notes</h4>
                </div>
                <div className="space-y-2">
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
                        <p className="text-xs font-bold text-gray-800 mb-1">
                            Design System Ideas
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1 font-light">
                            Monochrome palette with high contrast...
                        </p>
                    </div>
                    <div className="p-2.5 bg-gray-50 rounded border border-gray-100">
                        <p className="text-xs font-bold text-gray-800 mb-1">
                            Meeting Minutes
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1 font-light">
                            Action items for Q1 roadmap...
                        </p>
                    </div>
                </div>
            </div>

            {/* List Link */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors relative group min-h-[160px]">
                <button
                    onClick={() => navigate('/links')}
                    className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
                >
                    <span className="material-icons-outlined text-lg">open_in_full</span>
                </button>
                <div className="flex items-center gap-2 mb-4">
                    <span className="material-icons-outlined text-gray-500">link</span>
                    <h4 className="font-bold text-gray-900">List Link</h4>
                </div>
                <ul className="space-y-2">
                    <li>
                        <a
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group/link transition-colors"
                            href="#"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                <span className="text-sm font-medium text-gray-700 truncate font-light">
                                    Figma Design File
                                </span>
                            </div>
                            <span className="material-icons-outlined text-[14px] text-gray-300 group-hover/link:text-primary">
                                arrow_outward
                            </span>
                        </a>
                    </li>
                    <li>
                        <a
                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 group/link transition-colors"
                            href="#"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                <span className="text-sm font-medium text-gray-700 truncate font-light">
                                    AWS Console
                                </span>
                            </div>
                            <span className="material-icons-outlined text-[14px] text-gray-300 group-hover/link:text-primary">
                                arrow_outward
                            </span>
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
