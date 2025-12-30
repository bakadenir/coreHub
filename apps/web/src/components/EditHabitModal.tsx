import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { habitsApi } from '../lib';
import type { Habit } from '../types';
import { X } from 'lucide-react';

interface EditHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    habit: Habit | null;
}

export default function EditHabitModal({ isOpen, onClose, habit }: EditHabitModalProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [frequency, setFrequency] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 3]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load habit data when modal opens
    useEffect(() => {
        if (isOpen && habit) {
            setName(habit.name || '');
            setFrequency(habit.frequency?.toLowerCase() || 'daily');
            setStartDate(habit.startDate || '');
            setReminderTime(habit.time || '09:00');
            setSelectedDays(habit.specificDays || [1, 3]);
        }
    }, [isOpen, habit]);

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

    if (!isOpen || !habit) return null;

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    // Helper to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

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
            const result = await habitsApi.update(habit.id, {
                name: name.trim(),
                frequency: frequency.toLowerCase(),
                // Send specificDays when frequency is weekly and days are selected
                specificDays: frequency === 'weekly' && selectedDays.length > 0 ? selectedDays : undefined,
                startDate: startDate || undefined,
                reminderTime: reminderTime || undefined,
            });

            if (result.success) {
                showToast('Habit updated successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to update habit', 'error');
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Edit Habit</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-h-[70vh]">
                    {/* Habit Name */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">Habit Name *</label>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g., Meditate for 10 mins"
                            type="text"
                            value={name}
                            onChange={(e) => setName(toTitleCase(e.target.value))}
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

                    {/* Date & Reminder */}
                    <div className="grid grid-cols-2 gap-x-4 pt-1">
                        <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-500">Start Date</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
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
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
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
                        className="px-6 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Update Habit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
