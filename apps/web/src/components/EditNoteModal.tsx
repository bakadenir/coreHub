import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { notesApi } from '../lib';
import type { Note } from '../types';
import { X } from 'lucide-react';

interface EditNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    note: Note | null;
}

export default function EditNoteModal({ isOpen, onClose, note }: EditNoteModalProps) {
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load note data when modal opens
    useEffect(() => {
        if (isOpen && note) {
            setTitle(note.title || '');
            setContent(note.content || '');
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
            showToast('Please enter a note title', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await notesApi.update(String(note.id), {
                title: title.trim(),
                content: content.trim() || undefined,
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
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[540px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Edit Note</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 max-h-[70vh]">
                    {/* Note Title */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Note Title *</label>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g. Ideas for Weekend Trip"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(toTitleCase(e.target.value))}
                        />
                    </div>

                    {/* Note Content */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Note Content</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] min-h-[150px] resize-none shadow-sm outline-none"
                            placeholder="Jot down thoughts, links, or ideas..."
                            value={content}
                            onChange={(e) => setContent(toSentenceCase(e.target.value))}
                        ></textarea>
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
                        {isSubmitting ? 'Saving...' : 'Update Note'}
                    </button>
                </div>
            </div>
        </div>
    );
}
