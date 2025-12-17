import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { habitsApi } from '../lib';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]); // Tue, Thu
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setDescription('');
            setFrequency('daily');
            setStartDate('');
            setReminderTime('09:00');
            setSelectedDays([1, 3]);
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

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const toggleDay = (index: number) => {
        setSelectedDays(prev =>
            prev.includes(index)
                ? prev.filter(d => d !== index)
                : [...prev, index]
        );
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Please enter a habit name', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await habitsApi.create({
                name: name.trim(),
                description: description.trim() || undefined,
                frequency: frequency.toLowerCase(),
                specificDays: frequency === 'specific' ? selectedDays : undefined,
                startDate: startDate || undefined,
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Habit</h2>
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
                    {/* Habit Name */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Habit Name *</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g., Meditate for 10 mins"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
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
                            placeholder="Explain why this habit matters to you"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-500">Frequency</label>
                        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg border border-transparent">
                            {[{ label: 'Daily', value: 'daily' }, { label: 'Weekly', value: 'weekly' }, { label: 'Specific Days', value: 'specific' }].map((option) => (
                                <label key={option.value} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        className="peer sr-only"
                                        checked={frequency === option.value}
                                        onChange={() => setFrequency(option.value)}
                                    />
                                    <div className="flex items-center justify-center py-2 text-sm font-medium text-gray-500 rounded-md transition-all peer-checked:bg-white peer-checked:text-black peer-checked:shadow-sm hover:text-black">
                                        {option.label}
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Days Selection */}
                        {frequency === 'specific' && (
                            <div className="flex items-center justify-between pt-1 gap-2">
                                {days.map((day, index) => {
                                    const isSelected = selectedDays.includes(index);
                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => toggleDay(index)}
                                            className={`w-10 h-10 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-all focus:outline-none ${isSelected
                                                ? 'bg-black text-white border border-black shadow-md'
                                                : 'border border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-black'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Date & Reminder */}
                    <div className="grid grid-cols-2 gap-x-4 pt-1">
                        <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-500">Start Date</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-500">Reminder</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
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
                        {isSubmitting ? 'Saving...' : 'Save Habit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
