import { useState, useEffect } from 'react';
import AddHabitModal from './AddHabitModal';
import AddScheduleModal from './AddScheduleModal';
import AddNoteModal from './AddNoteModal';
import AddLinkModal from './AddLinkModal';
import PomodoroTimer from './PomodoroTimer';

interface SidebarProps {
    onDataChange?: () => void;
    onDateHover?: (date: Date | null) => void;
}

export default function Sidebar({ onDataChange, onDateHover }: SidebarProps) {
    const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
    const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
    const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
    const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    // Update current date at midnight
    useEffect(() => {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        // Set selected day to today initially
        setSelectedDay(now.getDate());

        const timeout = setTimeout(() => {
            setCurrentDate(new Date());
        }, msUntilMidnight);

        return () => clearTimeout(timeout);
    }, []);

    // Handle modal close with data change notification
    const handleModalClose = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter(false);
        if (onDataChange) {
            onDataChange();
        }
    };

    // Handle date hover
    const handleDayHover = (day: number | null) => {
        if (onDateHover) {
            if (day !== null) {
                const hoveredDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                onDateHover(hoveredDate);
            } else {
                onDateHover(null);
            }
        }
    };

    // Calendar helpers
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    };

    const navigateMonth = (direction: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
        setSelectedDay(null);
    };

    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
    const todayDay = today.getDate();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const prevMonthDays = getDaysInMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    return (
        <aside className="lg:col-span-3 space-y-6 flex flex-col">
            <AddHabitModal isOpen={isAddHabitOpen} onClose={() => handleModalClose(setIsAddHabitOpen)} />
            <AddScheduleModal isOpen={isAddScheduleOpen} onClose={() => handleModalClose(setIsAddScheduleOpen)} />
            <AddNoteModal isOpen={isAddNoteOpen} onClose={() => handleModalClose(setIsAddNoteOpen)} />
            <AddLinkModal isOpen={isAddLinkOpen} onClose={() => handleModalClose(setIsAddLinkOpen)} />

            {/* Quick Action */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
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
            <div
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex-1 flex flex-col"
                onMouseLeave={() => handleDayHover(null)}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Calendar
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <span className="material-icons-outlined text-sm text-gray-500">chevron_left</span>
                        </button>
                        <span className="text-xs font-mono text-gray-500 min-w-[80px] text-center">
                            {formatMonth(currentDate)}
                        </span>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                            <span className="material-icons-outlined text-sm text-gray-500">chevron_right</span>
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2 font-medium">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                        <div key={i}>{day}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {/* Previous month days */}
                    {[...Array(firstDay)].map((_, i) => (
                        <div key={`prev-${i}`} className="p-2 text-gray-300">
                            {prevMonthDays - firstDay + i + 1}
                        </div>
                    ))}
                    {/* Current month days */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const isToday = isCurrentMonth && day === todayDay;
                        const isSelected = selectedDay === day;
                        return (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                onMouseEnter={() => handleDayHover(day)}
                                className={`p-2 rounded transition-all ${isSelected
                                    ? 'bg-primary text-white font-bold shadow-md transform scale-105'
                                    : isToday
                                        ? 'bg-gray-100 text-primary font-semibold ring-1 ring-primary'
                                        : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Pomodoro Timer */}
            <PomodoroTimer />
        </aside>
    );
}
