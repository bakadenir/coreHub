import { useEffect, useRef, useState } from 'react';
import { Trash2, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    isLoading?: boolean;
    confirmText?: string; // If provided, user must type this text to enable confirm button
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    isLoading = false,
    confirmText,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [typedText, setTypedText] = useState('');

    // Reset typed text when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setTypedText('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isLoading) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose, isLoading]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <Trash2 size={24} />,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: <AlertTriangle size={24} />,
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        },
        default: {
            icon: <HelpCircle size={24} />,
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
            buttonBg: 'bg-primary hover:bg-zinc-800',
        },
    };

    const styles = variantStyles[variant];

    // Check if confirm is allowed
    const isConfirmDisabled = isLoading || (!!confirmText && typedText.toLowerCase() !== confirmText.toLowerCase());

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-[#fdfdfd] rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 fade-in duration-200"
            >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4 ${styles.iconColor}`}>
                    {styles.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-text-primary text-center mb-2">
                    {title}
                </h3>
                <p className="text-sm text-text-secondary text-center mb-6">
                    {message}
                </p>

                {/* Type to confirm input */}
                {confirmText && (
                    <div className="mb-6">
                        <label className="block text-sm text-gray-600 mb-2 text-center">
                            Type <span className="font-bold text-red-600">"{confirmText}"</span> to confirm
                        </label>
                        <input
                            type="text"
                            value={typedText}
                            onChange={(e) => setTypedText(e.target.value)}
                            placeholder={confirmText}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-center text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                            autoFocus
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-text-primary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${styles.buttonBg} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                    >
                        {isLoading && (
                            <RefreshCw size={16} className="animate-spin" />
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

