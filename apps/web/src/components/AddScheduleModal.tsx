import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { schedulesApi } from '../lib';
import { X, Clock, Calendar } from 'lucide-react';

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddScheduleModal({ isOpen, onClose }: AddScheduleModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            setTitle('');
            setDescription('');
            setStartDate(today);
            setStartTime('09:00');
            setEndDate(today);
            setEndTime('10:00');
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
        if (!startDate || !startTime) {
            showToast('Please set start date and time', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine date and time into proper ISO string
            const startDateTime = new Date(`${startDate}T${startTime}:00`);
            const startTimeISO = startDateTime.toISOString();

            let endTimeISO: string | undefined;
            if (endDate && endTime) {
                const endDateTime = new Date(`${endDate}T${endTime}:00`);
                endTimeISO = endDateTime.toISOString();
            }

            const result = await schedulesApi.create({
                title: title.trim(),
                description: description.trim() || undefined,
                startTime: startTimeISO,
                endTime: endTimeISO,
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
                        <label className="block text-sm font-medium text-gray-500" htmlFor="event-title">Event Title *</label>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="event-title"
                            placeholder="e.g. Project Review Meeting"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(toTitleCase(e.target.value))}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="event-description">Description</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] min-h-[100px] resize-none shadow-sm outline-none"
                            id="event-description"
                            placeholder="Enter event details..."
                            value={description}
                            onChange={(e) => setDescription(toSentenceCase(e.target.value))}
                        ></textarea>
                    </div>

                    {/* Date & Time Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            <label className="text-sm font-medium text-gray-500">Date & Time</label>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Dates Row */}
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 ml-1">From</label>
                                <input
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[14px] shadow-sm outline-none font-medium"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-400 ml-1">To</label>
                                <input
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[14px] shadow-sm outline-none font-medium"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>

                            {/* Times Row */}
                            <div className="space-y-1.5">
                                <div className="relative">
                                    <input
                                        className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[14px] shadow-sm outline-none font-mono"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                    <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <div className="relative">
                                    <input
                                        className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-zinc-900 focus:ring-0 transition-colors text-[14px] shadow-sm outline-none font-mono"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                    <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
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
