
import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

interface AddScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddScheduleModal({ isOpen, onClose }: AddScheduleModalProps) {
    const { showToast } = useToast();

    const handleSave = () => {
        showToast('Schedule added successfully!', 'success');
        onClose();
    };

    // Prevent scrolling when modal is open and compensate for scrollbar width
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Schedule</h2>
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
                        <label className="block text-sm font-medium text-gray-500" htmlFor="event-title">Event Title</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="event-title"
                            placeholder="e.g. Project Review Meeting"
                            type="text"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="event-description">Description</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] min-h-[100px] resize-none shadow-sm outline-none"
                            id="event-description"
                            placeholder="Enter event details..."
                        ></textarea>
                    </div>

                    {/* Location */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500" htmlFor="event-location">Location</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons-outlined text-gray-400 text-[20px] group-focus-within:text-black transition-colors">location_on</span>
                            </div>
                            <input
                                className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                id="event-location"
                                placeholder="e.g. Conference Room A"
                                type="text"
                            />
                        </div>
                    </div>

                    {/* Start Date & Time */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Start Date & Time</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="date"
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="time"
                                    defaultValue="09:00"
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
                                />
                            </div>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="time"
                                    defaultValue="10:00"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2.5 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg shadow-black/5"
                    >
                        Save Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}
