import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { todosApi } from '../lib';
import { X } from 'lucide-react';

const LIST_COLORS = ['blue', 'green', 'purple', 'orange', 'pink', 'red', 'yellow', 'gray'];

interface AddTodoListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddTodoListModal({ isOpen, onClose, onSuccess }: AddTodoListModalProps) {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [color, setColor] = useState('blue');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setName('');
            setColor('blue');
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

    const getListColor = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'bg-blue-500',
            green: 'bg-green-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            pink: 'bg-pink-500',
            red: 'bg-red-500',
            yellow: 'bg-yellow-500',
            gray: 'bg-gray-500',
        };
        return colorMap[color] || 'bg-blue-500';
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast('Please enter a list name', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await todosApi.createList({
                name: name.trim(),
                color: color,
            });

            if (result.success) {
                showToast('List created', 'success');
                if (onSuccess) onSuccess();
                onClose();
            } else {
                showToast(result.error || 'Failed to create list', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-[440px] flex flex-col bg-[#fdfdfd] border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-10 text-gray-900 animate-fade-in-up">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h2 className="text-lg font-bold tracking-tight text-gray-900">Create New List</h2>
                    <button
                        onClick={onClose}
                        className="group p-1 rounded-md hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-400 group-hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    {/* List Name */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">List Name</label>
                        <input
                            className="w-full bg-[#fdfdfd] border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-zinc-900 focus:ring-0 transition-colors text-[15px] shadow-sm outline-none"
                            placeholder="e.g., Work, Shopping, Personal"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* Color Selection */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-500">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {LIST_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className={`w-8 h-8 rounded-full transition-all ${getListColor(c)} ${color === c ? 'ring-2 ring-offset-2 ring-zinc-900 scale-110' : 'hover:scale-105 opacity-80 hover:opacity-100'
                                        }`}
                                />
                            ))}
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
                        disabled={isSubmitting || !name.trim()}
                        className="px-6 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Creating...' : 'Create List'}
                    </button>
                </div>
            </div>
        </div>
    );
}
