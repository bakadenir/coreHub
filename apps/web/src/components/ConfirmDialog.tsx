import { useEffect, useRef, useState } from 'react';
import { X, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: 'danger' | 'warning' | 'default';
    isLoading?: boolean;
    confirmText?: string; // If provided, user must type this text to enable confirm button
    itemName?: string; // Name of item being deleted (shown in title)
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    variant = 'danger',
    isLoading = false,
    confirmText,
    itemName,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const [typedText, setTypedText] = useState('');

    // Reset typed text when dialog closes
    useEffect(() => {
        if (!isOpen) {
            // Defer to avoid synchronous setState warning
            const timeout = setTimeout(() => setTypedText(''), 0);
            return () => clearTimeout(timeout);
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
            icon: <AlertTriangle size={20} />,
            iconBg: 'bg-gray-900',
            iconColor: 'text-white',
            buttonBg: 'bg-gray-900 hover:bg-gray-800 text-white',
            warningBg: 'bg-gray-900',
        },
        warning: {
            icon: <AlertTriangle size={20} />,
            iconBg: 'bg-yellow-500',
            iconColor: 'text-white',
            buttonBg: 'bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700',
            warningBg: 'bg-yellow-500',
        },
        default: {
            icon: <HelpCircle size={20} />,
            iconBg: 'bg-gray-500',
            iconColor: 'text-white',
            buttonBg: 'bg-primary hover:bg-zinc-800 text-white',
            warningBg: 'bg-gray-500',
        },
    };

    const styles = variantStyles[variant];

    // Check if confirm is allowed
    const isConfirmDisabled = isLoading || (!!confirmText && typedText.toLowerCase() !== confirmText.toLowerCase());

    // Display title with item name if provided
    const displayTitle = itemName ? `Confirm deletion of ${itemName}` : title;

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
                className="relative bg-[#fdfdfd] rounded-xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 fade-in duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900">
                        {displayTitle}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                    {/* Warning Box */}
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-4 ${styles.warningBg}`}>
                        <div className={`${styles.iconColor}`}>
                            {styles.icon}
                        </div>
                        <span className="text-sm font-medium text-white">
                            This action cannot be undone.
                        </span>
                    </div>

                    {/* Explanation */}
                    <p className="text-sm text-gray-600 mb-5">
                        {message}
                    </p>

                    {/* Type to confirm input */}
                    {confirmText && (
                        <div className="mb-5">
                            <label className="block text-sm text-gray-700 mb-2">
                                Type <span className="font-semibold">{confirmText}</span> to confirm.
                            </label>
                            <input
                                type="text"
                                value={typedText}
                                onChange={(e) => setTypedText(e.target.value)}
                                placeholder={`Type ${confirmText} in here`}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Confirm Button (Full Width) */}
                    <button
                        onClick={onConfirm}
                        disabled={isConfirmDisabled}
                        className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles.buttonBg}`}
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
