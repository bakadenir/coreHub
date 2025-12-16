import { useState } from 'react';
import AddHabitModal from './AddHabitModal';
import AddScheduleModal from './AddScheduleModal';
import AddNoteModal from './AddNoteModal';
import AddLinkModal from './AddLinkModal';

export default function Sidebar() {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);

    return (
        <aside className="lg:col-span-3 space-y-6 flex flex-col">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => setIsAddHabitOpen(false)} />
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => setIsAddScheduleOpen(false)} />
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => setIsAddNoteOpen(false)} />
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => setIsAddLinkOpen(false)} />
            {/* Quick Action */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Quick Action
                </h2>
                <nav className="space-y-2">
                    {[
                        { icon: 'add', label: 'Add Habit' },
                        { icon: 'event', label: 'Add Schedule' },
                        { icon: 'edit_note', label: 'Add Notes' },
                        { icon: 'link', label: 'Add Link' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            onClick={() => {
                                if (action.label === 'Add Habit') setIsAddHabitOpen(true);
                                if (action.label === 'Add Schedule') setIsAddScheduleOpen(true);
                                if (action.label === 'Add Notes') setIsAddNoteOpen(true);
                                if (action.label === 'Add Link') setIsAddLinkOpen(true);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-surface-light transition-all border border-transparent hover:border-gray-200 group"
                        >
                            <span className="flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-primary transition-colors shadow-sm">
                                <span className="material-icons-outlined text-sm">{action.icon}</span>
                            </span>
                            {action.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Calendar */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Calendar
                    </h2>
                    <span className="text-xs font-mono text-gray-500">DEC 2025</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                        <div key={day}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    <div className="p-2"></div>
                    <div className="p-2"></div>
                    {[...Array(15)].map((_, i) => {
                        const day = i + 1;
                        const isSelected = day === 14;
                        return (
                            <button
                                key={day}
                                className={`p-2 rounded ${isSelected
                                    ? 'bg-primary text-white font-bold shadow-md transform scale-105'
                                    : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
                <p className="mt-auto text-xs text-gray-400 text-center pt-4 border-t border-gray-100 font-light">
                    Select a date to view schedule
                </p>
            </div>

            {/* Pomodoro */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        Pomodoro
                    </span>
                    <div className="flex gap-1">
                        <button className="w-2 h-2 rounded-full bg-primary"></button>
                        <button className="w-2 h-2 rounded-full bg-gray-300"></button>
                        <button className="w-2 h-2 rounded-full bg-gray-300"></button>
                    </div>
                </div>
                <div className="flex justify-center mb-4">
                    <div className="text-5xl font-mono font-bold text-primary tracking-tighter">
                        25:00
                    </div>
                </div>
                <div className="flex gap-2 mb-4">
                    <button className="flex-1 py-1 text-xs font-medium rounded bg-gray-100 text-gray-900 border border-gray-200">
                        Focus
                    </button>
                    <button className="flex-1 py-1 text-xs font-medium rounded hover:bg-gray-50 text-gray-500">
                        Short Break
                    </button>
                    <button className="flex-1 py-1 text-xs font-medium rounded hover:bg-gray-50 text-gray-500">
                        Long Break
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button className="py-2 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                        Start
                    </button>
                    <button className="py-2 px-4 rounded-lg bg-transparent border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        Reset
                    </button>
                </div>
                <div className="mt-3 flex items-center gap-2 justify-center text-xs text-gray-400">
                    <span className="material-icons-outlined text-[14px]">notifications</span>
                    Alarm when finished
                </div>
            </div>
        </aside>
    );
}
