import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { todosApi } from '../lib';
import { X, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Sun, CalendarClock } from 'lucide-react';

interface AddTodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddTodoModal({ isOpen, onClose, onSuccess }: AddTodoModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDueDate(undefined);
            setCalendarMonth(new Date());
            setShowDatePicker(false);
        }
    }, [isOpen]);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    // Close date picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Auto-scroll to picker when opened
    useEffect(() => {
        if (showDatePicker && datePickerRef.current) {
            setTimeout(() => {
                datePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [showDatePicker]);

    // Date Helpers
    const getToday = () => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    };

    const getTomorrow = () => {
        const date = getToday();
        date.setDate(date.getDate() + 1);
        return date;
    };

    const getNextWeek = () => {
        const date = getToday();
        date.setDate(date.getDate() + 7);
        return date;
    };

    const formatDateDisplay = (date: Date | undefined) => {
        if (!date) return 'No Date';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleSave = async () => {
        if (!title.trim()) {
            showToast('Please enter a task title', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Format date to YYYY-MM-DD string if it exists
            const dateStr = dueDate ? dueDate.toLocaleDateString('en-CA') : undefined;

            const result = await todosApi.create({
                title: title.trim(),
                priority: 'medium',
                dueDate: dateStr,
            });

            if (result.success) {
                showToast('Task added successfully', 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showToast(result.error || 'Failed to create task', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Calendar Render Helpers
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    const today = getToday();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-xl bg-[#fdfdfd]">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add New Task</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-visible px-6 py-6 space-y-6">
                    {/* Task Title */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">What needs to be done?</label>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none capitalize"
                            placeholder="e.g., Buy groceries, Finish report"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Custom Date Picker */}
                    <div className="space-y-3 relative" ref={datePickerRef}>
                        <label className="block text-sm font-medium text-gray-500">Due Date</label>
                        <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon size={18} className="text-gray-400" />
                                <span className={!dueDate ? 'text-gray-500' : 'font-medium'}>
                                    {formatDateDisplay(dueDate)}
                                </span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Calendar (Inline) */}
                        {showDatePicker && (
                            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up p-5 flex flex-col md:flex-row gap-6">
                                {/* Left Side: Calendar */}
                                <div className="flex-1">
                                    {/* Calendar Header */}
                                    <div className="flex items-center justify-between mb-4 px-1">
                                        <button
                                            onClick={() => {
                                                const prev = new Date(calendarMonth);
                                                prev.setMonth(prev.getMonth() - 1);
                                                setCalendarMonth(prev);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const next = new Date(calendarMonth);
                                                next.setMonth(next.getMonth() + 1);
                                                setCalendarMonth(next);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>

                                    {/* Days Header */}
                                    <div className="grid grid-cols-7 text-center mb-2">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                                            <div key={day} className="text-xs font-medium text-gray-400 py-1">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Days Grid */}
                                    <div className="grid grid-cols-7 text-center gap-y-1">
                                        {[...Array(firstDay)].map((_, i) => (
                                            <div key={`empty-${i}`} />
                                        ))}
                                        {[...Array(daysInMonth)].map((_, i) => {
                                            const day = i + 1;
                                            const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                                            const isSelected = dueDate &&
                                                date.getDate() === dueDate.getDate() &&
                                                date.getMonth() === dueDate.getMonth() &&
                                                date.getFullYear() === dueDate.getFullYear();
                                            const isToday = today.getDate() === day &&
                                                today.getMonth() === calendarMonth.getMonth() &&
                                                today.getFullYear() === calendarMonth.getFullYear();
                                            const isPast = date < today;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        if (!isPast) {
                                                            setDueDate(date);
                                                            setShowDatePicker(false);
                                                        }
                                                    }}
                                                    disabled={isPast}
                                                    className={`
                                                        w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-sm transition-all
                                                        ${isPast
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-zinc-900 text-white shadow-md font-medium'
                                                                : isToday
                                                                    ? 'text-zinc-900 font-bold bg-gray-100'
                                                                    : 'text-gray-700 hover:bg-gray-50'
                                                        }
                                                    `}
                                                >
                                                    {day}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right Side: Quick Options */}
                                <div className="border-l border-gray-100 pl-6 flex flex-col justify-center min-w-[170px] space-y-1">
                                    <button
                                        onClick={() => { setDueDate(getToday()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <Sun size={15} className="text-orange-500" />
                                        <span>Today</span>
                                    </button>

                                    <button
                                        onClick={() => { setDueDate(getTomorrow()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <CalendarIcon size={15} className="text-blue-500" />
                                        <span>Tomorrow</span>
                                    </button>

                                    <button
                                        onClick={() => { setDueDate(getNextWeek()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <CalendarClock size={15} className="text-purple-500" />
                                        <span>Next Week</span>
                                    </button>

                                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                                    <button
                                        onClick={() => { setDueDate(undefined); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-500 hover:text-red-500 hover:shadow-sm"
                                    >
                                        <X size={15} />
                                        <span>No Date</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-xl relative z-0">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Adding...' : 'Add Task'}
                    </button>
                </div>
            </div>
        </div>
    );
}
