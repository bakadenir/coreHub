// Skeleton Loading Components

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
            ))}
        </div>
    );
}

export function SkeletonCircle({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };
    return <Skeleton className={`${sizeClasses[size]} rounded-full`} />;
}

// Activity Card Skeleton
export function ActivityCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-[160px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 rounded" />
                    <Skeleton className="w-24 h-4" />
                </div>
                <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            {/* Content */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-32 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-28 h-4" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="w-36 h-4" />
                </div>
            </div>
        </div>
    );
}

// Full Activity Cards Grid Skeleton
export function ActivityCardsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
        </div>
    );
}

// Widget Skeleton for sidebar
export function WidgetSkeleton({ height = 'h-32' }: { height?: string }) {
    return (
        <div className={`bg-white border border-gray-200 rounded-xl p-5 ${height}`}>
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-20 h-4" />
            </div>
            <div className="flex justify-center items-center h-16">
                <Skeleton className="w-24 h-8" />
            </div>
        </div>
    );
}

// Dashboard Main Area Skeleton
export function DashboardSkeleton() {
    return (
        <div className="flex flex-col h-full gap-6">
            {/* Main Widget Area */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center">
                <Skeleton className="w-64 h-32 mb-4" />
                <Skeleton className="w-48 h-6" />
            </div>
            {/* Activity Cards */}
            <ActivityCardsSkeleton />
        </div>
    );
}
