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
        <div className="bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 min-h-[160px]">
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
        <div className={`bg-[#fdfdfd] border border-gray-200 rounded-xl p-5 ${height}`}>
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
            <div className="flex-1 bg-[#fdfdfd] border border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center">
                <Skeleton className="w-64 h-32 mb-4" />
                <Skeleton className="w-48 h-6" />
            </div>
            {/* Activity Cards */}
            <ActivityCardsSkeleton />
        </div>
    );
}

// Notification Item Skeleton
export function NotificationSkeleton() {
    return (
        <div className="flex items-start gap-4 p-4 bg-white border border-gray-100 rounded-xl">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
            </div>
            <Skeleton className="w-16 h-3" />
        </div>
    );
}

// Notification List Skeleton
export function NotificationListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <NotificationSkeleton key={i} />
            ))}
        </div>
    );
}

// Note Card Skeleton
export function NoteCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 h-40">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-32 h-5" />
                <Skeleton className="w-4 h-4 rounded" />
            </div>
            <div className="space-y-2">
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-full h-3" />
                <Skeleton className="w-2/3 h-3" />
            </div>
            <div className="flex items-center gap-2 mt-4">
                <Skeleton className="w-16 h-3" />
            </div>
        </div>
    );
}

// Note Cards Grid Skeleton
export function NoteGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <NoteCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Note Sidebar Item Skeleton
export function NoteSidebarSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-gray-50">
                    <Skeleton className="w-3/4 h-4 mb-2" />
                    <Skeleton className="w-1/2 h-3" />
                </div>
            ))}
        </div>
    );
}

// Schedule Event Skeleton
export function ScheduleEventSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
            <div className="text-center min-w-[50px]">
                <Skeleton className="w-12 h-4 mb-1" />
                <Skeleton className="w-8 h-3 mx-auto" />
            </div>
            <div className="flex-1 space-y-1">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-20 h-3" />
            </div>
        </div>
    );
}

// Schedule Events List Skeleton
export function ScheduleEventListSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
                <ScheduleEventSkeleton key={i} />
            ))}
        </div>
    );
}

// Donation Table Row Skeleton
export function DonationRowSkeleton() {
    return (
        <tr className="animate-pulse">
            <td className="py-4 px-6"><Skeleton className="w-20 h-4" /></td>
            <td className="py-4 px-6"><Skeleton className="w-24 h-4" /></td>
            <td className="py-4 px-6"><Skeleton className="w-32 h-4" /></td>
            <td className="py-4 px-6 text-right"><Skeleton className="w-20 h-4 ml-auto" /></td>
        </tr>
    );
}

// Donation Table Skeleton
export function DonationTableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <DonationRowSkeleton key={i} />
            ))}
        </>
    );
}

// Review Card Skeleton
export function ReviewCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-4">
                <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Skeleton className="w-24 h-4" />
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="w-4 h-4" />
                            ))}
                        </div>
                        <Skeleton className="w-16 h-3" />
                    </div>
                    <Skeleton className="w-full h-4 mb-1" />
                    <Skeleton className="w-3/4 h-4" />
                </div>
            </div>
        </div>
    );
}

// Review Cards List Skeleton
export function ReviewListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Todo Card Skeleton
export function TodoCardSkeleton() {
    return (
        <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
            <Skeleton className="w-16 h-3 shrink-0" />
            <span className="text-gray-300">|</span>
            <Skeleton className="flex-1 h-4" />
        </div>
    );
}

// Todo Cards Grid Skeleton
export function TodoGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <TodoCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Link Card Skeleton
export function LinkCardSkeleton() {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4 h-32">
            <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-3" />
                    <Skeleton className="w-1/2 h-3" />
                </div>
            </div>
        </div>
    );
}

// Link Cards Grid Skeleton
export function LinkGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <LinkCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Settings Section Skeleton
export function SettingsSkeleton() {
    return (
        <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                    <div className="space-y-1">
                        <Skeleton className="w-32 h-4" />
                        <Skeleton className="w-48 h-3" />
                    </div>
                    <Skeleton className="w-12 h-7 rounded-full" />
                </div>
            ))}
        </div>
    );
}
