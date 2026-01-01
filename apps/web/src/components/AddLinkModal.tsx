import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { linksApi } from '../lib';
import { X, Link as LinkIcon } from 'lucide-react';

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddLinkModal({ isOpen, onClose }: AddLinkModalProps) {
    const { showToast } = useToast();
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setUrl('');
            setTitle('');
            setDescription('');
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
        if (!url.trim()) {
            showToast('Please enter a URL', 'error');
            return;
        }

        // Basic URL validation
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch {
            showToast('Please enter a valid URL', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await linksApi.create({
                url: url.startsWith('http') ? url : `https://${url}`,
                title: title.trim() || undefined,
                description: description.trim() || undefined,
            });

            if (result.success) {
                showToast('Link added successfully!', 'success');
                onClose();
            } else {
                showToast(result.error || 'Failed to add link', 'error');
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Link</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 max-h-[70vh]">
                    {/* Link URL */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="link-url">Link URL *</label>
                            <span className="text-xs text-gray-400">{url.length}/500</span>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <LinkIcon size={20} className="text-gray-400 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                id="link-url"
                                placeholder="e.g. https://example.com/awesome-article"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value.slice(0, 500))}
                                maxLength={500}
                            />
                        </div>
                    </div>

                    {/* Link Title */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="link-title">Link Title</label>
                            <span className="text-xs text-gray-400">{title.length}/100</span>
                        </div>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="link-title"
                            placeholder="e.g. My Favorite Article"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(toTitleCase(e.target.value.slice(0, 100)))}
                            maxLength={100}
                        />
                    </div>

                    {/* Brief Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="link-description">Description</label>
                            <span className="text-xs text-gray-400">{description.length}/200</span>
                        </div>
                        <textarea
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] min-h-[70px] resize-none shadow-sm outline-none"
                            id="link-description"
                            placeholder="A short summary or your thoughts..."
                            value={description}
                            onChange={(e) => setDescription(toSentenceCase(e.target.value.slice(0, 200)))}
                            maxLength={200}
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
                        {isSubmitting ? 'Saving...' : 'Save Link'}
                    </button>
                </div>
            </div>
        </div>
    );
}
