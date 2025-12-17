import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '../lib/api';

interface UseApiState<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
}

export function useApi<T>(
    fetchFn: () => Promise<ApiResponse<T>>,
    deps: unknown[] = []
) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        isLoading: true,
        error: null,
    });

    const refetch = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const result = await fetchFn();
            if (result.success && result.data) {
                setState({ data: result.data, isLoading: false, error: null });
            } else {
                setState({ data: null, isLoading: false, error: result.error || 'Failed to fetch' });
            }
        } catch (err) {
            setState({ data: null, isLoading: false, error: 'Network error' });
        }
    }, [fetchFn]);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { ...state, refetch };
}

// Reusable loading spinner component
export function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-500">{message}</span>
        </div>
    );
}

// Empty state component
export function EmptyState({ message, icon = 'inbox' }: { message: string; icon?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-icons-outlined text-6xl text-gray-300 mb-4">{icon}</span>
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

// Error state component
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="material-icons-outlined text-6xl text-red-300 mb-4">error_outline</span>
            <p className="text-red-600 mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}
