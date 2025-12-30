import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '../lib/api';
import { renderIcon } from '../lib/iconMap';
import { AlertCircle } from 'lucide-react';

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

// Table skeleton for list views
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-[#fdfdfd] rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Header skeleton */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`col-span-${i === 1 ? '5' : '2'}`}>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                ))}
            </div>
            {/* Row skeletons */}
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center border-b border-gray-100">
                    <div className="col-span-12 md:col-span-5 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="flex flex-col gap-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                            <div className="h-3 bg-gray-100 rounded animate-pulse w-24"></div>
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-2 flex md:justify-center">
                        <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16"></div>
                    </div>
                    <div className="col-span-6 md:col-span-2 flex md:justify-center">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="col-span-12 md:col-span-2 flex md:justify-center">
                        <div className="h-8 bg-gray-100 rounded-md animate-pulse w-24"></div>
                    </div>
                    <div className="col-span-12 md:col-span-1 flex justify-end">
                        <div className="h-6 w-6 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Card grid skeleton for Notes/Links
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-[#fdfdfd] rounded-xl border border-gray-200 p-5 min-h-[180px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                        <div className="h-5 w-5 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5"></div>
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <div className="h-6 bg-gray-100 rounded-full animate-pulse w-16"></div>
                        <div className="h-6 bg-gray-100 rounded-full animate-pulse w-12"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Empty state component
export function EmptyState({ message, icon = 'inbox' }: { message: string; icon?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="mb-4">{renderIcon(icon, { size: 64, className: 'text-gray-300' })}</span>
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

// Error state component
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle size={64} className="text-red-300 mb-4" />
            <p className="text-red-600 mb-4">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    );
}

