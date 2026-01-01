import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { schedulesApi } from '../lib';
import { X } from 'lucide-react';
import { type DateRange } from 'react-day-picker';
import { DateRangePicker } from './DateRangePicker';
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
    defaultDate?: Date; // For quick add when clicking on a day
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
    const [color, setColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setLocation('');
            // Use defaultDate if provided, otherwise today
            const initialDate = defaultDate || new Date();
            setDateRange({
                from: initialDate,
                to: initialDate
            });
            setStartTime('09:00');
            setEndTime('10:00');
            setIsAllDay(false);
            setColor('blue');
        }
    }, [isOpen, defaultDate]);

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

    if (!isOpen) return null;

    // Helper to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Helper to capitalize only the first letter of the text
    const toSentenceCase = (str: string) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
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
            // Format dates to YYYY-MM-DD using local time
            const startDateStr = format(dateRange.from, 'yyyy-MM-dd');
            const endDateStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : startDateStr;

            let startTimeISO: string;
            let endTimeISO: string | undefined;

            if (isAllDay) {
                // For all-day events, set time to start of day
                startTimeISO = new Date(`${startDateStr}T00:00:00`).toISOString();
                endTimeISO = new Date(`${endDateStr}T23:59:59`).toISOString();
            } else {
                // Combine date and time into proper ISO string
                startTimeISO = new Date(`${startDateStr}T${startTime}:00`).toISOString();
                if (endTime) {
                    endTimeISO = new Date(`${endDateStr}T${endTime}:00`).toISOString();
                }
            }

            const result = await schedulesApi.create({
                title: title.trim(),
                description: description.trim() || undefined,
                location: location.trim() || undefined,
                startTime: startTimeISO,
                endTime: endTimeISO,
                isAllDay,
                color,
            });

            if (result.success) {
                showToast('Schedule added successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to add schedule', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Schedule</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 max-h-[70vh]">
                    {/* Event Title */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="event-title">Event Title *</label>
                            <span className="text-xs text-gray-400">{title.length}/100</span>
                        </div>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="event-title"
                            placeholder="e.g. Project Review Meeting"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(toTitleCase(e.target.value.slice(0, 100)))}
                            maxLength={100}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="event-description">Description</label>
                            <span className="text-xs text-gray-400">{description.length}/500</span>
                        </div>
                        <textarea
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] min-h-[80px] resize-none shadow-sm outline-none"
                            id="event-description"
                            placeholder="Enter event details..."
                            value={description}
                            onChange={(e) => setDescription(toSentenceCase(e.target.value.slice(0, 500)))}
                            maxLength={500}
                        ></textarea>
                    </div>

                    {/* Location */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="event-location">Location</label>
                        </div>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="event-location"
                            placeholder="e.g. Meeting Room A, Zoom, etc."
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value.slice(0, 200))}
                            maxLength={200}
                        />
                    </div>

                    {/* Color Picker */}
                    {/* Color Picker */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3">
                            {EVENT_COLORS.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => setColor(c.value)}
                                    className={`w-6 h-6 rounded-full ${c.class} transition-all ${color === c.value
                                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                                        }`}
                                    title={c.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Date & Time Section */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-500">Date & Time</label>
                            </div>
                            {/* All-day Toggle */}
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-sm text-gray-500">All day</span>
                                <button
                                    type="button"
                                    onClick={() => setIsAllDay(!isAllDay)}
                                    className={`relative w-10 h-6 rounded-full transition-colors ${isAllDay ? 'bg-zinc-900' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAllDay ? 'translate-x-4' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </label>
                        </div>

                        <div className="space-y-3">
                            {/* Date Range Picker */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 ml-1">Date {!isAllDay && 'Range'}</label>
                                <DateRangePicker
                                    date={dateRange}
                                    setDate={setDateRange}
                                />
                            </div>

                            {/* Times Row - Hidden when all-day */}
                            {!isAllDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-gray-400 ml-1">Start Time</label>
                                        <input
                                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs text-gray-400 ml-1">End Time</label>
                                        <input
                                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
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
                        {isSubmitting ? 'Saving...' : 'Save Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}
