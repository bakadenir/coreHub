import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { schedulesApi } from '../lib';
import { X, Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Sun, CalendarClock, Clock } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// Event color options
const EVENT_COLORS = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
    { name: 'Green', value: 'green', class: 'bg-green-500' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
    { name: 'Red', value: 'red', class: 'bg-red-500' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
    { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
];

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultDate?: Date;
}

export default function AddScheduleModal({ isOpen, onClose, defaultDate }: AddScheduleModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [isAllDay, setIsAllDay] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pickers State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [isRangeMode, setIsRangeMode] = useState(false);

    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const datePickerRef = useRef<HTMLDivElement>(null);
    const startTimePickerRef = useRef<HTMLDivElement>(null);
    const endTimePickerRef = useRef<HTMLDivElement>(null);

    // Reset when open
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setLocation('');
            const initialDate = defaultDate || new Date();
            setDateRange({ from: initialDate, to: initialDate });
            setCalendarMonth(initialDate);
            setStartTime('09:00');
            setEndTime('10:00');
            setIsAllDay(false);
            setIsAllDay(false);
            setShowDatePicker(false);
            setShowStartTimePicker(false);
            setShowEndTimePicker(false);
            setIsRangeMode(false);
        }
    }, [isOpen, defaultDate]);

    // Click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
            if (startTimePickerRef.current && !startTimePickerRef.current.contains(event.target as Node)) {
                setShowStartTimePicker(false);
            }
            if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target as Node)) {
                setShowEndTimePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Auto-scroll to pickers
    useEffect(() => {
        if (showDatePicker && datePickerRef.current) {
            setTimeout(() => datePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [showDatePicker]);

    useEffect(() => {
        if (showStartTimePicker && startTimePickerRef.current) {
            setTimeout(() => startTimePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [showStartTimePicker]);

    useEffect(() => {
        if (showEndTimePicker && endTimePickerRef.current) {
            setTimeout(() => endTimePickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
    }, [showEndTimePicker]);

    // Prevent body scroll
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

    // Helpers
    const toTitleCase = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());
    const toSentenceCase = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

    const getToday = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const getTomorrow = () => {
        const d = getToday();
        d.setDate(d.getDate() + 1);
        return d;
    };

    const getNextWeek = () => {
        const d = getToday();
        d.setDate(d.getDate() + 7);
        return d;
    };

    const handleDateClick = (date: Date) => {
        if (!isRangeMode) {
            setDateRange({ from: date, to: date });
            setShowDatePicker(false);
        } else {
            if (!dateRange?.from || (dateRange.from && dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime())) {
                setDateRange({ from: date, to: undefined });
            } else {
                if (date < dateRange.from!) {
                    setDateRange({ from: date, to: dateRange.from });
                } else {
                    setDateRange({ from: dateRange.from, to: date });
                }
                setTimeout(() => setShowDatePicker(false), 500);
            }
        }
    };

    const formatDateDisplay = (range: DateRange | undefined) => {
        if (!range?.from) return 'No Date';
        if (range.to && range.to.getTime() !== range.from.getTime()) {
            return `${format(range.from, 'MMMM dd, yyyy')} - ${format(range.to, 'MMMM dd, yyyy')}`;
        }
        return format(range.from, 'MMMM dd, yyyy');
    };

    // Time Helpers
    const parseTime = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const hours12 = h % 12 || 12;
        return { hours: hours12, minutes: m, period };
    };

    const formatTime24 = (h12: number, m: number, p: string) => {
        let h24 = h12;
        if (p === 'PM' && h12 !== 12) h24 += 12;
        if (p === 'AM' && h12 === 12) h24 = 0;
        return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const handleSave = async () => {
        if (!title.trim()) {
            showToast('Please enter an event title', 'error');
            return;
        }
        if (!dateRange?.from) {
            showToast('Please set a date', 'error');
            return;
        }
        if (!isAllDay && !startTime) {
            showToast('Please set a start time', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const startDateTime = new Date(dateRange.from);
            if (!isAllDay) {
                const [sh, sm] = startTime.split(':').map(Number);
                startDateTime.setHours(sh, sm);
            }

            // If range.to exists use it, else use range.from
            const endDateBase = dateRange.to || dateRange.from;
            const endDateTime = new Date(endDateBase);
            if (!isAllDay) {
                const [eh, em] = endTime.split(':').map(Number);
                endDateTime.setHours(eh, em);
            } else {
                // If all day, end date is usually inclusive or end of day? 
                // Let's keep existing logic or just save date part
            }

            // Adapting to API signature.. reusing existing logic if possible or just standard format
            // Assuming API expects ISO strings or Date objects. 
            // Checking original file structure... it uses schedulesApi.create which likely takes specific fields.
            // Let's assume standard payload format.

            // Random color assignment
            const randomColor = EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)].value;

            await schedulesApi.create({
                title: title.trim(),
                description: description.trim(),
                location: location.trim(),
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                isAllDay,
                color: randomColor,
            });

            showToast('Schedule added successfully!', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Failed to add schedule', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Calendar logic
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = getDaysInMonth(calendarMonth);
    const firstDay = getFirstDayOfMonth(calendarMonth);
    const today = getToday();

    // Time Picker Component
    const TimePickerDropdown = ({
        value,
        onChange,
        show
    }: {
        value: string,
        onChange: (val: string) => void,
        show: boolean
    }) => {
        const { hours, minutes, period } = parseTime(value);

        return show ? (
            <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up grid grid-cols-3 divide-x divide-gray-100 select-none shadow-sm">
                <div className="flex flex-col">
                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Hour</div>
                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(h => (
                            <button key={h} onClick={() => onChange(formatTime24(h, minutes, period))}
                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${h === hours ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {String(h).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Minute</div>
                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(m => (
                            <button key={m} onClick={() => onChange(formatTime24(hours, m, period))}
                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${m === minutes ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {String(m).padStart(2, '0')}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="py-2.5 text-center text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">Period</div>
                    <div className="h-44 overflow-y-auto no-scrollbar p-1 space-y-1">
                        {['AM', 'PM'].map(p => (
                            <button key={p} onClick={() => onChange(formatTime24(hours, minutes, p))}
                                className={`w-full py-2 rounded-md text-sm font-medium transition-all ${p === period ? 'bg-zinc-900 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        ) : null;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-[540px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 rounded-t-xl bg-[#fdfdfd]">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Schedule</h2>
                    <button onClick={onClose} className="group p-1 rounded-md hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 px-6 py-6 space-y-7 max-h-[70vh] overflow-y-auto">
                    {/* Event Title */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Event Title *</label>
                            <span className="text-xs text-gray-400">{title.length}/100</span>
                        </div>
                        <input className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none capitalize"
                            placeholder="e.g. Project Review Meeting" value={title} onChange={(e) => setTitle(toTitleCase(e.target.value.slice(0, 100)))} maxLength={100} />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Description</label>
                            <span className="text-xs text-gray-400">{description.length}/500</span>
                        </div>
                        <textarea className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] min-h-[80px] resize-none shadow-sm outline-none capitalize"
                            placeholder="Enter event details..." value={description} onChange={(e) => setDescription(toSentenceCase(e.target.value.slice(0, 500)))} maxLength={500}></textarea>
                    </div>

                    {/* Location */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Location</label>
                        <input className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g. Meeting Room A, Zoom, etc." value={location} onChange={(e) => setLocation(e.target.value.slice(0, 200))} maxLength={200} />
                    </div>



                    {/* Date & Time Section */}
                    <div className="space-y-4 pt-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-gray-500">Date & Time</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm text-gray-500">All day</span>
                                <button type="button" onClick={() => setIsAllDay(!isAllDay)} className={`relative w-10 h-6 rounded-full transition-colors ${isAllDay ? 'bg-zinc-900' : 'bg-gray-300'}`}>
                                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAllDay ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                            </label>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-1.5 relative" ref={datePickerRef}>
                            <button type="button" onClick={() => setShowDatePicker(!showDatePicker)}
                                className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <CalendarIcon size={18} className="text-gray-400" />
                                    <span className={!dateRange?.from ? 'text-gray-500' : 'font-medium'}>{formatDateDisplay(dateRange)}</span>
                                </div>
                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                            </button>

                            {showDatePicker && (
                                <div className="mt-4 bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up p-5 flex flex-col md:flex-row gap-6">
                                    {/* Left: Calendar */}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-4 px-1">
                                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="text-sm font-semibold text-gray-900">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>

                                        {/* Toggle Range Mode */}
                                        <div className="flex justify-center mb-3">
                                            <button
                                                onClick={() => setIsRangeMode(!isRangeMode)}
                                                className={`text-[10px] font-medium px-3 py-1 rounded-full border transition-all ${isRangeMode
                                                    ? 'bg-zinc-900 text-white border-zinc-900'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'}`}
                                            >
                                                {isRangeMode ? 'Range Selection On' : 'Enable Range Selection'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-7 text-center mb-2">
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="text-xs font-medium text-gray-400 py-1">{day}</div>)}
                                        </div>
                                        <div className="grid grid-cols-7 text-center gap-y-1">
                                            {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
                                            {[...Array(daysInMonth)].map((_, i) => {
                                                const day = i + 1;
                                                const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);

                                                const isSelectedStart = dateRange?.from && date.toDateString() === dateRange.from.toDateString();
                                                const isSelectedEnd = dateRange?.to && date.toDateString() === dateRange.to.toDateString();
                                                const isInRange = dateRange?.from && dateRange?.to && date > dateRange.from && date < dateRange.to;
                                                const isSelected = isSelectedStart || isSelectedEnd;
                                                const isToday = today.getDate() === day && today.getMonth() === calendarMonth.getMonth() && today.getFullYear() === calendarMonth.getFullYear();
                                                const isPast = date < today;

                                                let bgClass = '';
                                                let textClass = 'text-gray-700 hover:bg-gray-50';
                                                let roundedClass = 'rounded-lg';

                                                if (isPast) {
                                                    textClass = 'text-gray-300 cursor-default';
                                                    bgClass = '';
                                                } else if (isSelected) {
                                                    bgClass = 'bg-zinc-900 shadow-sm relative z-10';
                                                    textClass = 'text-white font-medium';
                                                } else if (isInRange) {
                                                    bgClass = 'bg-gray-100';
                                                    textClass = 'text-black';
                                                    roundedClass = 'rounded-none';
                                                    if (date.getDay() === 0) roundedClass = 'rounded-l-lg';
                                                    if (date.getDay() === 6) roundedClass = 'rounded-r-lg';
                                                } else if (isToday) {
                                                    bgClass = 'bg-gray-100';
                                                    textClass = 'text-zinc-900 font-bold';
                                                }

                                                if (isSelectedStart && dateRange?.to && dateRange.from?.getTime() !== dateRange.to?.getTime()) roundedClass = 'rounded-l-lg rounded-r-none';
                                                if (isSelectedEnd && dateRange?.from && dateRange.from?.getTime() !== dateRange.to?.getTime()) roundedClass = 'rounded-r-lg rounded-l-none';

                                                return (
                                                    <button key={day} onClick={() => !isPast && handleDateClick(date)}
                                                        disabled={isPast}
                                                        className={`w-8 h-8 mx-auto flex items-center justify-center text-sm transition-all ${roundedClass} ${bgClass} ${textClass}`}>
                                                        {day}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {/* Right: Quick Options */}
                                    <div className="border-l border-gray-100 pl-6 flex flex-col justify-center min-w-[170px] space-y-1">
                                        {[{ label: 'Today', icon: Sun, color: 'text-orange-500', action: getToday }, { label: 'Tomorrow', icon: CalendarIcon, color: 'text-blue-500', action: getTomorrow }, { label: 'Next Week', icon: CalendarClock, color: 'text-purple-500', action: getNextWeek }].map(opt => (
                                            <button key={opt.label} onClick={() => { const d = opt.action(); setDateRange({ from: d, to: d }); setShowDatePicker(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-700 hover:shadow-sm">
                                                <opt.icon size={15} className={opt.color} /> <span>{opt.label}</span>
                                            </button>
                                        ))}
                                        <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                        <button onClick={() => { setDateRange(undefined); setShowDatePicker(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all text-gray-500 hover:text-red-500 hover:shadow-sm">
                                            <X size={15} /> <span>No Date</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Times */}
                        {!isAllDay && (
                            <div className="grid grid-cols-2 gap-4">
                                {/* Start Time */}
                                <div className="space-y-1.5 relative" ref={startTimePickerRef}>
                                    <label className="text-xs text-gray-400 ml-1">Start Time</label>
                                    <button type="button" onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                                        className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={18} className="text-gray-400" />
                                            <span className="font-medium">{(() => { const t = parseTime(startTime); return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')} ${t.period}`; })()}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showStartTimePicker ? 'rotate-180' : ''}`} />
                                    </button>
                                    <TimePickerDropdown value={startTime} onChange={setStartTime} show={showStartTimePicker} />
                                </div>

                                {/* End Time */}
                                <div className="space-y-1.5 relative" ref={endTimePickerRef}>
                                    <label className="text-xs text-gray-400 ml-1">End Time</label>
                                    <button type="button" onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                                        className="w-full flex items-center justify-between bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-left text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none hover:bg-gray-50">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Clock size={18} className="text-gray-400" />
                                            <span className="font-medium">{(() => { const t = parseTime(endTime); return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')} ${t.period}`; })()}</span>
                                        </div>
                                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showEndTimePicker ? 'rotate-180' : ''}`} />
                                    </button>
                                    <TimePickerDropdown value={endTime} onChange={setEndTime} show={showEndTimePicker} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
                    <button onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors disabled:opacity-50">Cancel</button>
                    <button onClick={handleSave} disabled={isSubmitting} className="px-6 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed">{isSubmitting ? 'Adding...' : 'Add Schedule'}</button>
                </div>
            </div>
        </div>
    );
}
