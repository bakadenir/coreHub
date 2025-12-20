import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { schedulesApi } from '../lib';
import type { ScheduleEvent } from '../types';

interface EditScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: ScheduleEvent | null;
}

export default function EditScheduleModal({ isOpen, onClose, event }: EditScheduleModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('10:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load event data when modal opens
    useEffect(() => {
        if (isOpen && event) {
            setTitle(event.title || '');
            setDescription(event.description || '');
            setLocation(event.location || '');

            // Parse startTime ISO string
            if (event.startTime) {
                const date = new Date(event.startTime);
                setStartDate(date.toISOString().split('T')[0]);
                setStartTime(date.toTimeString().slice(0, 5));
            }

            // Parse endTime if exists
            if (event.endTime) {
                const date = new Date(event.endTime);
                setEndDate(date.toISOString().split('T')[0]);
                setEndTime(date.toTimeString().slice(0, 5));
            } else {
                setEndDate('');
                setEndTime('');
            }
        }
    }, [isOpen, event]);

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

    if (!isOpen || !event) return null;

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
            // Combine date and time into ISO string
            const startTimeISO = `${startDate}T${startTime}:00`;
            const endTimeISO = endDate && endTime ? `${endDate}T${endTime}:00` : undefined;

            const result = await schedulesApi.update(String(event.id), {
                title: title.trim(),
                description: description.trim() || undefined,
                location: location.trim() || undefined,
                startTime: startTimeISO,
                endTime: endTimeISO,
            });

            if (result.success) {
                showToast('Schedule updated successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to update schedule', 'error');
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
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] flex flex-col bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Edit Schedule</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <span className="material-icons-outlined text-gray-400 group-hover:text-black text-[20px]">
                            close
                        </span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 max-h-[70vh]">
                    {/* Event Title */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Event Title *</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g. Project Review Meeting"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Description</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] min-h-[100px] resize-none shadow-sm outline-none"
                            placeholder="Enter event details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Location */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Location</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons-outlined text-gray-400 text-[20px] group-focus-within:text-black transition-colors">location_on</span>
                            </div>
                            <input
                                className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                placeholder="e.g. Conference Room A or Zoom"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Start Date & Time */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Start Date & Time *</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* End Date & Time */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">End Date & Time</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
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
                        className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Update Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}
