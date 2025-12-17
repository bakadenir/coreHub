
import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

interface AddLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddLinkModal({ isOpen, onClose }: AddLinkModalProps) {
    const { showToast } = useToast();

    const handleSave = () => {
        showToast('Link added successfully!', 'success');
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
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Add Link</h2>
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
                    {/* Link URL */}
                    <div className="space-y-2.5">
                        <label className="block text-sm font-medium text-gray-500" htmlFor="link-url">Link URL</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="material-icons-outlined text-gray-400 text-[20px] group-focus-within:text-black transition-colors">link</span>
                            </div>
                            <input
                                className="w-full bg-white border border-gray-300 rounded-lg pl-11 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                                id="link-url"
                                placeholder="e.g. https://example.com/awesome-article"
                                type="url"
                            />
                        </div>
                    </div>

                    {/* Link Title */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="link-title">Link Title</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <input
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            id="link-title"
                            placeholder="e.g. My Favorite Article"
                            type="text"
                        />
                    </div>

                    {/* Brief Description */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between">
                            <label className="block text-sm font-medium text-gray-500" htmlFor="link-description">Brief Description</label>
                            <span className="text-xs text-gray-400">Optional</span>
                        </div>
                        <textarea
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-black focus:ring-0 transition-colors text-[15px] min-h-[70px] resize-none shadow-sm outline-none"
                            id="link-description"
                            placeholder="A short summary or your thoughts..."
                        ></textarea>
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
                        Save Link
                    </button>
                </div>
            </div>
        </div>
    );
}
