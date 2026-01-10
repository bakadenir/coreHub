import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { habitsApi } from '../lib';
import { X, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Sun, CalendarClock, Clock } from 'lucide-react';
import { iconMap } from '../lib/iconMap';
import { format } from 'date-fns';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('habit_check');
    const [frequency, setFrequency] = useState('daily');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [reminderTime, setReminderTime] = useState('09:00'); // Stores 24h format "HH:mm"
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const datePickerRef = useRef<HTMLDivElement>(null);

    // Time Picker State
    const [showTimePicker, setShowTimePicker] = useState(false);
    const timePickerRef = useRef<HTMLDivElement>(null);

    const habitIcons = [
        'habit_check', 'habit_code', 'habit_book', 'habit_fitness', 'habit_yoga',
        'habit_running', 'habit_water', 'habit_sleep', 'habit_writing', 'habit_target',
        'habit_idea', 'habit_art', 'habit_music', 'habit_money', 'habit_plant',
        'habit_notes', 'habit_alarm', 'habit_brain', 'habit_cleaning', 'habit_sun'
    ];

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setIcon('habit_check');
            setFrequency('daily');
            setStartDate(undefined);
            setCalendarMonth(new Date());
            setReminderTime('09:00');
            setSelectedDays([]);
            setShowDatePicker(false);
            setShowTimePicker(false);
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

    // Close click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
                setShowTimePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const toggleDay = (index: number) => {
        setSelectedDays(prev =>
            prev.includes(index)
                ? prev.filter(d => d !== index)
                : [...prev, index]
        );
    };

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

    // Time Helpers (12h <-> 24h)
    const parseTime = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hours12 = h % 12 || 12;
        return { hours: hours12, minutes: m, period };
    };

    const updateTime = (newH: number, newM: number, newP: string) => {
        let h24 = newH;
        if (newP === 'PM' && newH !== 12) h24 += 12;
        if (newP === 'AM' && newH === 12) h24 = 0;

        const hStr = String(h24).padStart(2, '0');
        const mStr = String(newM).padStart(2, '0');
        setReminderTime(`${hStr}:${mStr}`);
    };

    const { hours, minutes, period } = parseTime(reminderTime);

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Please enter a habit name', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const dateStr = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;

            const result = await habitsApi.create({
                name: name.trim(),
                icon: icon,
                frequency: frequency.toLowerCase(),
                specificDays: frequency === 'weekly' && selectedDays.length > 0 ? selectedDays : undefined,
                startDate: dateStr,
                reminderTime: reminderTime || undefined,
            });

            if (result.success) {
                showToast('Habit added successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to add habit', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Auto-scroll when pickers open
    useEffect(() => {
        if (showDatePicker && datePickerRef.current) {
            setTimeout(() => {
                datePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [showDatePicker]);

    useEffect(() => {
        if (showTimePicker && timePickerRef.current) {
            setTimeout(() => {
                timePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [showTimePicker]);

    if (!isOpen) return null;

    // Manual Calendar Helpers
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Habit</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Icon Picker */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {habitIcons.map((iconKey) => {
                                const IconComponent = iconMap[iconKey];
                                return (
                                    <button
                                        key={iconKey}
                                        type="button"
                                        onClick={() => setIcon(iconKey)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${icon === iconKey
                                            ? 'bg-zinc-900 text-white shadow-md scale-110'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {IconComponent && <IconComponent size={20} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Habit Name */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-500">Habit Name *</label>
                            <span className="text-xs text-gray-400">{name.length}/50</span>
                        </div>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none capitalize"
                            placeholder="e.g., Meditate for 10 mins"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={50}
                        />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">Frequency</label>
                        <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-lg border border-transparent">
                            {[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFrequency(option.value)}
                                    className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${frequency === option.value
                                        ? 'bg-[#fdfdfd] text-black shadow-sm'
                                        : 'text-gray-500 hover:text-black'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {/* Days Selection - show when Weekly is selected */}
                        {frequency === 'weekly' && (
                            <div className="pt-2 space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    {days.map((day, index) => {
                                        const isSelected = selectedDays.includes(index);
                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => toggleDay(index)}
                                                className={`w-10 h-10 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all focus:outline-none ${isSelected
                                                    ? 'bg-zinc-900 text-white border border-zinc-900 shadow-md'
                                                    : 'border border-gray-200 bg-[#fdfdfd] text-gray-400 hover:border-gray-400 hover:text-black'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-xs text-gray-400 pt-1">Select the days you want to do this habit</p>
                            </div>
                        )}
                    </div>

                    {/* Start Date (Custom Picker) */}
                    <div className="space-y-3 relative" ref={datePickerRef}>
                        <label className="block text-sm font-medium text-gray-500">Start Date</label>
                        <button
                            type="button"
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2 text-gray-700">
                                <CalendarIcon size={18} className="text-gray-400" />
                                <span className={!startDate ? 'text-gray-500' : 'font-medium'}>
                                    {formatDateDisplay(startDate)}
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
                                            const isSelected = startDate &&
                                                date.getDate() === startDate.getDate() &&
                                                date.getMonth() === startDate.getMonth() &&
                                                date.getFullYear() === startDate.getFullYear();
                                            const isToday = today.getDate() === day &&
                                                today.getMonth() === calendarMonth.getMonth() &&
                                                today.getFullYear() === calendarMonth.getFullYear();
                                            const isPast = date < today;

                                            return (
                                                <button
                                                    key={day}
                                                    onClick={() => {
                                                        if (!isPast) {
                                                            setStartDate(date);
                                                            setShowDatePicker(false);
                                                        }
                                                    }}
                                                    disabled={isPast}
                                                    className={`
                                                        w-8 h-8 mx-auto flex items-center justify-center rounded-lg text-sm transition-all
                                                        ${isPast
                                                            ? 'text-gray-300 cursor-default'
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
                                        onClick={() => { setStartDate(getToday()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <Sun size={15} className="text-orange-500" />
                                        <span>Today</span>
                                    </button>

                                    <button
                                        onClick={() => { setStartDate(getTomorrow()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <CalendarIcon size={15} className="text-blue-500" />
                                        <span>Tomorrow</span>
                                    </button>

                                    <button
                                        onClick={() => { setStartDate(getNextWeek()); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm"
                                    >
                                        <CalendarClock size={15} className="text-purple-500" />
                                        <span>Next Week</span>
                                    </button>

                                    <div className="h-px bg-gray-100 my-1 mx-2"></div>

                                    <button
                                        onClick={() => { setStartDate(undefined); setShowDatePicker(false); }}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-500 hover:text-red-500 hover:shadow-sm"
                                    >
                                        <X size={15} />
                                        <span>No Date</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reminder (Custom Time Picker) */}
                    <div className="space-y-3 relative" ref={timePickerRef}>
                        <label className="block text-sm font-medium text-gray-500">Reminder</label>
                        <button
                            type="button"
                            onClick={() => setShowTimePicker(!showTimePicker)}
                            className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={18} className="text-gray-400" />
                                <span className="font-medium">
                                    {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')} {period}
                                </span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-400 transition-transform ${showTimePicker ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Time Dropdown (Inline) */}
                        {showTimePicker && (
                            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up grid grid-cols-3 divide-x divide-gray-100 select-none shadow-sm">
                                {/* Hours Column */}
                                <div className="flex flex-col">
                                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Hour</div>
                                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => updateTime(h, minutes, period)}
                                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${h === hours
                                                    ? 'bg-zinc-900 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {String(h).padStart(2, '0')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Minutes Column */}
                                <div className="flex flex-col">
                                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Minute</div>
                                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                                        {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                                            <button
                                                key={m}
                                                onClick={() => updateTime(hours, m, period)}
                                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${m === minutes
                                                    ? 'bg-zinc-900 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {String(m).padStart(2, '0')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* AM/PM Column */}
                                <div className="flex flex-col">
                                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Period</div>
                                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                                        {['AM', 'PM'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => updateTime(hours, minutes, p)}
                                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${p === period
                                                    ? 'bg-zinc-900 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
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
                        {isSubmitting ? 'Adding...' : 'Add Habit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
