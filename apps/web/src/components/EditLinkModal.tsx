import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { linksApi } from '../lib';
import type { LinkItem } from '../types';

interface EditLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    link: LinkItem | null;
}

export default function EditLinkModal({ isOpen, onClose, link }: EditLinkModalProps) {
    const { showToast } = useToast();
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load link data when modal opens
    useEffect(() => {
        if (isOpen && link) {
            setUrl(link.url || '');
            setTitle(link.title || '');
            setDescription(link.description || '');
            setTags(link.tags?.join(', ') || '');
        }
    }, [isOpen, link]);

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

    if (!isOpen || !link) return null;

    const handleSave = async () => {
        if (!url.trim()) {
            showToast('Please enter a URL', 'error');
            return;
        }

        // Basic URL validation
        try {
            new URL(url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`);
        } catch {
            showToast('Please enter a valid URL', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const tagsArray = tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t.length > 0);

            const result = await linksApi.update(String(link.id), {
                url: url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`,
                title: title.trim() || undefined,
                description: description.trim() || undefined,
                tags: tagsArray.length > 0 ? tagsArray : undefined,
            });

            if (result.success) {
                showToast('Link updated successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to update link', 'error');
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Edit Link</h2>
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
                    {/* URL */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">URL *</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="https://example.com"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>

                    {/* Title */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500">Title</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="Link title"
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
                            placeholder="What is this link about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500">Tags</label>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="design, inspiration, tools (comma separated)"
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                        />
                        <p className="text-xs text-gray-400">Separate tags with commas</p>
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
                        {isSubmitting ? 'Saving...' : 'Update Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
