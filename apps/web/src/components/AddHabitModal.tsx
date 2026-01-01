import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { habitsApi } from '../lib';
import { X } from 'lucide-react';
import { iconMap } from '../lib/iconMap';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddHabitModal({ isOpen, onClose }: AddHabitModalProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('habit_check');
    const [frequency, setFrequency] = useState('daily');
    const [startDate, setStartDate] = useState('');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            setStartDate('');
            setReminderTime('09:00');
            setSelectedDays([]);
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

    // Helper to capitalize first letter of each word
    const toTitleCase = (str: string) => {
        return str.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date();
    const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
                icon: icon,
                frequency: frequency.toLowerCase(),
                // Send specificDays when frequency is weekly and days are selected
                specificDays: frequency === 'weekly' && selectedDays.length > 0 ? selectedDays : undefined,
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
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Habit</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-h-[70vh]">
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
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g., Meditate for 10 mins"
                            type="text"
                            value={name}
                            onChange={(e) => setName(toTitleCase(e.target.value.slice(0, 50)))}
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

                    {/* Date & Reminder */}
                    <div className="grid grid-cols-2 gap-x-4 pt-1">
                        <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-500">Start Date</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                    type="date"
                                    min={minDate}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            <label className="block text-sm font-medium text-gray-500">Reminder</label>
                            <div className="relative group">
                                <input
                                    className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
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
                        {isSubmitting ? 'Saving...' : 'Save Habit'}
                    </button>
                </div>
            </div>
        </div>
    );
}
