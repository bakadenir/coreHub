import { useEffect, useRef } from 'react';

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
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

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
            icon: 'delete_forever',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            buttonBg: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-yellow-100',
            iconColor: 'text-yellow-600',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        },
        default: {
            icon: 'help_outline',
            iconBg: 'bg-gray-100',
            iconColor: 'text-gray-600',
            buttonBg: 'bg-primary hover:bg-gray-800',
        },
    };

    const styles = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!isLoading ? onClose : undefined}
            />

            {/* Dialog */}
            <div
                ref={dialogRef}
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 fade-in duration-200"
            >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                    <span className={`material-icons-outlined text-2xl ${styles.iconColor}`}>
                        {styles.icon}
                    </span>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-text-primary text-center mb-2">
                    {title}
                </h3>
                <p className="text-sm text-text-secondary text-center mb-6">
                    {message}
                </p>

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
                        disabled={isLoading}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${styles.buttonBg} rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                    >
                        {isLoading && (
                            <span className="material-icons-outlined text-[16px] animate-spin">refresh</span>
                        )}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
