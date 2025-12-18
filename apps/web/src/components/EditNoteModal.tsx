import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { notesApi } from '../lib';
import type { Note } from '../types';

interface EditNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | null;
}

export default function EditNoteModal({ isOpen, onClose, note }: EditNoteModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tag, setTag] = useState('');
    const [reminderDate, setReminderDate] = useState('');
    const [reminderTime, setReminderTime] = useState('09:00');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load note data when modal opens
    useEffect(() => {
        if (isOpen && note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setTag(note.tag || '');

            // Parse reminder if exists
            if (note.reminderAt) {
                const date = new Date(note.reminderAt);
                setReminderDate(date.toISOString().split('T')[0]);
                setReminderTime(date.toTimeString().slice(0, 5));
            } else {
                setReminderDate('');
                setReminderTime('09:00');
            }
        }
    }, [isOpen, note]);

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

    if (!isOpen || !note) return null;

    const handleSave = async () => {
        if (!title.trim()) {
            showToast('Please enter a note title', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // Combine date and time for reminder
            let reminderAt: string | undefined;
            if (reminderDate && reminderTime) {
                reminderAt = `${reminderDate}T${reminderTime}:00`;
            }

            const result = await notesApi.update(String(note.id), {
                title: title.trim(),
                content: content.trim() || undefined,
                tag: tag.trim() || undefined,
                reminderAt,
            });

            if (result.success) {
                showToast('Note updated successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to update note', 'error');
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Edit Note</h2>
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
                    {/* Note Title */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Note Title *</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g. Ideas for Weekend Trip"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Note Content */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Note Content</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] min-h-[150px] resize-none shadow-sm outline-none"
                            placeholder="Jot down thoughts, links, or ideas..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Tag */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Tag</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g. Work, Personal, Ideas"
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                        />
                    </div>

                    {/* Set Reminder */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Set Reminder (Optional)</label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative group">
                                <input
                                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-base font-mono shadow-sm outline-none"
                                    type="date"
                                    value={reminderDate}
                                    onChange={(e) => setReminderDate(e.target.value)}
                                />
                            </div>
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
                        {isSubmitting ? 'Saving...' : 'Update Note'}
                    </button>
                </div>
            </div>
        </div>
    );
}
