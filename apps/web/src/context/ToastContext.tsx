/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = 'success') => {
        // Prevent duplicate toasts with the same message
        setToasts((prev) => {
            // If same message already exists, don't add new toast
            if (prev.some((t) => t.message === message)) {
                return prev;
            }
            const id = Math.random().toString(36).substring(2, 9);
            return [...prev, { id, message, type }];
        });
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    const bgColors = {
        success: 'bg-zinc-900 text-white',
        error: 'bg-red-600 text-white',
        info: 'bg-[#fdfdfd] text-black border border-gray-200',
    };

    return (
        <div
            className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in-up flex items-center gap-2 min-w-[300px] ${bgColors[toast.type]}`}
        >
            {toast.type === 'success' && (
                <CheckCircle size={18} />
            )}
            {toast.type === 'error' && (
                <AlertCircle size={18} />
            )}
            {toast.type === 'info' && (
                <Info size={18} />
            )}
            <span>{toast.message}</span>
        </div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
